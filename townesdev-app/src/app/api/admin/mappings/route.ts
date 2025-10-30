import { NextRequest, NextResponse } from 'next/server'
import { requireStaff } from '@/lib/rbac/guards'
import { runAdminQuery } from '@/lib/admin/client'
import { runQuery, sanityWrite } from '@/lib/client'
import { qPlanFeatureMappings } from '@/sanity/lib/queries'

export const revalidate = 0

export async function GET() {
  await requireStaff()
  const mappings = await runAdminQuery(qPlanFeatureMappings)
  return NextResponse.json(mappings || [])
}

export async function POST(req: NextRequest) {
  await requireStaff()
  const { planId, featureId, notes } = (await req.json().catch(() => ({}))) as {
    planId?: string
    featureId?: string
    notes?: string
  }

  if (!planId || !featureId) {
    return NextResponse.json(
      { error: 'planId and featureId are required' },
      { status: 400 }
    )
  }

  // Guardrails: Ensure referenced docs exist
  const [planDoc, featureDoc] = await Promise.all([
    runQuery(`*[_type=="plan" && _id==$id][0]{ _id, name, category }`, {
      id: planId,
    }),
    runQuery(
      `*[_type=="feature" && _id==$id][0]{ _id, name, key, assetType }`,
      { id: featureId }
    ),
  ])
  if (!planDoc)
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  if (!featureDoc)
    return NextResponse.json({ error: 'Feature not found' }, { status: 404 })

  // If a mapping for this plan already exists, update it; otherwise create
  const existingAll = (await runQuery(
    `*[_type=="planFeatureMapping" && plan._ref==$planId]{ _id }`,
    { planId }
  )) as Array<{ _id: string }>

  const existing = existingAll?.[0]
  if (Array.isArray(existingAll) && existingAll.length > 1) {
    // Cleanup duplicates (keep the first)
    const dupes = existingAll.slice(1).map((d) => ({ delete: { id: d._id } }))
    if (dupes.length) await sanityWrite.mutate(dupes)
  }

  if (existing?._id) {
    await sanityWrite.mutate([
      {
        patch: {
          id: existing._id,
          set: {
            feature: { _type: 'reference', _ref: featureId },
            ...(notes ? { notes } : {}),
          },
        },
      },
    ])
    return NextResponse.json({
      _id: existing._id,
      plan: planId,
      feature: featureId,
    })
  }

  const create = await sanityWrite.mutate([
    {
      create: {
        _type: 'planFeatureMapping',
        plan: { _type: 'reference', _ref: planId },
        feature: { _type: 'reference', _ref: featureId },
        ...(notes ? { notes } : {}),
      },
    },
  ])

  return NextResponse.json(create)
}

export async function DELETE(req: NextRequest) {
  await requireStaff()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id)
    return NextResponse.json({ error: 'id is required' }, { status: 400 })

  // Verify mapping exists before delete
  const existing = await runQuery(
    `*[_type=="planFeatureMapping" && _id==$id][0]{ _id }`,
    { id }
  )
  if (!existing?._id)
    return NextResponse.json({ error: 'Mapping not found' }, { status: 404 })

  await sanityWrite.mutate([{ delete: { id } }])
  return NextResponse.json({ deleted: id })
}
