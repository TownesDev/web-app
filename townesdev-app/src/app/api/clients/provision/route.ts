import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getClientByUserId } from '@/lib/stripe'
import { runQuery, sanityWrite } from '@/lib/client'
import { ensureClientAsset } from '@/lib/entitlements'

type ProvisionPayload = {
  web?: {
    pages?: string[]
    theme?: { primaryColor?: string; font?: string }
    vertical?: string
  }
  discord?: { botName?: string; enabled?: boolean }
}

type Ref = { _type: 'reference'; _ref: string }
type WebsiteProjectDoc = {
  _id?: string
  _type: 'websiteProject'
  client: Ref
  siteSlug: string
  status?: 'draft' | 'provisioning' | 'ready' | 'live' | 'archived'
  theme?: { primaryColor?: string; accentColor?: string; font?: string }
  pagesEnabled?: string[]
}
type DiscordProjectDoc = {
  _id?: string
  _type: 'discordProject'
  client: Ref
  botName: string
  status?: 'draft' | 'provisioning' | 'ready' | 'live' | 'archived'
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
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const client = await getClientByUserId(session.id)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const payload = (await req.json().catch(() => ({}))) as ProvisionPayload

    // Idempotent fetch for existing projects
    const [existingWeb, existingDiscord] = await Promise.all([
      runQuery(
        `*[_type=="websiteProject" && client._ref==$clientId][0]{ _id, siteSlug, status }`,
        { clientId: client._id }
      ),
      runQuery(
        `*[_type=="discordProject" && client._ref==$clientId][0]{ _id, botName, status }`,
        { clientId: client._id }
      ),
    ])

    // Website project
    let websiteProject: WebsiteProjectDoc | null =
      (existingWeb as unknown as WebsiteProjectDoc) || null
    let createdWebsite = false
    if (!websiteProject) {
      const baseSlug = slugify(client.name || 'site')
      const siteSlug = `${baseSlug}-${String(client._id).slice(-4)}`
      const draft: WebsiteProjectDoc = {
        _type: 'websiteProject',
        client: { _type: 'reference', _ref: client._id },
        siteSlug,
        status: 'provisioning',
        theme: {
          primaryColor: payload.web?.theme?.primaryColor || '#1E2E3E',
          accentColor: '#D8DDE2',
          font: payload.web?.theme?.font || 'Inter',
        },
        pagesEnabled:
          payload.web?.pages && payload.web.pages.length > 0
            ? payload.web.pages
            : ['home', 'about', 'contact'],
      }
      websiteProject = (await sanityWrite.create(draft)) as WebsiteProjectDoc
      createdWebsite = true
    }

    // Discord project (optional)
    let discordProject: DiscordProjectDoc | null =
      (existingDiscord as unknown as DiscordProjectDoc) || null
    const wantsDiscord = Boolean(
      payload.discord?.enabled || payload.discord?.botName
    )
    let createdDiscord = false
    if (wantsDiscord && !discordProject) {
      const draft: DiscordProjectDoc = {
        _type: 'discordProject',
        client: { _type: 'reference', _ref: client._id },
        botName: payload.discord?.botName || `${client.name}'s Bot`,
        status: 'provisioning',
      }
      discordProject = (await sanityWrite.create(draft)) as DiscordProjectDoc
      createdDiscord = true
    }

    // Ensure service assets exist and link to projects
    try {
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

      if (discordProject?._id) {
        const discordAsset = await ensureClientAsset(client._id, 'discord_bot')
        await sanityWrite.mutate([
          {
            patch: {
              id: discordAsset._id,
              setIfMissing: {
                project: {
                  _type: 'reference',
                  _ref: discordProject._id,
                } as Ref,
              },
            },
          },
        ])
      }
    } catch (assetErr) {
      console.warn(
        'Client Provision: ensure/link service assets failed',
        assetErr
      )
    }

    // Seed per-tenant Site Settings (scoped to project)
    const existingSettings = await runQuery(
      `*[_type=="siteSettings" && project._ref==$projectId][0]{ _id }`,
      { projectId: websiteProject._id }
    )
    if (!existingSettings) {
      await sanityWrite.create({
        _type: 'siteSettings',
        project: { _type: 'reference', _ref: websiteProject._id },
        contactEmail: client.email,
        businessHours: 'Monday - Friday, 9 AM - 6 PM',
        socialLinks: [],
      })
    }

    // Seed per-tenant Website Pages for enabled pages
    const vertical = (payload.web?.vertical || '').toLowerCase()
    const pageTemplate = (slug: string) => {
      // Minimal vertical-aware copy
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

    const enabled = websiteProject.pagesEnabled || ['home', 'about', 'contact']
    for (const slug of enabled) {
      const exists = await runQuery(
        `*[_type=="websitePage" && project._ref==$projectId && slug==$slug][0]{ _id }`,
        { projectId: websiteProject._id, slug }
      )
      if (!exists) {
        const content = pageTemplate(slug)
        await sanityWrite.create({
          _type: 'websitePage',
          project: { _type: 'reference', _ref: websiteProject._id },
          slug,
          title: content.title,
          body: content.body,
        })
      }
    }

    const origin = req.headers.get('origin') || new URL(req.url).origin
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || origin
    const previewUrl = websiteProject?.siteSlug
      ? `${baseUrl.replace(/\/$/, '')}/preview/${websiteProject.siteSlug}`
      : undefined

    return NextResponse.json({
      ok: true,
      websiteProject: websiteProject || existingWeb,
      discordProject: discordProject || existingDiscord,
      previewUrl,
      created: createdWebsite || createdDiscord,
    })
  } catch (error) {
    console.error('Provisioning error:', error)
    return NextResponse.json({ error: 'Provisioning failed' }, { status: 500 })
  }
}
