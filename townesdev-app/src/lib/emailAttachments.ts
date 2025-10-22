/**
 * Email Attachment Processing Utilities
 * Basic attachment handling for email-to-incident creation
 */

export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  url?: string;
  content?: string; // Base64 encoded content
  cid?: string; // Content-ID for inline attachments
}

export interface ProcessedAttachment {
  filename: string;
  contentType: string;
  size: number;
  sizeFormatted: string;
  isImage: boolean;
  isDocument: boolean;
  isSafe: boolean;
  url?: string;
  processingError?: string;
}

/**
 * Process email attachments for incident creation
 * For MVP: Log and catalog attachments without full file processing
 */
export function processEmailAttachments(
  attachments: EmailAttachment[] = []
): ProcessedAttachment[] {
  console.log(`[Attachment Processing] Processing ${attachments.length} attachments`);
  
  return attachments.map((attachment, index) => {
    try {
      const processed = processAttachment(attachment, index);
      console.log(`[Attachment Processing] Processed: ${attachment.filename}`, {
        size: processed.sizeFormatted,
        type: attachment.contentType,
        safe: processed.isSafe
      });
      return processed;
    } catch (error) {
      console.error(`[Attachment Processing] Error processing ${attachment.filename}:`, error);
      return {
        filename: attachment.filename || `attachment-${index}`,
        contentType: attachment.contentType || 'unknown',
        size: attachment.size || 0,
        sizeFormatted: formatFileSize(attachment.size || 0),
        isImage: false,
        isDocument: false,
        isSafe: false,
        processingError: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
}

/**
 * Process individual attachment
 */
function processAttachment(
  attachment: EmailAttachment,
  index: number
): ProcessedAttachment {
  const filename = attachment.filename || `attachment-${index}`;
  const contentType = attachment.contentType || 'application/octet-stream';
  const size = attachment.size || 0;
  
  // Categorize attachment type
  const isImage = isImageType(contentType);
  const isDocument = isDocumentType(contentType);
  
  // Security check - basic safety assessment
  const isSafe = isSafeAttachment(filename, contentType, size);
  
  return {
    filename,
    contentType,
    size,
    sizeFormatted: formatFileSize(size),
    isImage,
    isDocument,
    isSafe,
    url: attachment.url
  };
}

/**
 * Check if content type represents an image
 */
function isImageType(contentType: string): boolean {
  return contentType.startsWith('image/') && 
         ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
         .includes(contentType.toLowerCase());
}

/**
 * Check if content type represents a document
 */
function isDocumentType(contentType: string): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];
  
  return documentTypes.includes(contentType.toLowerCase());
}

/**
 * Basic safety check for attachments
 * In production, this would be more sophisticated
 */
function isSafeAttachment(
  filename: string,
  contentType: string,
  size: number
): boolean {
  // Size limits (10MB max for MVP)
  if (size > 10 * 1024 * 1024) {
    return false;
  }
  
  // Dangerous file extensions
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.scr', '.pif', '.com',
    '.js', '.jar', '.vbs', '.wsf', '.msi'
  ];
  
  const extension = getFileExtension(filename).toLowerCase();
  if (dangerousExtensions.includes(extension)) {
    return false;
  }
  
  // Dangerous content types
  const dangerousTypes = [
    'application/x-executable',
    'application/x-msdownload',
    'application/x-msdos-program'
  ];
  
  if (dangerousTypes.includes(contentType.toLowerCase())) {
    return false;
  }
  
  return true;
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > -1 ? filename.substring(lastDot) : '';
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

/**
 * Generate attachment summary for incident metadata
 */
export function generateAttachmentSummary(
  processed: ProcessedAttachment[]
): {
  totalCount: number;
  totalSize: string;
  safeCount: number;
  imageCount: number;
  documentCount: number;
  hasUnsafe: boolean;
  fileList: string[];
} {
  const totalSize = processed.reduce((sum, att) => sum + att.size, 0);
  const safeAttachments = processed.filter(att => att.isSafe);
  const images = processed.filter(att => att.isImage);
  const documents = processed.filter(att => att.isDocument);
  const unsafeAttachments = processed.filter(att => !att.isSafe);
  
  return {
    totalCount: processed.length,
    totalSize: formatFileSize(totalSize),
    safeCount: safeAttachments.length,
    imageCount: images.length,
    documentCount: documents.length,
    hasUnsafe: unsafeAttachments.length > 0,
    fileList: processed.map(att => 
      `${att.filename} (${att.sizeFormatted})${att.isSafe ? '' : ' [FLAGGED]'}`
    )
  };
}