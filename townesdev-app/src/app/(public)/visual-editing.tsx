'use client'

import { enableVisualEditing } from '@sanity/visual-editing'
import { useEffect } from 'react'

export function VisualEditingClient() {
  useEffect(() => {
    enableVisualEditing({
      zIndex: 999999,
    })
  }, [])

  return null
}
