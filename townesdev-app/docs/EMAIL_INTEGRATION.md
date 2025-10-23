# Email to Incident Integration

## Overview

The Email to Incident integration allows clients to create support tickets by sending emails to a designated address. The system automatically processes inbound emails and creates incident documents in the TownesDev platform.

## How It Works

1. **Email Reception**: Emails are received via webhook from email service providers (Resend, SendGrid, etc.)
2. **Client Mapping**: The sender's email address is mapped to a client account using exact email matching or domain-based matching
3. **Content Parsing**: Email content is parsed and cleaned to extract title, description, priority, and tags
4. **Attachment Processing**: Email attachments are cataloged and validated for security
5. **Incident Creation**: A new incident document is created in Sanity with all parsed data

## Features

### Smart Client Mapping

- **Exact Match**: Direct email address lookup in client records
- **Domain Match**: Matches emails from the same organization domain
- **Email Extraction**: Handles various email formats ("Name <email>" or plain email)

### Intelligent Content Parsing

- **Subject Cleaning**: Removes "Re:", "Fwd:" prefixes and formatting
- **Priority Detection**: Analyzes content for urgency keywords (urgent, emergency, critical)
- **Tag Generation**: Automatically tags incidents based on content (bot, infrastructure, billing, etc.)
- **Reply Detection**: Identifies reply emails and extracts new content
- **Signature Removal**: Strips common email signatures and boilerplate

### Attachment Handling

- **File Type Detection**: Categorizes attachments as images, documents, or other
- **Security Validation**: Flags potentially unsafe files and enforces size limits
- **Metadata Cataloging**: Records attachment details without full file processing

## API Endpoint

### POST `/api/email/inbound`

Webhook endpoint for receiving inbound emails from email service providers.

#### Authentication

Requires webhook authentication via headers:

- `x-webhook-signature`
- `resend-signature`
- `authorization`

Set the `EMAIL_WEBHOOK_SECRET` environment variable to secure the endpoint.

#### Request Format

The endpoint accepts various webhook formats. Common payload structure:

```json
{
  "from": "client@example.com",
  "subject": "Bot not responding to commands",
  "text": "The Discord bot hasn't been responding to slash commands for the past hour...",
  "html": "<p>The Discord bot hasn't been responding...</p>",
  "timestamp": "2024-01-15T10:30:00Z",
  "id": "msg_abc123",
  "attachments": [
    {
      "filename": "screenshot.png",
      "contentType": "image/png",
      "size": 245760,
      "url": "https://example.com/attachment.png"
    }
  ]
}
```

#### Response Format

**Success Response (200)**:

```json
{
  "success": true,
  "incident": {
    "id": "incident_abc123",
    "title": "Bot not responding to commands",
    "client": "Example Corp",
    "status": "open",
    "priority": "high",
    "isReply": false,
    "attachmentCount": 1,
    "hasUnsafeAttachments": false
  },
  "message": "Incident created successfully from email"
}
```

**Error Responses**:

- `400`: Invalid email format or missing required fields
- `401`: Missing webhook authentication
- `404`: Client not found for sender email
- `500`: Internal server error

## Priority Mapping

Emails are automatically assigned priority based on content analysis:

- **Urgent**: Keywords like "urgent", "emergency", "critical", "broken", "down"
- **High**: Keywords like "important", "issue", "problem", "error", "bug"
- **Medium**: Default priority for most emails
- **Low**: Keywords like "question", "inquiry", "suggestion", "feature"

## Tag Generation

Automatic tags are applied based on email content:

- `bot`: Discord bot, commands, slash commands
- `infrastructure`: Server, hosting, deployment
- `permissions`: Roles, access, login, authentication
- `feature-request`: Features, enhancements, improvements
- `bug`: Bugs, errors, broken functionality
- `question`: Questions, help requests, support
- `billing`: Billing, payments, invoices, subscriptions

## Configuration

### Environment Variables

Required environment variables:

```bash
# Email webhook authentication
EMAIL_WEBHOOK_SECRET=your_webhook_secret_here

# Sanity CMS (for incident creation)
SANITY_WRITE_TOKEN=your_sanity_write_token
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id

# Optional: Email service configuration
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@townesdev.com
```

### Email Service Setup

#### Resend Configuration

1. Configure webhook endpoint: `https://your-domain.com/api/email/inbound`
2. Set webhook secret in environment variables
3. Enable relevant webhook events (email received)

#### Other Email Services

The webhook supports multiple formats and can be adapted for:

- SendGrid
- Mailgun
- Postmark
- Custom email services

## Client Setup

### Adding Client Email Addresses

Clients must have their email addresses registered in the TownesDev system:

1. Navigate to client record in admin panel
2. Add primary email address in the "Email" field
3. For organizations, any email from the same domain will match

### Domain-Based Matching

For organizations with multiple email addresses:

- If client record has "support@acme.com"
- Emails from "john@acme.com" or "jane@acme.com" will also match
- This allows team members to create incidents from their work emails

## Monitoring and Logging

The system provides comprehensive logging for debugging and monitoring:

### Log Levels

- **Info**: Successful incident creation, client mapping
- **Warn**: Unknown senders, unsafe attachments
- **Error**: Authentication failures, processing errors

### Logged Information

- Email processing pipeline steps
- Client lookup results and match types
- Parsed content analysis (title, priority, tags)
- Attachment processing and security validation
- Incident creation success/failure

### Example Log Output

```
[Email Webhook] Received payload: { from: "client@example.com", subject: "Bot issue" }
[Email Mapping] Found exact match for client@example.com: Example Corp
[Email Webhook] Parsed email content: { title: "Bot issue", priority: "high", tags: ["bot"] }
[Attachment Processing] Processing 1 attachments
[Email Webhook] Successfully created incident: { incidentId: "abc123", client: "Example Corp" }
```

## Security Considerations

### Webhook Authentication

- Always verify webhook signatures
- Use environment variables for secrets
- Monitor for unauthorized access attempts

### Attachment Security

- File size limits (10MB default)
- Dangerous file type detection
- Content type validation
- Log unsafe attachment attempts

### Email Validation

- Sender email format validation
- Client account verification required
- Domain matching validation

## Troubleshooting

### Common Issues

**"Client not found" errors**:

- Verify client email address is registered in system
- Check domain matching configuration
- Review email extraction logic for complex sender formats

**Authentication failures**:

- Verify webhook secret configuration
- Check email service webhook setup
- Monitor webhook signature format

**Parsing errors**:

- Review email content format
- Check for encoding issues
- Validate attachment structure

### Debug Mode

Enable detailed logging by setting log level to debug in production deployment.

## Future Enhancements

Potential improvements for future releases:

1. **Full Attachment Storage**: Save attachments to cloud storage with security scanning
2. **Thread Management**: Link reply emails to existing incidents
3. **Auto-Assignment**: Route incidents based on content or client preferences
4. **Template Responses**: Send automated acknowledgment emails
5. **Spam Detection**: Implement content filtering and rate limiting
6. **Rich Client Mapping**: Support multiple email addresses per client
7. **Notification Integration**: Alert staff about high-priority incidents

## Testing

Use the following email formats to test the integration:

### Basic Email

```
From: client@example.com
Subject: Test incident
Body: This is a test incident for the email integration.
```

### High Priority Email

```
From: client@example.com
Subject: URGENT: Bot is down
Body: The Discord bot is completely down and not responding to any commands. This is affecting all our users.
```

### Email with Attachments

Send emails with various attachment types to test file processing and security validation.

### Reply Email

```
From: client@example.com
Subject: Re: Bot issue
Body: Thanks for the help. The issue is now resolved.
```
