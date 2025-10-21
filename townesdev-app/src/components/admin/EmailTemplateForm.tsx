'use client'

/**
 * Email Template Form Component
 * Form for editing email template details with validation
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'

// Dynamically import the markdown editor to reduce bundle size
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => (
    <div className="h-64 border rounded p-4 bg-gray-50">Loading editor...</div>
  ),
})

// Types for Portable Text
interface PortableTextSpan {
  _type: 'span'
  _key: string
  text: string
  marks?: string[]
}

interface PortableTextBlock {
  _type: 'block'
  _key: string
  children: PortableTextSpan[]
  style?: string
}

// Helper function to convert Portable Text to Markdown (basic implementation)
function portableTextToMarkdown(portableText: unknown[]): string {
  if (!Array.isArray(portableText)) return ''

  return portableText
    .map((block: unknown) => {
      const b = block as PortableTextBlock
      if (b._type === 'block') {
        let text =
          b.children
            ?.map((child: PortableTextSpan) => {
              let content = child.text || ''
              if (child.marks?.includes('strong')) content = `**${content}**`
              if (child.marks?.includes('em')) content = `*${content}*`
              return content
            })
            .join('') || ''

        if (b.style === 'h1') text = `# ${text}`
        else if (b.style === 'h2') text = `## ${text}`
        else if (b.style === 'h3') text = `### ${text}`

        return text
      }
      return ''
    })
    .join('\n\n')
}

// Helper function to convert Markdown to Portable Text (basic implementation)
function markdownToPortableText(markdown: string): unknown[] {
  if (!markdown.trim()) return []

  // Simple markdown parser - split by double newlines for paragraphs
  const lines = markdown.split('\n')
  const blocks: unknown[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    let style: string | undefined
    let text = trimmed

    if (trimmed.startsWith('# ')) {
      style = 'h1'
      text = trimmed.substring(2)
    } else if (trimmed.startsWith('## ')) {
      style = 'h2'
      text = trimmed.substring(3)
    } else if (trimmed.startsWith('### ')) {
      style = 'h3'
      text = trimmed.substring(4)
    }

    // Parse basic formatting
    const children: PortableTextSpan[] = []
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g)

    for (const part of parts) {
      if (!part) continue

      const marks: string[] = []
      let cleanText = part

      if (part.startsWith('**') && part.endsWith('**')) {
        marks.push('strong')
        cleanText = part.slice(2, -2)
      } else if (part.startsWith('*') && part.endsWith('*')) {
        marks.push('em')
        cleanText = part.slice(1, -1)
      }

      children.push({
        _type: 'span',
        _key: `span-${Math.random().toString(36).substr(2, 9)}`,
        text: cleanText,
        marks: marks.length > 0 ? marks : undefined,
      })
    }

    blocks.push({
      _type: 'block',
      _key: `block-${Math.random().toString(36).substr(2, 9)}`,
      children,
      style,
    })
  }

  return blocks
}

interface EmailTemplate {
  _id: string
  name: string
  subject: string
  htmlBody?: unknown[]
  purpose: string
}

interface EmailTemplateFormProps {
  template?: EmailTemplate
}

interface FormData {
  name: string
  subject: string
  htmlBody: string
  purpose: string
}

interface FormErrors {
  name?: string
  subject?: string
  htmlBody?: string
  purpose?: string
}

export default function EmailTemplateForm({
  template,
}: EmailTemplateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: template?.name || '',
    subject: template?.subject || '',
    htmlBody: template?.htmlBody
      ? portableTextToMarkdown(template.htmlBody)
      : '',
    purpose: template?.purpose || '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject line is required'
    }

    if (!formData.htmlBody.trim()) {
      newErrors.htmlBody = 'Email body is required'
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Convert Markdown to Portable Text if HTML body is provided
      const submitData = {
        ...formData,
        htmlBody: formData.htmlBody
          ? markdownToPortableText(formData.htmlBody)
          : null,
      }

      const isUpdate = !!template
      const response = await fetch(
        isUpdate
          ? `/api/admin/email-templates/${template._id}`
          : '/api/admin/email-templates',
        {
          method: isUpdate ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to ${isUpdate ? 'update' : 'create'} template`)
      }

      toast.success(
        `Email template ${isUpdate ? 'updated' : 'created'} successfully!`
      )

      // Redirect back to templates list
      router.push('/admin/email-templates')
    } catch (error) {
      console.error(
        `Error ${template ? 'updating' : 'creating'} template:`,
        error
      )
      alert(
        `Failed to ${template ? 'update' : 'create'} template. Please try again.`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleHtmlBodyChange = (value?: string) => {
    setFormData((prev) => ({ ...prev, htmlBody: value || '' }))

    // Clear error when user starts typing
    if (errors.htmlBody) {
      setErrors((prev) => ({ ...prev, htmlBody: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Template Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 ${
            errors.name ? 'border-red-300' : ''
          }`}
          placeholder="e.g., Retainer Proposal"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-gray-700"
        >
          Subject Line *
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 ${
            errors.subject ? 'border-red-300' : ''
          }`}
          placeholder="e.g., Your TownesDev Retainer Proposal"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="htmlBody"
          className="block text-sm font-medium text-gray-700"
        >
          Email Body *
        </label>
        <div
          className={`mt-1 ${errors.htmlBody ? 'border border-red-300 rounded-md' : ''}`}
        >
          <MDEditor
            value={formData.htmlBody}
            onChange={handleHtmlBodyChange}
            preview="edit"
            hideToolbar={false}
            visibleDragbar={true}
            textareaProps={{
              placeholder:
                'Email content with rich formatting using Markdown syntax',
            }}
            style={{
              minHeight: '400px',
            }}
          />
        </div>
        {errors.htmlBody && (
          <p className="mt-1 text-sm text-red-600">{errors.htmlBody}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Email content with rich formatting using Markdown syntax. Use
          **bold**, *italic*, # headings, etc. Include placeholders like{' '}
          {'{{clientName}}'}, {'{{planName}}'}, {'{{startDate}}'} for dynamic
          content.
        </p>
      </div>

      <div>
        <label
          htmlFor="purpose"
          className="block text-sm font-medium text-gray-700"
        >
          Purpose *
        </label>
        <textarea
          id="purpose"
          name="purpose"
          rows={3}
          value={formData.purpose}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 ${
            errors.purpose ? 'border-red-300' : ''
          }`}
          placeholder="When and why this template is used"
        />
        {errors.purpose && (
          <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push('/admin/email-templates')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Template'}
        </button>
      </div>
    </form>
  )
}
