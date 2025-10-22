/**
 * Email Content Parsing Utilities
 * Handles email-to-incident content transformation and cleanup
 */

export interface ParsedEmailContent {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  isReply: boolean;
  threadId?: string;
  originalMessage?: string;
}

/**
 * Parse email content into structured incident data
 */
export function parseEmailToIncident(
  subject: string,
  textBody?: string,
  htmlBody?: string
): ParsedEmailContent {
  const cleanSubject = cleanEmailSubject(subject);
  const priority = extractPriorityFromContent(cleanSubject, textBody);
  const tags = extractTagsFromContent(cleanSubject, textBody);
  const isReply = isReplyEmail(subject);
  const threadId = extractThreadId(subject);
  
  // Use HTML if available, fallback to text
  const bodyContent = htmlBody || textBody || 'No content provided';
  const cleanedBody = cleanEmailBody(bodyContent, isReply);
  
  return {
    title: cleanSubject,
    description: cleanedBody,
    priority,
    tags,
    isReply,
    threadId,
    originalMessage: isReply ? extractOriginalMessage(bodyContent) : undefined
  };
}

/**
 * Clean up email subject line for incident title
 * Removes common email prefixes and formatting
 */
export function cleanEmailSubject(subject: string): string {
  if (!subject) return 'No Subject';
  
  let cleaned = subject.trim();
  
  // Remove common reply/forward prefixes (case insensitive)
  cleaned = cleaned.replace(/^(re:|fwd?:|fw:)\s*/gi, '');
  
  // Remove multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Truncate if too long for title
  if (cleaned.length > 100) {
    cleaned = cleaned.substring(0, 97) + '...';
  }
  
  return cleaned || 'Email Inquiry';
}

/**
 * Extract priority level from email content
 * Looks for keywords indicating urgency
 */
export function extractPriorityFromContent(
  subject: string,
  body?: string
): 'low' | 'medium' | 'high' | 'urgent' {
  const content = `${subject} ${body || ''}`.toLowerCase();
  
  // Urgent keywords
  if (content.match(/\b(urgent|emergency|critical|asap|immediately|broken|down|not working)\b/)) {
    return 'urgent';
  }
  
  // High priority keywords
  if (content.match(/\b(important|priority|issue|problem|error|bug|help|support)\b/)) {
    return 'high';
  }
  
  // Low priority keywords
  if (content.match(/\b(question|inquiry|suggestion|feature|enhancement|when you can)\b/)) {
    return 'low';
  }
  
  // Default to medium
  return 'medium';
}

/**
 * Extract relevant tags from email content
 */
export function extractTagsFromContent(subject: string, body?: string): string[] {
  const content = `${subject} ${body || ''}`.toLowerCase();
  const tags: string[] = [];
  
  // Technical categories
  if (content.match(/\b(bot|discord|command|slash)\b/)) tags.push('bot');
  if (content.match(/\b(server|hosting|deployment|infrastructure)\b/)) tags.push('infrastructure');
  if (content.match(/\b(permission|role|access|login|auth)\b/)) tags.push('permissions');
  if (content.match(/\b(feature|enhancement|improvement)\b/)) tags.push('feature-request');
  if (content.match(/\b(bug|error|broken|not working|issue)\b/)) tags.push('bug');
  if (content.match(/\b(question|how to|help|support)\b/)) tags.push('question');
  if (content.match(/\b(billing|payment|invoice|subscription)\b/)) tags.push('billing');
  
  return tags;
}

/**
 * Check if email is a reply to an existing thread
 */
export function isReplyEmail(subject: string): boolean {
  return /^(re:|fwd?:|fw:)/i.test(subject.trim());
}

/**
 * Extract thread ID from email subject
 * Simple implementation - could be enhanced with Message-ID headers
 */
export function extractThreadId(subject: string): string | undefined {
  // Look for existing ticket/thread references in subject
  const ticketMatch = subject.match(/\b(ticket|ref|#)[\s:#]*(\w+)\b/i);
  if (ticketMatch) {
    return ticketMatch[2];
  }
  
  return undefined;
}

/**
 * Clean email body content for incident description
 */
export function cleanEmailBody(body: string, isReply: boolean = false): string {
  if (!body) return 'No description provided';
  
  let cleaned = body;
  
  // If HTML, try to extract text content
  if (body.includes('<') && body.includes('>')) {
    cleaned = htmlToText(body);
  }
  
  // Remove email signatures (common patterns)
  cleaned = cleaned.replace(/--\s*$/gm, ''); // -- signature separator
  cleaned = cleaned.replace(/^\s*Sent from .+$/gm, ''); // "Sent from" lines
  cleaned = cleaned.replace(/^Best regards?[\s\S]*$/gm, ''); // Common closings
  cleaned = cleaned.replace(/^Thanks?[\s\S]*$/gm, ''); // Thank you lines
  
  // For replies, try to extract just the new content
  if (isReply) {
    cleaned = extractNewReplyContent(cleaned);
  }
  
  // Clean up formatting
  cleaned = cleaned.replace(/\r\n/g, '\n'); // Normalize line endings
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Remove excessive line breaks
  cleaned = cleaned.trim();
  
  // Truncate if extremely long (keep first 2000 chars)
  if (cleaned.length > 2000) {
    cleaned = cleaned.substring(0, 1997) + '...';
  }
  
  return cleaned || 'No description provided';
}

/**
 * Extract original message from reply email
 */
export function extractOriginalMessage(body: string): string | undefined {
  // Look for common reply separators
  const patterns = [
    /^[-_\s]*Original Message[-_\s]*$/gmi,
    /^[-_\s]*From:.*$/gmi,
    /^On .* wrote:$/gmi,
    /^>\s*/gm // Quoted text
  ];
  
  for (const pattern of patterns) {
    const match = body.search(pattern);
    if (match > -1) {
      return body.substring(match).trim();
    }
  }
  
  return undefined;
}

/**
 * Extract new content from reply, removing quoted original message
 */
function extractNewReplyContent(body: string): string {
  // Split on common reply separators and take the first part
  const separators = [
    /^[-_\s]*Original Message[-_\s]*$/gmi,
    /^[-_\s]*From:.*$/gmi,
    /^On .* wrote:$/gmi
  ];
  
  for (const separator of separators) {
    const parts = body.split(separator);
    if (parts.length > 1) {
      return parts[0].trim();
    }
  }
  
  // Remove quoted lines (starting with >)
  const lines = body.split('\n');
  const newLines = [];
  
  for (const line of lines) {
    if (!line.trim().startsWith('>')) {
      newLines.push(line);
    } else {
      break; // Stop at first quoted line
    }
  }
  
  return newLines.join('\n').trim();
}

/**
 * Convert HTML to plain text (basic implementation)
 * For production, consider using a library like 'html-to-text'
 */
function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style blocks
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script blocks
    .replace(/<br\s*\/?>/gi, '\n') // Convert br to newlines
    .replace(/<\/p>/gi, '\n\n') // Convert paragraph ends to double newlines
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Convert non-breaking spaces
    .replace(/&amp;/g, '&') // Convert HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}