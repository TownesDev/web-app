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
    return NextResponse.json({ error: 'planId and featureId are required' }, { status: 400 })
  }

  // If a mapping for this plan already exists, update it; otherwise create
  const existing = await runQuery(
    `*[_type=="planFeatureMapping" && plan._ref==$planId][0]{ _id }`,
    { planId }
  )

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
    return NextResponse.json({ _id: existing._id, plan: planId, feature: featureId })
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
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  await sanityWrite.mutate([{ delete: { id } }])
  return NextResponse.json({ deleted: id })
}
