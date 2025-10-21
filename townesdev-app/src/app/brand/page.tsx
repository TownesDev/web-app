export default function BrandPage() {
  return (
    <div className="min-h-screen bg-comet-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block p-4 bg-nile-blue-100 rounded-full mb-6">
            <div className="w-16 h-16 bg-nile-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">T</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-comet-900 mb-6 font-heading">
            TOWNESDEV
          </h1>
          <p className="text-xl text-comet-600 max-w-3xl mx-auto font-body leading-relaxed">
            Code. Systems. Foundations. — A comprehensive guide to our brand
            identity, built with structure, clarity, and purpose.
          </p>
        </div>

        {/* Brand Overview */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-comet-200">
          <h2 className="text-3xl font-bold text-comet-900 mb-6 font-heading">
            BRAND OVERVIEW
          </h2>
          <div className="prose prose-lg max-w-none font-body">
            <p className="text-comet-700 leading-relaxed mb-6">
              TownesDev is an independent development studio founded by{' '}
              <strong>Donovan Townes</strong>, dedicated to building structured,
              reliable, and purpose-driven digital systems. The brand represents
              craftsmanship, clarity, and authenticity — where every project is
              part of a greater, well-built ecosystem.
            </p>
            <div className="bg-nile-blue-50 border-l-4 border-nile-blue-500 p-6 rounded-r-lg">
              <p className="text-nile-blue-800 font-medium italic">
                &ldquo;Where ideas find structure.&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-comet-200">
          <h2 className="text-3xl font-bold text-comet-900 mb-8 font-heading">
            COLOR PALETTE
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Primary Colors */}
            <div>
              <h3 className="text-xl font-semibold text-comet-800 mb-6 font-heading">
                PRIMARY COLORS
              </h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-nile-blue-600 rounded-xl shadow-lg border-4 border-white"></div>
                  <div>
                    <div className="font-bold text-comet-900 text-lg">
                      Nile Blue 600
                    </div>
                    <div className="text-comet-600 font-mono">#3281c7</div>
                    <div className="text-sm text-comet-500 mt-1">
                      Primary actions, trust, focus
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-nile-blue-700 rounded-xl shadow-lg border-4 border-white"></div>
                  <div>
                    <div className="font-bold text-comet-900 text-lg">
                      Nile Blue 700
                    </div>
                    <div className="text-comet-600 font-mono">#27679f</div>
                    <div className="text-sm text-comet-500 mt-1">
                      Active states, depth
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Colors */}
            <div>
              <h3 className="text-xl font-semibold text-comet-800 mb-6 font-heading">
                SECONDARY COLORS
              </h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-picton-blue-500 rounded-xl shadow-lg border-4 border-white"></div>
                  <div>
                    <div className="font-bold text-comet-900 text-lg">
                      Picton Blue 500
                    </div>
                    <div className="text-comet-600 font-mono">#26a6df</div>
                    <div className="text-sm text-comet-500 mt-1">
                      Accents, highlights
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-sandy-brown-400 rounded-xl shadow-lg border-4 border-white"></div>
                  <div>
                    <div className="font-bold text-comet-900 text-lg">
                      Sandy Brown 400
                    </div>
                    <div className="text-comet-600 font-mono">#ff8b00</div>
                    <div className="text-sm text-comet-500 mt-1">
                      Warm accents, CTAs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Neutral Colors */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-comet-800 mb-6 font-heading">
              NEUTRAL COLORS
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-comet-900 rounded-lg shadow-md mx-auto mb-3 border-2 border-white"></div>
                <div className="font-semibold text-comet-900">Comet 900</div>
                <div className="text-sm text-comet-600 font-mono">#0e172d</div>
                <div className="text-xs text-comet-500 mt-1">
                  Headings, strong text
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-comet-600 rounded-lg shadow-md mx-auto mb-3 border-2 border-white"></div>
                <div className="font-semibold text-comet-900">Comet 600</div>
                <div className="text-sm text-comet-600 font-mono">#48546c</div>
                <div className="text-xs text-comet-500 mt-1">Body text</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-comet-300 rounded-lg shadow-md mx-auto mb-3 border-2 border-white"></div>
                <div className="font-semibold text-comet-900">Comet 300</div>
                <div className="text-sm text-comet-600 font-mono">#d0d5e0</div>
                <div className="text-xs text-comet-500 mt-1">
                  Borders, dividers
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-lg shadow-md mx-auto mb-3 border-2 border-comet-200"></div>
                <div className="font-semibold text-comet-900">White</div>
                <div className="text-sm text-comet-600 font-mono">#ffffff</div>
                <div className="text-xs text-comet-500 mt-1">
                  Backgrounds, surfaces
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-comet-200">
          <h2 className="text-3xl font-bold text-comet-900 mb-8 font-heading">
            TYPOGRAPHY
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-comet-800 mb-6 font-heading">
                FONT FAMILIES
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-comet-50 rounded-lg border border-comet-200">
                  <div className="text-3xl font-bold text-comet-900 mb-3 font-heading">
                    Sumana
                  </div>
                  <p className="text-comet-600 font-body">
                    Primary heading font — serif, elegant, structured
                  </p>
                  <div className="mt-4 text-sm text-comet-500">
                    Use for: Hero titles, section headers, brand elements
                  </div>
                </div>
                <div className="p-6 bg-comet-50 rounded-lg border border-comet-200">
                  <div className="text-xl font-normal text-comet-900 mb-3 font-body">
                    Cairo
                  </div>
                  <p className="text-comet-600 font-body">
                    Body text font — clean, readable, modern
                  </p>
                  <div className="mt-4 text-sm text-comet-500">
                    Use for: Body copy, descriptions, UI text
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-comet-800 mb-6 font-heading">
                TYPE SCALE
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-comet-200">
                  <div className="flex-1">
                    <div className="text-5xl font-bold text-comet-900 font-heading">
                      DISPLAY
                    </div>
                    <div className="text-sm text-comet-500 mt-1">
                      Hero titles, main headings
                    </div>
                  </div>
                  <div className="text-right text-comet-600">
                    <div className="font-mono">5xl / 48px</div>
                    <div className="text-xs">Bold weight</div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-comet-200">
                  <div className="flex-1">
                    <div className="text-4xl font-bold text-comet-900 font-heading">
                      H1 HEADINGS
                    </div>
                    <div className="text-sm text-comet-500 mt-1">
                      Page titles, major sections
                    </div>
                  </div>
                  <div className="text-right text-comet-600">
                    <div className="font-mono">4xl / 36px</div>
                    <div className="text-xs">Bold weight</div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-comet-200">
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-comet-900 font-heading">
                      H2 HEADINGS
                    </div>
                    <div className="text-sm text-comet-500 mt-1">
                      Section headers
                    </div>
                  </div>
                  <div className="text-right text-comet-600">
                    <div className="font-mono">3xl / 30px</div>
                    <div className="text-xs">Bold weight</div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-comet-200">
                  <div className="flex-1">
                    <div className="text-xl font-semibold text-comet-900 font-body">
                      Body Large
                    </div>
                    <div className="text-sm text-comet-500 mt-1">
                      Lead paragraphs, important text
                    </div>
                  </div>
                  <div className="text-right text-comet-600">
                    <div className="font-mono">xl / 20px</div>
                    <div className="text-xs">Semibold weight</div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <div className="text-base text-comet-900 font-body">
                      Body Regular
                    </div>
                    <div className="text-sm text-comet-500 mt-1">
                      Standard body text
                    </div>
                  </div>
                  <div className="text-right text-comet-600">
                    <div className="font-mono">base / 16px</div>
                    <div className="text-xs">Regular weight</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-comet-200">
          <h2 className="text-3xl font-bold text-comet-900 mb-8 font-heading">
            UI COMPONENTS
          </h2>

          <div className="space-y-8">
            {/* Buttons */}
            <div>
              <h3 className="text-xl font-semibold text-comet-800 mb-6 font-heading">
                BUTTONS
              </h3>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-nile-blue-600 text-white rounded-lg hover:bg-nile-blue-700 focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:ring-offset-2 transition-all font-body font-medium shadow-lg">
                  Primary Action
                </button>
                <button className="px-6 py-3 bg-white text-comet-900 border-2 border-comet-300 rounded-lg hover:bg-comet-50 focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:ring-offset-2 transition-all font-body font-medium">
                  Secondary Action
                </button>
                <button className="px-6 py-3 bg-sandy-brown-400 text-white rounded-lg hover:bg-sandy-brown-500 focus:outline-none focus:ring-2 focus:ring-sandy-brown-400 focus:ring-offset-2 transition-all font-body font-medium shadow-lg">
                  CTA Button
                </button>
              </div>
            </div>

            {/* Form Elements */}
            <div>
              <h3 className="text-xl font-semibold text-comet-800 mb-6 font-heading">
                FORM ELEMENTS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-comet-700 mb-2 font-body">
                    Input Field
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your information"
                    className="w-full px-4 py-3 border-2 border-comet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:border-nile-blue-500 transition-all font-body bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-comet-700 mb-2 font-body">
                    Select Field
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-comet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:border-nile-blue-500 transition-all font-body bg-white">
                    <option>Choose an option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cards */}
            <div>
              <h3 className="text-xl font-semibold text-comet-800 mb-6 font-heading">
                CARDS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border-2 border-comet-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-nile-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-nile-blue-600 rounded"></div>
                  </div>
                  <h4 className="text-lg font-bold text-comet-900 mb-2 font-heading">
                    Structure
                  </h4>
                  <p className="text-comet-600 font-body">
                    Building systems with clarity and purpose.
                  </p>
                </div>
                <div className="bg-white border-2 border-comet-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-picton-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-picton-blue-500 rounded"></div>
                  </div>
                  <h4 className="text-lg font-bold text-comet-900 mb-2 font-heading">
                    Code
                  </h4>
                  <p className="text-comet-600 font-body">
                    Clean, maintainable, and efficient solutions.
                  </p>
                </div>
                <div className="bg-white border-2 border-comet-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-sandy-brown-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-sandy-brown-400 rounded"></div>
                  </div>
                  <h4 className="text-lg font-bold text-comet-900 mb-2 font-heading">
                    Foundations
                  </h4>
                  <p className="text-comet-600 font-body">
                    Solid groundwork for lasting digital systems.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logo & Visual Identity */}
        <section className="bg-gradient-to-br from-nile-blue-600 to-nile-blue-800 text-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-8 font-heading">
            LOGO & VISUAL IDENTITY
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-6 font-heading">
                LIGHTHOUSE ICON
              </h3>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-center mb-4">
                  <div className="inline-block p-4 bg-white/20 rounded-full">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <span className="text-nile-blue-600 text-2xl font-bold">
                        🏮
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-white/90 font-body leading-relaxed">
                  The lighthouse represents guidance, trust, and structure — a
                  beacon that illuminates the path forward in complex digital
                  landscapes.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-6 font-heading">
                WORDMARK
              </h3>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold font-heading tracking-wider">
                    TOWNESDEV
                  </div>
                </div>
                <p className="text-white/90 font-body leading-relaxed">
                  Clean, modern typography that conveys professionalism and
                  technical precision. Always presented in uppercase for maximum
                  impact.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <h4 className="text-lg font-semibold mb-4 font-heading">
              USAGE GUIDELINES
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold mb-2">Do&apos;s ✅</h5>
                <ul className="text-sm text-white/80 space-y-1 font-body">
                  <li>• Maintain minimum clear space</li>
                  <li>• Use on appropriate backgrounds</li>
                  <li>• Scale proportionally</li>
                  <li>• Keep colors consistent</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Don&apos;ts ❌</h5>
                <ul className="text-sm text-white/80 space-y-1 font-body">
                  <li>• Distort or modify the icon</li>
                  <li>• Apply heavy effects</li>
                  <li>• Use on busy backgrounds</li>
                  <li>• Combine with other logos</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Voice */}
        <section className="bg-white rounded-xl shadow-lg p-8 border border-comet-200">
          <h2 className="text-3xl font-bold text-comet-900 mb-8 font-heading">
            BRAND VOICE
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-comet-800 mb-4 font-heading">
                Tone
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-nile-blue-500 rounded-full"></div>
                  <span className="text-comet-700 font-body">
                    Calm & Grounded
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-nile-blue-500 rounded-full"></div>
                  <span className="text-comet-700 font-body">
                    Clear & Precise
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-nile-blue-500 rounded-full"></div>
                  <span className="text-comet-700 font-body">
                    Confident but Humble
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-comet-800 mb-4 font-heading">
                Language
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-sandy-brown-400 rounded-full"></div>
                  <span className="text-comet-700 font-body">
                    Build, Craft, Structure
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-sandy-brown-400 rounded-full"></div>
                  <span className="text-comet-700 font-body">
                    Clarity over Hype
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-sandy-brown-400 rounded-full"></div>
                  <span className="text-comet-700 font-body">
                    Purpose-Driven
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-comet-50 rounded-lg border border-comet-200">
            <h4 className="text-lg font-semibold text-comet-900 mb-3 font-heading">
              Example Messaging
            </h4>
            <div className="space-y-4 text-comet-700 font-body">
              <p>
                <strong>Instead of:</strong> &ldquo;We make awesome
                websites!&rdquo;
              </p>
              <p>
                <strong>We say:</strong> &ldquo;We build structured digital
                systems that stand the test of time.&rdquo;
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
