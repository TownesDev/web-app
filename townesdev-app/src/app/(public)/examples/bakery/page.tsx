import { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sweet Sunrise Bakery - Fresh Baked Goods Daily',
  description:
    'Fresh artisan breads, pastries, and cakes baked daily. Visit us in downtown for the best coffee and baked goods.',
}

export default function BakeryPage() {
  return (
    <div className="min-h-screen bg-amber-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-amber-900 mb-6 font-serif">
            Sweet Sunrise Bakery
          </h1>
          <p className="text-2xl md:text-3xl text-amber-700 mb-4 italic">
            Fresh Baked Goods Daily
          </p>
          <p className="text-lg text-amber-800 max-w-2xl mx-auto mb-8">
            Experience the warmth of our artisan breads, pastries, and cakes,
            lovingly crafted each morning with the finest ingredients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#menu"
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              View Our Menu
            </a>
            <a
              href="#contact"
              className="border-2 border-amber-700 text-amber-700 hover:bg-amber-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Visit Us Today
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-amber-900 text-center mb-12">
            Our Story
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="aspect-video bg-gradient-to-br from-amber-200 to-orange-200 rounded-lg shadow-lg flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🥐</div>
                  <p className="text-amber-800 italic">
                    Artisan Baking Since 2018
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                Sweet Sunrise Bakery was born from a passion for traditional
                baking methods and a love for bringing people together over
                fresh, delicious bread and pastries.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Every morning before dawn, our bakers arrive to begin the daily
                ritual of mixing, kneading, and baking. We use only the finest
                organic flour, real butter, and locally-sourced ingredients to
                create treats that remind you of home.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Whether you&apos;re stopping by for your morning coffee and
                croissant or picking up a custom cake for a special occasion,
                we&apos;re here to make your day a little sweeter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-16 px-4 bg-amber-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-amber-900 text-center mb-12">
            Our Menu
          </h2>

          {/* Breads */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-amber-800 mb-6 border-b-2 border-amber-300 pb-2">
              Artisan Breads
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: 'Sourdough Loaf',
                  price: '$7.50',
                  desc: 'Classic tangy sourdough with a crispy crust',
                },
                {
                  name: 'Whole Wheat',
                  price: '$6.50',
                  desc: 'Hearty and nutritious with a soft texture',
                },
                {
                  name: 'French Baguette',
                  price: '$5.00',
                  desc: 'Light and airy with a golden crust',
                },
                {
                  name: 'Multigrain',
                  price: '$7.00',
                  desc: 'Packed with seeds and wholesome grains',
                },
                {
                  name: 'Ciabatta',
                  price: '$6.00',
                  desc: 'Italian-style with olive oil',
                },
                {
                  name: 'Focaccia',
                  price: '$8.00',
                  desc: 'Herb-infused with sea salt',
                },
              ].map((item) => (
                <div
                  key={item.name}
                  className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg text-amber-900">
                      {item.name}
                    </h4>
                    <span className="text-amber-700 font-bold">
                      {item.price}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pastries */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-amber-800 mb-6 border-b-2 border-amber-300 pb-2">
              Pastries & Treats
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: 'Butter Croissant',
                  price: '$4.50',
                  desc: 'Flaky layers of buttery perfection',
                },
                {
                  name: 'Chocolate Croissant',
                  price: '$5.00',
                  desc: 'Pain au chocolat with dark chocolate',
                },
                {
                  name: 'Cinnamon Roll',
                  price: '$4.75',
                  desc: 'Warm and gooey with cream cheese frosting',
                },
                {
                  name: 'Almond Croissant',
                  price: '$5.25',
                  desc: 'Filled with almond cream and toasted almonds',
                },
                {
                  name: 'Danish Pastry',
                  price: '$4.50',
                  desc: 'Fruit-filled with a sweet glaze',
                },
                {
                  name: 'Muffins',
                  price: '$3.75',
                  desc: 'Daily flavors - blueberry, chocolate chip, bran',
                },
              ].map((item) => (
                <div
                  key={item.name}
                  className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg text-amber-900">
                      {item.name}
                    </h4>
                    <span className="text-amber-700 font-bold">
                      {item.price}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Cakes */}
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-amber-800 mb-4">
              Custom Cakes
            </h3>
            <p className="text-gray-700 mb-4">
              Celebrate life&apos;s special moments with our custom-designed
              cakes. From birthdays to weddings, we create beautiful and
              delicious cakes tailored to your vision.
            </p>
            <p className="text-gray-700 mb-6">
              <strong>Starting at $45</strong> - Contact us at least 48 hours in
              advance for custom orders.
            </p>
            <a
              href="#contact"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Order a Custom Cake
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-amber-900 text-center mb-12">
            Visit Us
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-amber-800 mb-6">
                  Get In Touch
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-amber-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Address</p>
                      <p className="text-gray-700">
                        123 Main Street
                        <br />
                        Downtown District
                        <br />
                        Cityville, ST 12345
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="text-amber-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Phone</p>
                      <p className="text-gray-700">(555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="text-amber-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <p className="text-gray-700">hello@sweetsunrise.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="text-amber-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Hours</p>
                      <p className="text-gray-700">
                        Monday - Friday: 6:00 AM - 6:00 PM
                        <br />
                        Saturday - Sunday: 7:00 AM - 5:00 PM
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="font-semibold text-gray-900 mb-3">Follow Us</p>
                  <div className="flex gap-4">
                    <a
                      href="#"
                      className="text-amber-600 hover:text-amber-700 transition-colors"
                      aria-label="Facebook"
                    >
                      <Facebook size={28} />
                    </a>
                    <a
                      href="#"
                      className="text-amber-600 hover:text-amber-700 transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram size={28} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form & Map */}
            <div className="space-y-6">
              {/* Map Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg shadow-lg flex items-center justify-center border-2 border-amber-200">
                <div className="text-center p-8">
                  <MapPin className="mx-auto mb-4 text-amber-600" size={48} />
                  <p className="text-amber-800 font-semibold">Map Location</p>
                  <p className="text-amber-700 text-sm">
                    123 Main Street, Downtown District
                  </p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-amber-50 rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-bold text-amber-900 mb-4">
                  Send Us a Message
                </h3>
                <form className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-100 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-lg font-semibold mb-2">Sweet Sunrise Bakery</p>
          <p className="text-amber-200 text-sm mb-4">
            Fresh Baked Goods Daily Since 2018
          </p>
          <p className="text-amber-300 text-xs">
            © 2024 Sweet Sunrise Bakery. This is a demo website created by
            TownesDev.
          </p>
        </div>
      </footer>
    </div>
  )
}
