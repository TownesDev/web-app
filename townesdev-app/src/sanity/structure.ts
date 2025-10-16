import type {StructureResolver} from 'sanity/structure'
import React from 'react'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Configuration Section
      S.listItem()
        .title('SEO Configuration')
        .child(S.document().schemaType('seoConfig').documentId('seoConfig')),
      S.listItem()
        .title('Operation Configuration')
        .child(S.document().schemaType('operationConfig').documentId('operationConfig')),

      // Section Separator
      S.divider(),

      // Landing Page Section
      S.listItem()
        .title('🏠 Landing Page')
        .child(
          S.list()
            .title('Landing Page Content')
            .items([
              S.listItem()
                .title('📁 Projects')
                .child(
                  S.documentTypeList('project')
                    .title('Projects')
                ),
              S.listItem()
                .title('👤 About Me')
                .child(
                  S.document()
                    .schemaType('aboutMe')
                    .documentId('aboutMe')
                ),
              S.listItem()
                .title('📧 Contact Info')
                .child(
                  S.document()
                    .schemaType('contactInfo')
                    .documentId('contactInfo')
                ),
              S.listItem()
                .title('🎯 Hero Section')
                .child(
                  S.document()
                    .schemaType('heroSection')
                    .documentId('heroSection')
                ),
              S.listItem()
                .title('📝 Testimonials')
                .child(
                  S.documentTypeList('testimonial')
                    .title('Testimonials')
                ),
            ])
        ),

      // Section Separator
      S.divider(),

      // Business Management Section
      ...S.documentTypeListItems().filter(listItem =>
        ['client', 'plan', 'kickoffChecklist', 'monthlyRhythm', 'incident', 'offboarding', 'emailTemplate'].includes(listItem.getId() || '')
      ),
      S.listItem()
        .title('💰 Invoices')
        .child(
          S.documentTypeList('invoice')
            .title('Invoices')
            .child(documentId =>
              S.document()
                .documentId(documentId)
                .schemaType('invoice')
                .views([
                  S.view.form(),
                  S.view.component(() => {
                    const PreviewComponent = React.lazy(() => import('../app/invoice/[id]/preview'))
                    return React.createElement(PreviewComponent, { id: documentId })
                  }).title('Preview')
                ])
            )
        ),
    ])
