import Image from 'next/image'
import Link from 'next/link'
import { AboutContent } from '../../types/cms'

interface AboutMeSectionProps {
  content?: AboutContent
  title?: string
  subtitle?: string
}

export function AboutMeSection({
  content,
  title = 'About the Founder',
  subtitle = "The developer behind TownesDev's reliable systems and clean architecture",
}: AboutMeSectionProps) {
  // Fallback content if CMS data isn't available
  const fallbackContent: AboutContent = {
    name: 'Donny Townes',
    title: 'Full-Stack Developer & Systems Architect',
    bio: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Passionate about building reliable, scalable systems that solve real-world problems. Specializing in Discord bots, automation systems, and clean architecture.',
          },
        ],
      },
    ] as unknown[],
    skills: [
      'TypeScript',
      'Node.js',
      'React',
      'Discord.js',
      'PostgreSQL',
      'Docker',
    ],
    profileImage: {
      asset: { url: '/images/profile-placeholder.jpg' },
      alt: 'Donny Townes portrait',
    },
    experience: [
      {
        company: 'TownesDev',
        position: 'Founder & Lead Developer',
        startDate: '2020-01-01',
        endDate: undefined,
        description:
          'Building custom software solutions and Discord bot platforms for businesses.',
      },
    ],
    education: [
      {
        institution: 'Self-Taught Developer',
        degree: 'Full-Stack Development',
        graduationDate: '2020-01-01',
      },
    ],
  }

  const aboutContent = content || fallbackContent

  const {
    name,
    title: jobTitle,
    bio,
    skills,
    experience,
    education,
    profileImage,
  } = aboutContent

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="py-20 px-4 bg-transparent"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2
            id="about-heading"
            className="text-4xl font-bold text-nile-blue-900 mb-4 font-heading"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Profile Image and Basic Info */}
          <div className="space-y-6">
            {profileImage && (
              <div className="relative w-80 h-80 mx-auto lg:mx-0 rounded-lg overflow-hidden shadow-lg">
                {(() => {
                  type MaybeImage =
                    | { asset?: { url?: string }; alt?: string }
                    | string
                  const pi = profileImage as MaybeImage
                  const src =
                    typeof pi === 'string'
                      ? pi
                      : pi?.asset?.url || '/images/profile-placeholder.jpg'
                  const alt =
                    typeof pi === 'string'
                      ? `${name} portrait`
                      : pi?.alt || `${name} portrait`
                  return (
                    <Image src={src} alt={alt} fill className="object-cover" />
                  )
                })()}
              </div>
            )}

            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-nile-blue-900 mb-2">
                {name}
              </h3>
              {jobTitle && (
                <p className="text-lg text-sandy-brown-600 font-medium mb-4">
                  {jobTitle}
                </p>
              )}

              {/* Core Skills */}
              {skills && skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Core Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-nile-blue-100 text-nile-blue-800 text-sm font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bio and Experience */}
          <div className="space-y-8">
            {/* Bio */}
            {bio && (
              <div>
                <h4 className="text-xl font-semibold text-nile-blue-900 mb-4">
                  Background
                </h4>
                <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
                  {Array.isArray(bio) ? (
                    (bio as Array<{ children?: Array<{ text?: string }> }>).map(
                      (block, i) => {
                        const text = (block.children || [])
                          .map((c) => c.text || '')
                          .join('')
                        return (
                          <p key={i} className="mb-4">
                            {text}
                          </p>
                        )
                      }
                    )
                  ) : (
                    <p>{String(bio)}</p>
                  )}
                </div>
              </div>
            )}

            {/* Experience */}
            {experience && experience.length > 0 && (
              <div>
                <h4 className="text-xl font-semibold text-nile-blue-900 mb-4">
                  Professional Experience
                </h4>
                <div className="space-y-4">
                  {experience.map((exp, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-sandy-brown-200 pl-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h5 className="font-semibold text-gray-900">
                          {exp.position}
                        </h5>
                        <span className="text-sm text-gray-500">
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </span>
                      </div>
                      <p className="text-sandy-brown-600 font-medium mb-2">
                        {exp.company}
                      </p>
                      {exp.description && (
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <div>
                <h4 className="text-xl font-semibold text-nile-blue-900 mb-4">
                  Education
                </h4>
                <div className="space-y-3">
                  {education.map((edu, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <h5 className="font-semibold text-gray-900">
                          {edu.degree}
                        </h5>
                        <p className="text-sandy-brown-600">
                          {edu.institution}
                        </p>
                      </div>
                      {edu.graduationDate && (
                        <span className="text-sm text-gray-500 mt-1 sm:mt-0">
                          {new Date(edu.graduationDate).getFullYear()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="pt-6 border-t border-gray-200">
              <div className="bg-nile-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-nile-blue-900 mb-2">
                  Ready to Work Together?
                </h4>
                <p className="text-nile-blue-700 mb-4">
                  Let&rsquo;s discuss how I can help bring your technical vision
                  to life with reliable, well-architected solutions.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="/contact"
                    className="bg-nile-blue-600 hover:bg-nile-blue-700 text-white px-6 py-2 rounded-lg font-medium text-center transition-colors"
                  >
                    Get In Touch
                  </a>
                  <a
                    href="#services"
                    className="border border-nile-blue-300 text-nile-blue-700 hover:bg-nile-blue-50 px-6 py-2 rounded-lg font-medium text-center transition-colors"
                  >
                    View Services
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
