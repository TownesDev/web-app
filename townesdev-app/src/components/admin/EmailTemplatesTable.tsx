"use client";

/**
 * Email Templates Table Component
 * Displays email templates with Name | Subject | Purpose | Actions columns
 */

import Link from "next/link";
import { useState } from "react";
import EmailPreviewModal from "./EmailPreviewModal";
import { toast } from "sonner";

interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  purpose: string;
  htmlBody?: unknown;
}

interface EmailTemplatesTableProps {
  templates: EmailTemplate[];
}

export default function EmailTemplatesTable({
  templates,
}: EmailTemplatesTableProps) {
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [deleteTemplate, setDeleteTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const openPreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  const openDeleteConfirm = (template: EmailTemplate) => {
    setDeleteTemplate(template);
  };

  const closeDeleteConfirm = () => {
    setDeleteTemplate(null);
  };

  const handleDelete = async () => {
    if (!deleteTemplate) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/email-templates/${deleteTemplate._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      toast.success("Email template deleted successfully!");
      // Refresh the page to show updated list
      window.location.reload();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template. Please try again.");
    } finally {
      setIsDeleting(false);
      closeDeleteConfirm();
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Template Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Subject
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Purpose
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm text-gray-900"
                >
                  No email templates found.
                </td>
              </tr>
            ) : (
              templates.map((template) => (
                <tr key={template._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {template.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {template.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {template.purpose}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button
                      onClick={() => openPreview(template)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Preview
                    </button>
                    <Link
                      href={`/admin/email-templates/${template._id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => openDeleteConfirm(template)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EmailPreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={closePreview}
      />

      {/* Delete Confirmation Modal */}
      {deleteTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="ml-3 w-full">
                  <h3 className="text-lg font-medium text-gray-900">
                    Delete Email Template
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete the template{" "}
                      <strong>&quot;{deleteTemplate.name}&quot;</strong>? This
                      action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={closeDeleteConfirm}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
