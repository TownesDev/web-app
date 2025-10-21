export type PTBlock = {
  _type: string
  style?: string
  children?: { text?: string }[]
}

export function ptToPlainText(blocks: PTBlock[] | undefined): string {
  if (!blocks?.length) return ''
  return blocks
    .map((b) => (b.children || []).map((c) => c.text || '').join(''))
    .join('\n\n')
    .trim()
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function ptToHtml(blocks: PTBlock[] | undefined): string {
  if (!blocks?.length) return ''
  return blocks
    .map((b) => {
      const text = (b.children || [])
        .map((c) => escapeHtml(c.text || ''))
        .join('')
      switch (b.style) {
        case 'h1':
          return `<h1>${text}</h1>`
        case 'h2':
          return `<h2>${text}</h2>`
        case 'h3':
          return `<h3>${text}</h3>`
        case 'blockquote':
          return `<blockquote>${text}</blockquote>`
        default:
          return `<p>${text}</p>`
      }
    })
    .join('\n')
}

/** super simple {{var}} interpolation without a new dependency */
export function mergeVars(template: string, vars: Record<string, unknown>) {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const val = key.split('.').reduce((acc: unknown, k: string) => {
      return (acc as Record<string, unknown>)?.[k]
    }, vars)
    return (val ?? '').toString()
  })
}
