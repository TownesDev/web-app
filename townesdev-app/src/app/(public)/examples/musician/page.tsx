import { Metadata } from 'next'
import {
  Music,
  Calendar,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from 'lucide-react'
import {
  getMaintenanceMetadata,
  isMaintenanceMode,
} from '@/lib/maintenance'

export function generateMetadata(): Metadata {
  if (isMaintenanceMode()) return getMaintenanceMetadata()

  return {
    title: 'The Midnight Collective - Alternative Rock Band',
    description:
      'Official website for The Midnight Collective. Listen to our music, check tour dates, and connect with us.',
  }
}

export default function MusicianPage() {
  if (isMaintenanceMode()) return null

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-slate-900 to-black py-20 px-4 min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0YzAtNiA0LjctMTEgMTAuNS0xMUg2MHYxMy41YzAgNS44LTUgMTAuNS0xMSAxMC41cy0xMC00LjctMTAtMTAuNXpNMCAxNGMwLTYgNC43LTExIDEwLjUtMTFIMjR2MTMuNWMwIDUuOC01IDEwLjUtMTEgMTAuNVM0IDE5LjggNCAxNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <Music className="mx-auto mb-6 text-purple-400" size={80} />
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            The Midnight Collective
          </h1>
          <p className="text-2xl md:text-3xl text-purple-300 mb-4 italic">
            Alternative Rock from the Heart
          </p>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Raw energy meets melodic storytelling. Experience our unique blend
            of atmospheric rock and introspective lyrics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#music"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Listen Now
            </a>
            <a
              href="#shows"
              className="border-2 border-purple-500 text-purple-300 hover:bg-purple-900/50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Tour Dates
            </a>
          </div>

          {/* Social Links */}
          <div className="mt-12 flex justify-center gap-6">
            <a
              href="#"
              className="text-gray-400 hover:text-purple-400 transition-colors"
              aria-label="Spotify"
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <Music size={24} />
              </div>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-purple-400 transition-colors"
              aria-label="YouTube"
            >
              <Youtube size={28} />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-purple-400 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={28} />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-purple-400 transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={28} />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-purple-400 transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={28} />
            </a>
          </div>
        </div>
      </section>

      {/* Music Section */}
      <section id="music" className="py-16 px-4 bg-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Our Music
          </h2>

          {/* Featured Album */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-8 shadow-2xl mb-12 border border-purple-900/50">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-lg flex items-center justify-center">
                  <div className="text-center p-8">
                    <Music className="mx-auto mb-4 text-white" size={80} />
                    <p className="text-white text-2xl font-bold">
                      Echoes in the Dark
                    </p>
                    <p className="text-purple-200 text-lg">Latest Album 2024</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Echoes in the Dark
                </h3>
                <p className="text-gray-300">
                  Our most ambitious album yet, exploring themes of isolation,
                  connection, and the search for meaning in a chaotic world.
                  Featuring 12 tracks of raw emotion and powerful melodies.
                </p>
                <div className="space-y-2 pt-4">
                  <p className="text-sm text-purple-400 font-semibold">
                    LISTEN ON:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors">
                      Spotify
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors">
                      Apple Music
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors">
                      Bandcamp
                    </button>
                    <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors">
                      YouTube Music
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Track List */}
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Midnight Drive', duration: '4:23', featured: true },
              { title: 'Lost in Translation', duration: '3:45' },
              { title: 'Neon Dreams', duration: '5:12', featured: true },
              { title: 'Silent Screams', duration: '4:01' },
              { title: 'Broken Compass', duration: '3:58' },
              { title: 'City Lights', duration: '4:34' },
              { title: 'Fade to Grey', duration: '5:45' },
              { title: 'Echoes (Reprise)', duration: '2:15' },
            ].map((track) => (
              <div
                key={track.title}
                className={`bg-slate-900/50 rounded-lg p-4 flex justify-between items-center hover:bg-slate-700/50 transition-colors border ${
                  track.featured
                    ? 'border-purple-500/50'
                    : 'border-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Music
                    className={
                      track.featured ? 'text-purple-400' : 'text-gray-500'
                    }
                    size={20}
                  />
                  <div>
                    <p
                      className={`font-semibold ${track.featured ? 'text-purple-300' : 'text-white'}`}
                    >
                      {track.title}
                    </p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">{track.duration}</span>
              </div>
            ))}
          </div>

          {/* Music Player Mockup */}
          <div className="mt-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-8 border border-purple-900/50">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-purple-400 mb-6">
                Featured Track: &quot;Midnight Drive&quot;
              </h3>
              <div className="aspect-video max-w-3xl mx-auto bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg shadow-lg flex items-center justify-center border-2 border-purple-500/30">
                <div className="text-center p-8">
                  <Youtube className="mx-auto mb-4 text-purple-300" size={64} />
                  <p className="text-purple-200 font-semibold text-lg">
                    Music Video Player
                  </p>
                  <p className="text-purple-300 text-sm mt-2">
                    [Embedded Spotify/YouTube Player Would Go Here]
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shows Section */}
      <section id="shows" className="py-16 px-4 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Tour Dates
          </h2>
          <p className="text-center text-gray-400 mb-12">
            Catch us live on our 2024 tour
          </p>

          <div className="space-y-4 max-w-4xl mx-auto">
            {[
              {
                date: 'FRI MAR 15',
                venue: 'The Electric Lounge',
                city: 'Seattle, WA',
                status: 'Tickets',
              },
              {
                date: 'SAT MAR 23',
                venue: 'Underground Club',
                city: 'Portland, OR',
                status: 'Tickets',
              },
              {
                date: 'FRI MAR 29',
                venue: 'The Velvet Room',
                city: 'San Francisco, CA',
                status: 'Tickets',
              },
              {
                date: 'SAT APR 06',
                venue: 'Neon Palace',
                city: 'Los Angeles, CA',
                status: 'Sold Out',
              },
              {
                date: 'FRI APR 12',
                venue: 'Red Rock Bar',
                city: 'Denver, CO',
                status: 'Tickets',
              },
              {
                date: 'SAT APR 20',
                venue: 'The Basement',
                city: 'Austin, TX',
                status: 'Tickets',
              },
              {
                date: 'THU APR 25',
                venue: 'Metro Music Hall',
                city: 'Chicago, IL',
                status: 'Low Stock',
              },
              {
                date: 'SAT MAY 04',
                venue: 'Brooklyn Steel',
                city: 'Brooklyn, NY',
                status: 'Tickets',
              },
            ].map((show, index) => (
              <div
                key={index}
                className="bg-slate-800 rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-700 transition-colors border border-slate-700"
              >
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 flex-grow">
                  <div className="min-w-[100px]">
                    <p className="text-purple-400 font-bold text-sm">
                      {show.date}
                    </p>
                  </div>
                  <div className="flex-grow">
                    <p className="text-white font-semibold text-lg">
                      {show.venue}
                    </p>
                    <p className="text-gray-400 flex items-center gap-2 mt-1">
                      <MapPin size={16} />
                      {show.city}
                    </p>
                  </div>
                </div>
                <button
                  className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                    show.status === 'Sold Out'
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : show.status === 'Low Stock'
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                  disabled={show.status === 'Sold Out'}
                >
                  {show.status}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">Want us to play in your city?</p>
            <a
              href="#contact"
              className="inline-block border-2 border-purple-500 text-purple-300 hover:bg-purple-900/50 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Contact Our Booking Agent
            </a>
          </div>
        </div>
      </section>

      {/* About/Band Section */}
      <section className="py-16 px-4 bg-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            About the Band
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { name: 'Alex Rivers', role: 'Vocals / Guitar', emoji: '🎸' },
              { name: 'Sam Chen', role: 'Bass', emoji: '🎸' },
              { name: 'Jordan Blake', role: 'Drums', emoji: '🥁' },
            ].map((member) => (
              <div
                key={member.name}
                className="bg-slate-900 rounded-lg p-6 text-center border border-slate-700"
              >
                <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg mb-4 flex items-center justify-center text-6xl">
                  {member.emoji}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-purple-400">{member.role}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-lg p-8 border border-slate-700">
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              The Midnight Collective formed in 2019 when three musicians bonded
              over their shared love of atmospheric rock and honest songwriting.
              What started as late-night jam sessions in Alex&apos;s basement
              quickly evolved into something more.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              Our music explores the spaces between light and dark, hope and
              despair, connection and isolation. We believe in the power of live
              music to bring people together and create moments of genuine human
              connection in an increasingly digital world.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Get in Touch
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-purple-400 mb-4">
                  Contact
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail className="text-purple-400" size={20} />
                    <span>booking@midnightcollective.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="text-purple-400" size={20} />
                    <span>Available for festivals & private events</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-purple-400 mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    <Facebook size={28} />
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    <Instagram size={28} />
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    <Twitter size={28} />
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    <Youtube size={28} />
                  </a>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6 border border-purple-900/50">
                <h3 className="text-lg font-bold text-white mb-3">
                  Newsletter
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Get updates on new releases, tour dates, and exclusive
                  content.
                </p>
                <form className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-grow px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Join
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">
                Send a Message
              </h3>
              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-300 mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-300 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-300 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    placeholder="Your message..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-lg font-semibold text-purple-400 mb-2">
            The Midnight Collective
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Alternative Rock from the Heart
          </p>
          <p className="text-gray-500 text-xs">
            © 2024 The Midnight Collective. This is a demo website created by
            TownesDev.
          </p>
        </div>
      </footer>
    </div>
  )
}
