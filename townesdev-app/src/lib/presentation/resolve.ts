import {defineDocuments, defineLocations} from 'sanity/presentation'

// Configures the "Used on x pages" banner
export const locations = {
  // Map document types to frontend routes
  invoice: defineLocations({
    select: {title: 'invoiceNumber', slug: '_id'},
    resolve: (doc) => {
      if (!doc) return {locations: []}
      return {
        locations: [
          {title: `Invoice ${doc.title || doc.slug}`, href: `/app/invoice/${doc.slug}`},
        ],
      }
    },
  }),
}

// Configures documents presentation tool should open by default when navigating to an URL
export const mainDocuments = defineDocuments([
  {
    route: '/app/invoice/:id',
    filter: `_type == "invoice" && _id == $id`,
  },
])