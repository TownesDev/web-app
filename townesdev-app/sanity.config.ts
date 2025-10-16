'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/admin/[[...tool]]/page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'
import {clientAutomation} from './src/sanity/plugins/clientAutomation'
import { previewInvoice, sendStatusUpdateEmail } from './src/sanity/actions/clientActions'
import {locations, mainDocuments} from './src/lib/presentation/resolve'

export default defineConfig({
  basePath: '/admin',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  title: 'TownesDev Admin',
  plugins: [
    structureTool({structure}),
    clientAutomation(),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
    presentationTool({
      resolve: {locations, mainDocuments},
      previewUrl: {
        initial: 'http://localhost:3000',
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
      allowOrigins: ['http://localhost:*'],
    }),
  ],
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'invoice') {
        return [...prev, previewInvoice, sendStatusUpdateEmail]
      }
      return prev
    },
  },
  
})
