import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { runQuery, sanityWrite } from '@/lib/client'
import { ensureClientAsset } from '@/lib/entitlements'

// Minimal shared types
type Ref = { _type: 'reference'; _ref: string }

type ProvisionPayload = {
  clientId: string
  web?: {
    pages?: string[]
    theme?: { primaryColor?: string; font?: string }
    vertical?: string
  }
  discord?: { botName?: string; enabled?: boolean }
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !['admin', 'staff'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = (await req.json()) as ProvisionPayload
    if (!body?.clientId) {
      return NextResponse.json({ error: 'clientId required' }, { status: 400 })
    }

    // Load client
    const client = await runQuery(
      `*[_type=="client" && _id==$id][0]{ _id, name, email }`,
      { id: body.clientId }
    )
    if (!client?._id) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check for existing projects
    const [existingWeb, existingDiscord] = await Promise.all([
      runQuery(
        `*[_type=="websiteProject" && client._ref==$clientId][0]{ _id, siteSlug, pagesEnabled }`,
        { clientId: client._id }
      ),
      runQuery(
        `*[_type=="discordProject" && client._ref==$clientId][0]{ _id }`,
        { clientId: client._id }
      ),
    ])

    // Website project
    let websiteProject = existingWeb as {
      _id: string
      siteSlug: string
      pagesEnabled?: string[]
    } | null
    let createdWebsite = false
    if (!websiteProject) {
      const baseSlug = slugify(client.name || 'site')
      const siteSlug = `${baseSlug}-${String(client._id).slice(-4)}`
      const draft = {
        _type: 'websiteProject',
        client: { _type: 'reference', _ref: client._id } as Ref,
        siteSlug,
        status: 'provisioning',
        theme: {
          primaryColor: body.web?.theme?.primaryColor || '#1E2E3E',
          accentColor: '#D8DDE2',
          font: body.web?.theme?.font || 'Inter',
        },
        pagesEnabled:
          body.web?.pages && body.web.pages.length > 0
            ? body.web.pages
            : ['home', 'about', 'contact'],
      }
      const created = await sanityWrite.create(draft)
      websiteProject = {
        _id: created._id,
        siteSlug,
        pagesEnabled: draft.pagesEnabled,
      }
      createdWebsite = true
    }

    // Discord project (optional)
    let createdDiscord = false
    if (body.discord?.enabled && !existingDiscord) {
      await sanityWrite.create({
        _type: 'discordProject',
        client: { _type: 'reference', _ref: client._id } as Ref,
        botName: body.discord?.botName || `${client.name}'s Bot`,
        status: 'provisioning',
      })
      createdDiscord = true
    }

    // Ensure service assets exist and are linked to projects
    try {
      // Web app asset
      const webAsset = await ensureClientAsset(client._id, 'web_app')
      if (websiteProject?._id) {
        await sanityWrite.mutate([
          {
            patch: {
              id: webAsset._id,
              setIfMissing: {
                project: {
                  _type: 'reference',
                  _ref: websiteProject._id,
                } as Ref,
              },
            },
          },
        ])
      }

      // Discord asset (only if enabled/created or already exists)
      if (body.discord?.enabled) {
        const discordAsset = await ensureClientAsset(client._id, 'discord_bot')
        if (existingDiscord?._id) {
          await sanityWrite.mutate([
            {
              patch: {
                id: discordAsset._id,
                setIfMissing: {
                  project: {
                    _type: 'reference',
                    _ref: existingDiscord._id,
                  } as Ref,
                },
              },
            },
          ])
        }
      }
    } catch (assetErr) {
      console.warn('Provision: ensure/link service assets failed', assetErr)
    }

    // Per-tenant settings
    const settings = await runQuery(
      `*[_type=="siteSettings" && project._ref==$projectId][0]{ _id }`,
      { projectId: websiteProject!._id }
    )
    if (!settings) {
      await sanityWrite.create({
        _type: 'siteSettings',
        project: { _type: 'reference', _ref: websiteProject!._id } as Ref,
        contactEmail: client.email,
        businessHours: 'Monday - Friday, 9 AM - 6 PM',
        socialLinks: [],
      })
    }

    // Per-tenant pages
    const vertical = (body.web?.vertical || '').toLowerCase()
    const enabled = websiteProject?.pagesEnabled || ['home', 'about', 'contact']
    const pageTemplate = (slug: string) => {
      const name = client.name || 'Your Brand'
      const titleMap: Record<string, string> = {
        home:
          vertical === 'musician'
            ? `${name} — New music, live shows, and more`
            : vertical === 'bakery'
              ? `${name} — Freshly baked, daily`
              : vertical === 'bracelet' || vertical === 'ecommerce'
                ? `${name} — Handmade accessories`
                : `${name}`,
        about: `About ${name}`,
        contact: 'Contact',
        blog: 'Blog',
        music: 'Music',
        shows: 'Shows',
        menu: 'Menu',
        shop: 'Shop',
      }
      const bodyMap: Record<string, string> = {
        home:
          vertical === 'musician'
            ? 'Listen to the latest releases and find upcoming shows.'
            : vertical === 'bakery'
              ? 'From croissants to sourdough — baked fresh every morning.'
              : vertical === 'bracelet' || vertical === 'ecommerce'
                ? 'Explore our latest handmade bracelets and accessories.'
                : 'Welcome — your site is ready for content.',
        about: 'Share your story, values, and what makes you unique.',
        contact: 'Reach out to us for inquiries, bookings, or partnerships.',
        blog: 'Insights, news, and stories.',
        music: 'Albums, singles, and playlists.',
        shows: 'Upcoming dates and ticket links.',
        menu: 'Today’s selections and specials.',
        shop: 'Browse products and collections.',
      }
      return { title: titleMap[slug] || slug, body: bodyMap[slug] || '' }
    }

    for (const slug of enabled) {
      const exists = await runQuery(
        `*[_type=="websitePage" && project._ref==$projectId && slug==$slug][0]{ _id }`,
        { projectId: websiteProject!._id, slug }
      )
      if (!exists) {
        const content = pageTemplate(slug)
        await sanityWrite.create({
          _type: 'websitePage',
          project: { _type: 'reference', _ref: websiteProject!._id } as Ref,
          slug,
          title: content.title,
          body: content.body,
        })
      }
    }

    const origin = req.headers.get('origin') || new URL(req.url).origin
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || origin
    const previewUrl = `${baseUrl.replace(/\/$/, '')}/preview/${websiteProject!.siteSlug}`

    return NextResponse.json({
      ok: true,
      previewUrl,
      created: createdWebsite || createdDiscord,
    })
  } catch (error) {
    console.error('Admin provisioning error:', error)
    return NextResponse.json({ error: 'Provisioning failed' }, { status: 500 })
  }
}
