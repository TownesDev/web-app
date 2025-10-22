import Image from 'next/image'

export default function MaintenanceCover() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-xl text-center p-8 rounded-md shadow-md bg-white">
        <div className="mx-auto w-40 h-20 relative mb-6">
          <Image src="/townesdev_logo_sub_light.svg" alt="TownesDev" fill className="object-contain" />
        </div>
        <h1 className="text-3xl font-bold mb-4">TownesDev — Coming Soon</h1>
        <p className="text-gray-600 mb-6">
          We’re polishing things behind the scenes. If you were invited to test, use the tester link you received to bypass this page.
        </p>
        <div className="flex gap-3 justify-center">
          <a href="/auth/signin" className="px-4 py-2 bg-nile-blue-600 text-white rounded">Sign in</a>
          <a href="/plans" className="px-4 py-2 border border-gray-200 rounded">View Plans</a>
        </div>
        <p className="text-xs text-gray-400 mt-4">Admins can bypass: /api/maintenance/bypass?redirect=/</p>
      </div>
    </div>
  )
}
