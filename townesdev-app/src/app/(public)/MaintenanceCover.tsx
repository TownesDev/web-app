import { HOLDING_MESSAGE } from '@/lib/maintenance'

export default function MaintenanceCover() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-white px-6 py-20 text-nile-blue-900"
    >
      <section
        aria-labelledby="holding-title"
        className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-6 text-center"
      >
        <h1 id="holding-title" className="text-4xl font-bold tracking-tight">
          TownesDev
        </h1>
        <p className="max-w-xl text-lg leading-8 text-gray-700">
          {HOLDING_MESSAGE}
        </p>
        <a
          href="https://donovantownes.dev"
          className="rounded-md border border-nile-blue-900 px-5 py-3 font-medium transition-colors hover:bg-nile-blue-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nile-blue-900"
        >
          View Donovan Townes
        </a>
      </section>
    </main>
  )
}
