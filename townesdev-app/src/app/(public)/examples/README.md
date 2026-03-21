# Portfolio Examples

This directory contains live portfolio example websites demonstrating TownesDev's web development capabilities.

## Examples

### 1. Sweet Sunrise Bakery (`/examples/bakery`)

**Type:** Small Business Website  
**Route:** `/examples/bakery`

A professional website for a fictional artisan bakery featuring:

- Warm, inviting design with amber/orange color scheme
- Multi-section layout (Home, About, Menu, Contact)
- Menu showcase with organized categories (breads, pastries, cakes)
- Contact form with Google Maps placeholder
- Mobile-responsive design
- Social media integration

**Perfect for:** Bakeries, cafes, restaurants, catering services, food trucks

### 2. The Midnight Collective (`/examples/musician`)

**Type:** Musician/Band Website  
**Route:** `/examples/musician`

A modern, engaging website for a fictional alternative rock band featuring:

- Dark theme with purple/pink gradients
- Music player mockups (Spotify, Apple Music, Bandcamp)
- Tour dates section with ticket availability
- Band member profiles
- Newsletter signup
- Social media integration across all major platforms

**Perfect for:** Musicians, bands, DJs, music producers, podcasters, performance artists

## Implementation

All examples are built using:

- **Next.js 15** - React framework with server-side rendering
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Responsive Design** - Mobile-first approach

## Integration

### Homepage Integration

The `PortfolioShowcase` component displays these examples on the main TownesDev homepage between the Testimonials and Contact sections.

### Pricing Page Integration

The portfolio examples are also showcased at the bottom of the `/plans` page, allowing potential clients to see live demos before choosing a plan.

## Usage

### Viewing Examples

1. Navigate to `/examples/bakery` for the bakery demo
2. Navigate to `/examples/musician` for the band demo

### PortfolioShowcase Component

Import and use the portfolio showcase component:

```tsx
import { PortfolioShowcase } from '@/components/public/PortfolioShowcase'

export default function Page() {
  return (
    <div>
      <PortfolioShowcase />
    </div>
  )
}
```

The component automatically displays both examples with:

- Live demo links
- Feature lists
- Type badges
- Call-to-action buttons

## File Structure

```
examples/
├── README.md (this file)
├── bakery/
│   ├── page.tsx
│   └── README.md
└── musician/
    ├── page.tsx
    └── README.md
```

## Design Principles

All examples follow these principles:

1. **Professional Quality** - Production-ready design and code
2. **Mobile-First** - Responsive on all devices
3. **Performance** - Optimized for fast loading
4. **Accessibility** - Semantic HTML and ARIA labels
5. **SEO-Friendly** - Proper metadata and structure
6. **Maintainable** - Clean, typed code with good organization

## Adding New Examples

To add a new portfolio example:

1. Create a new directory: `examples/[example-name]/`
2. Add a `page.tsx` file with the example website
3. Add a `README.md` documenting the example
4. Update `PortfolioShowcase.tsx` to include the new example
5. Ensure mobile responsiveness and accessibility
6. Add proper metadata for SEO

## Marketing Value

These examples serve as:

- **Social Proof** - Demonstrate capabilities to potential clients
- **Inspiration** - Help clients envision their own website
- **Trust Building** - Show real, functional examples
- **Lead Generation** - "View Live Demo" CTAs drive engagement
- **SEO Content** - Real pages with content for search engines

## Notes

- Examples use placeholder content (Lorem Ipsum text, placeholder images)
- Social media and external links are non-functional (href="#")
- Forms do not submit (would need backend integration)
- Map placeholders would need Google Maps API in production
- Music player mockups would need real streaming service integration

## Created by TownesDev

These portfolio examples were created as part of Issue #73 to demonstrate web development capabilities and serve as marketing materials for potential clients.
