import type { StructureResolver } from 'sanity/structure'
import React from 'react'
import {
  Users,
  Settings,
  FileText,
  Briefcase,
  Calendar,
  AlertTriangle,
  UserX,
  Mail,
  DollarSign,
  FolderOpen,
  User,
  MessageSquare,
  Image,
  MapPin,
  Star,
  CheckSquare,
  Server,
  Zap,
  Key,
  CreditCard,
} from 'lucide-react'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Configuration Section
      S.listItem()
        .title('SEO Configuration')
        .icon(Settings)
        .child(S.document().schemaType('seoConfig').documentId('seoConfig')),
      S.listItem()
        .title('Operation Configuration')
        .icon(Settings)
        .child(
          S.document()
            .schemaType('operationConfig')
            .documentId('operationConfig')
        ),

      // Section Separator
      S.divider(),

      // Landing Page Section
      S.listItem()
        .title('Landing Page')
        .icon(FileText)
        .child(
          S.list()
            .title('Landing Page Content')
            .items([
              S.listItem()
                .title('Projects')
                .icon(FolderOpen)
                .child(S.documentTypeList('project').title('Projects')),
              S.listItem()
                .title('About Me')
                .icon(User)
                .child(
                  S.document().schemaType('aboutMe').documentId('aboutMe')
                ),
              S.listItem()
                .title('Contact Info')
                .icon(Mail)
                .child(
                  S.document()
                    .schemaType('contactInfo')
                    .documentId('contactInfo')
                ),
              S.listItem()
                .title('Hero Section')
                .icon(Image)
                .child(
                  S.document()
                    .schemaType('heroSection')
                    .documentId('heroSection')
                ),
              S.listItem()
                .title('Testimonials')
                .icon(MessageSquare)
                .child(S.documentTypeList('testimonial').title('Testimonials')),
            ])
        ),

      // Section Separator
      S.divider(),

      // Business Management Section
      ...S.documentTypeListItems()
        .filter((listItem) =>
          [
            'client',
            'plan',
            'serviceAsset',
            'feature',
            'entitlement',
            'retainer',
            'kickoffChecklist',
            'monthlyRhythm',
            'incident',
            'offboarding',
            'emailTemplate',
          ].includes(listItem.getId() || '')
        )
        .map((item) => {
          // Add custom icons based on document type
          const id = item.getId()
          switch (id) {
            case 'client':
              return item.icon(Users)
            case 'plan':
              return item.icon(Briefcase)
            case 'serviceAsset':
              return item.icon(Server)
            case 'feature':
              return item.icon(Zap)
            case 'entitlement':
              return item.icon(Key)
            case 'retainer':
              return item.icon(CreditCard)
            case 'kickoffChecklist':
              return item.icon(CheckSquare)
            case 'monthlyRhythm':
              return item.icon(Calendar)
            case 'incident':
              return item.icon(AlertTriangle)
            case 'offboarding':
              return item.icon(UserX)
            case 'emailTemplate':
              return item.icon(Mail)
            default:
              return item
          }
        }),

      // Users Section
      S.listItem()
        .title('Users')
        .icon(Users)
        .child(S.documentTypeList('user').title('Users')),
      S.listItem()
        .title('Invoices')
        .icon(DollarSign)
        .child(
          S.documentTypeList('invoice')
            .title('Invoices')
            .child((documentId) =>
              S.document()
                .documentId(documentId)
                .schemaType('invoice')
                .views([
                  S.view.form(),
                  S.view
                    .component(() => {
                      const PreviewComponent = React.lazy(
                        () => import('../app/(portal)/app/invoice/[id]/preview')
                      )
                      return React.createElement(PreviewComponent, {
                        id: documentId,
                      } as any)
                    })
                    .title('Preview'),
                ])
            )
        ),
    ])
