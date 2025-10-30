import { runQuery } from '@/lib/client'
import Link from 'next/link'

interface WebsiteProject {
  _id: string
  siteSlug: string
  theme?: { primaryColor?: string; accentColor?: string; font?: string }
  pagesEnabled?: string[]
  client?: { _id: string; name?: string }
}

async function getProject(siteSlug: string): Promise<WebsiteProject | null> {
  return runQuery(
    `*[_type=="websiteProject" && siteSlug==$siteSlug][0]{
      _id,
      siteSlug,
      theme,
      pagesEnabled,
      client-> { _id, name }
    }`,
    { siteSlug }
  )
}

async function getSiteSettings(projectId: string) {
  return runQuery(
    `*[_type=="siteSettings" && project._ref==$projectId][0]{ contactEmail, businessHours, socialLinks[] }`,
    { projectId }
  )
}

async function getPages(projectId: string) {
  return runQuery(
    `*[_type=="websitePage" && project._ref==$projectId]|order(slug asc){ slug, title, body }`,
    { projectId }
  )
}

export default async function PreviewPage({
  params,
}: {
  params: { siteSlug: string }
}) {
  const project = await getProject(params.siteSlug)
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Site not found
          </h1>
          <p className="mt-2 text-gray-600">
            No project with slug &quot;{params.siteSlug}&quot;.
          </p>
          <Link
            href="/app"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Back to portal
          </Link>
        </div>
      </div>
    )
  }

  const [settings, pages] = await Promise.all([
    getSiteSettings(project._id),
    getPages(project._id),
  ])
  const primary = project.theme?.primaryColor || '#1E2E3E'
  const accent = project.theme?.accentColor || '#D8DDE2'
  const font = project.theme?.font || 'Inter'

  return (
    <main style={{ fontFamily: font }}>
      {/* Hero */}
      <section
        className="text-white"
        style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
      >
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="text-3xl md:text-4xl font-bold">
            {project.client?.name || 'Your Brand'}
          </h1>
          <p className="mt-3 text-white/90">
            A first look at your site. We’ll tailor content once setup
            completes.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/app"
              className="bg-white/90 text-gray-900 px-4 py-2 rounded-md hover:bg-white"
            >
              Back to portal
            </Link>
            <Link
              href="/app/plans"
              className="bg-black/20 border border-white/40 px-4 py-2 rounded-md hover:bg-black/30"
            >
              Manage plan
            </Link>
          </div>
        </div>
      </section>

      {/* Pages */}
      <section className="mx-auto max-w-4xl px-6 py-10">
        <h2 className="text-xl font-semibold text-gray-900">Enabled pages</h2>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {(
            (pages && pages.length
              ? pages
              : (project.pagesEnabled || ['home', 'about', 'contact']).map(
                  (slug) => ({ slug, title: slug, body: '' })
                )) as Array<{ slug: string; title?: string; body?: string }>
          ).map((p) => (
            <article key={p.slug} className="border rounded-md p-4 bg-white">
              <h3 className="font-semibold text-gray-900">
                {p.title || p.slug}
              </h3>
              {p.body && <p className="mt-1 text-gray-700">{p.body}</p>}
              {!p.body && (
                <p className="mt-1 text-gray-500">Content coming soon.</p>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Contact info */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
        <div className="mt-2 text-gray-700">
          <p>Email: {settings?.contactEmail || 'hello@example.com'}</p>
          <p>Hours: {settings?.businessHours || 'Mon–Fri'}</p>
        </div>
      </section>
    </main>
  )
}
