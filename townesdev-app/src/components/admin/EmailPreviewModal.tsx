"use client";

import { marked } from "marked";

interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  purpose: string;
  htmlBody?: unknown;
}

interface EmailPreviewModalProps {
  template: EmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PortableTextSpan {
  _type: "span";
  text: string;
  marks?: string[];
}

interface PortableTextBlock {
  _type: "block";
  children: PortableTextSpan[];
  style?: string;
  listItem?: string;
  level?: number;
}

function portableTextToMarkdown(portableText: unknown[]): string {
  if (!Array.isArray(portableText)) return "";

  return portableText
    .map((block) => {
      const b = block as PortableTextBlock;
      if (b._type !== "block") return "";

      const text =
        b.children
          ?.map((child: PortableTextSpan) => {
            let text = child.text;
            if (child.marks?.includes("strong")) {
              text = `**${text}**`;
            }
            if (child.marks?.includes("em")) {
              text = `*${text}*`;
            }
            return text;
          })
          .join("") || "";

      switch (b.style) {
        case "h1":
          return `# ${text}`;
        case "h2":
          return `## ${text}`;
        case "h3":
          return `### ${text}`;
        case "blockquote":
          return `> ${text}`;
        default:
          return text;
      }
    })
    .join("\n\n");
}

export default function EmailPreviewModal({
  template,
  isOpen,
  onClose,
}: EmailPreviewModalProps) {
  if (!isOpen || !template) return null;

  const markdownContent = template.htmlBody
    ? portableTextToMarkdown(template.htmlBody as unknown[])
    : "";
  const htmlContent = marked.parse(markdownContent) as string;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-nile-blue-900 mb-2">
                Email Preview: {template.name}
              </h2>
              <p className="text-gray-600">
                <strong>Subject:</strong> {template.subject}
              </p>
              <p className="text-gray-600 mt-1">
                <strong>Purpose:</strong> {template.purpose}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="bg-gray-50 border rounded-lg p-6">
            <div
              className="prose prose-sm max-w-none [&_*]:text-gray-900 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:mb-3 [&_ol]:mb-3 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
