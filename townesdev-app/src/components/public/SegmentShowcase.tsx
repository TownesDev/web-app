import Link from 'next/link'
import { Store, Users, Music } from 'lucide-react'

interface SegmentCard {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}

export function SegmentShowcase() {
  const segments: SegmentCard[] = [
    {
      title: 'Small Businesses',
      description:
        'Professional websites and digital solutions to help your business grow online.',
      icon: <Store className="w-12 h-12 text-nile-blue-600" />,
      href: '/plans#small-business',
    },
    {
      title: 'Discord Communities',
      description:
        'Custom Discord bots and automation to engage and manage your community.',
      icon: <Users className="w-12 h-12 text-nile-blue-600" />,
      href: '/plans#discord',
    },
    {
      title: 'Musicians',
      description:
        'Beautiful websites and tools to showcase your music and connect with fans.',
      icon: <Music className="w-12 h-12 text-nile-blue-600" />,
      href: '/plans#musicians',
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-nile-blue-900 mb-4 font-heading">
            Built for Your Needs
          </h2>
          <p className="text-lg text-nile-blue-700 max-w-2xl mx-auto font-body">
            Choose the solution that fits your goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {segments.map((segment) => (
            <Link
              key={segment.title}
              href={segment.href}
              className="group block bg-white border-2 border-gray-200 rounded-lg p-8 hover:border-nile-blue-600 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 group-hover:scale-110 transition-transform duration-200">
                  {segment.icon}
                </div>
                <h3 className="text-xl font-semibold text-nile-blue-900 mb-3 font-heading">
                  {segment.title}
                </h3>
                <p className="text-nile-blue-700 font-body">
                  {segment.description}
                </p>
                <div className="mt-4 text-nile-blue-600 font-semibold group-hover:underline">
                  View Plans →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
