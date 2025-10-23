# Testing Guide: PDF Reports & Email Incidents

## Prerequisites for Testing

### 1. Development Environment Setup

```bash
cd c:\TownesDev\app\web\townesdev-app
npm install  # Ensure Puppeteer is installed
npm run dev  # Start development server
```

### 2. Required Environment Variables

Create or update `.env.local`:

```bash
# Core Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_READ_TOKEN=your_read_token
SANITY_WRITE_TOKEN=your_write_token

# Email Integration
EMAIL_WEBHOOK_SECRET=test_webhook_secret_123
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@townesdev.com

# Authentication (for testing)
JWT_SECRET=your_jwt_secret_for_testing
```

### 3. Test Data Setup

You'll need some test data in Sanity:

- At least one client with email address
- A monthly rhythm document for that client
- Some test incidents
- Test invoices

---

## Testing PDF Report Generation

### Method 1: Admin UI Testing (Recommended)

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Access the admin interface:**
   - Navigate to: `http://localhost:3000/admin/reports`
   - You'll need to be authenticated as an admin user

3. **Generate a test report:**
   - Select a client from the dropdown
   - Choose a month (current or previous month)
   - Click "Generate PDF Report"
   - The PDF should download automatically

### Method 2: Direct API Testing

1. **Test the API endpoint directly using curl:**

   ```bash
   curl -X POST http://localhost:3000/api/reports/monthly \
     -H "Content-Type: application/json" \
     -H "Cookie: your_session_cookie" \
     -d '{
       "clientId": "your_client_id",
       "month": "October 2025"
     }' \
     --output test_report.pdf
   ```

2. **Or use a tool like Postman:**
   - URL: `POST http://localhost:3000/api/reports/monthly`
   - Headers: `Content-Type: application/json`
   - Body:
     ```json
     {
       "clientId": "client_document_id_from_sanity",
       "month": "October 2025"
     }
     ```

### Method 3: Browser Developer Tools

1. Open browser dev tools (F12)
2. Navigate to admin reports page
3. Use the Network tab to monitor the API call
4. Generate a report and inspect the response

### Troubleshooting PDF Generation

**Common Issues:**

1. **Puppeteer Installation:**

   ```bash
   # If PDF generation fails, reinstall Puppeteer
   npm uninstall puppeteer
   npm install puppeteer
   ```

2. **Memory Issues:**

   ```bash
   # Increase Node.js memory limit
   node --max-old-space-size=4096 node_modules/.bin/next dev
   ```

3. **Chrome/Chromium Issues:**
   ```bash
   # Set custom Chrome path if needed
   export PUPPETEER_EXECUTABLE_PATH="/path/to/chrome"
   ```

---

## Testing Email to Incident Creation

### Method 1: Webhook Testing Tool (Recommended)

1. **Use ngrok to expose your local server:**

   ```bash
   # Install ngrok if you haven't already
   npm install -g ngrok

   # Expose your local server
   ngrok http 3000
   ```

2. **Create a test webhook payload:**

   ```json
   {
     "from": "client@example.com",
     "subject": "URGENT: Bot not responding",
     "text": "The Discord bot has been down for 30 minutes and users are complaining.",
     "html": "<p>The Discord bot has been down for 30 minutes and users are complaining.</p>",
     "timestamp": "2025-10-22T10:30:00Z",
     "id": "msg_test_123",
     "attachments": [
       {
         "filename": "screenshot.png",
         "contentType": "image/png",
         "size": 245760,
         "url": "https://example.com/screenshot.png"
       }
     ]
   }
   ```

3. **Send the webhook using curl:**
   ```bash
   curl -X POST https://your-ngrok-url.ngrok.io/api/email/inbound \
     -H "Content-Type: application/json" \
     -H "x-webhook-signature: test_webhook_secret_123" \
     -d @test_email_payload.json
   ```

### Method 2: Direct API Testing

1. **Test with curl locally:**
   ```bash
   curl -X POST http://localhost:3000/api/email/inbound \
     -H "Content-Type: application/json" \
     -H "x-webhook-signature: test_webhook_secret_123" \
     -d '{
       "from": "client@example.com",
       "subject": "Test incident creation",
       "text": "This is a test email to create an incident",
       "timestamp": "2025-10-22T10:30:00Z",
       "id": "test_msg_123"
     }'
   ```

### Method 3: Postman/Insomnia Testing

1. **Set up the request:**
   - Method: POST
   - URL: `http://localhost:3000/api/email/inbound`
   - Headers:
     ```
     Content-Type: application/json
     x-webhook-signature: test_webhook_secret_123
     ```

2. **Request body:**
   ```json
   {
     "from": "test@client-domain.com",
     "subject": "Critical: Database connection lost",
     "text": "Our application lost connection to the database at 10:15 AM. Users cannot log in.",
     "html": "<p>Our application lost connection to the database at 10:15 AM. Users cannot log in.</p>",
     "timestamp": "2025-10-22T10:15:00Z",
     "id": "msg_critical_001",
     "attachments": []
   }
   ```

### Method 4: Email Service Integration

1. **Set up Resend webhook (if using Resend):**
   - Go to Resend dashboard
   - Add webhook endpoint: `https://your-domain.com/api/email/inbound`
   - Configure to send actual emails

2. **Test with real emails:**
   - Send an email to your configured address
   - Check if incident is created in Sanity

---

## Verification Steps

### For PDF Reports:

1. **Check the generated PDF:**
   - Should download as a properly named file
   - Contains client information
   - Includes monthly rhythm data
   - Shows incidents for the month
   - Displays invoice information
   - Professional formatting and styling

2. **Verify data accuracy:**
   - Compare PDF content with Sanity data
   - Check date filtering (incidents/invoices for correct month)
   - Verify calculations (hours, totals, counts)

3. **Check admin logs:**
   ```bash
   # In development console, look for:
   [Report Data] Collecting data for client...
   [PDF Generation] Starting PDF generation...
   [PDF Generation] Successfully generated PDF...
   ```

### For Email Incidents:

1. **Check incident creation in Sanity:**
   - New incident document should appear
   - Correct client reference
   - Parsed title and description
   - Appropriate priority/severity
   - Email metadata stored

2. **Verify parsing accuracy:**
   - Subject cleaned (removes "Re:", "Fwd:")
   - Priority detected from content
   - Tags generated based on keywords
   - Attachments cataloged

3. **Check webhook logs:**
   ```bash
   # Look for in development console:
   [Email Webhook] Received payload...
   [Email Mapping] Found exact match for...
   [Email Webhook] Parsed email content...
   [Email Webhook] Successfully created incident...
   ```

---

## Testing Scenarios

### PDF Reports Test Cases:

1. **Happy Path:**
   - Client with complete data (rhythm, incidents, invoices)
   - Should generate comprehensive report

2. **Minimal Data:**
   - Client with only basic info
   - Should generate report with "No data" messages

3. **Large Dataset:**
   - Client with many incidents (10+)
   - Should handle large reports gracefully

4. **Error Cases:**
   - Invalid client ID → 404 error
   - Invalid month format → 400 error
   - Missing permissions → 403 error

### Email Incidents Test Cases:

1. **Basic Email:**
   - Simple subject and body
   - Known client email
   - Should create standard incident

2. **Priority Detection:**
   - Subject: "URGENT: System down"
   - Should detect high/urgent priority

3. **Reply Handling:**
   - Subject: "Re: Previous issue"
   - Should handle as reply with thread info

4. **Attachments:**
   - Email with image attachments
   - Should catalog attachments safely

5. **Unknown Sender:**
   - Email from unregistered address
   - Should return 404 with clear message

6. **Domain Matching:**
   - Email from same domain as registered client
   - Should match via domain

---

## Development Tools

### Useful Browser Extensions:

- **JSON Formatter** - For viewing API responses
- **REST Client** - For testing API endpoints
- **React Developer Tools** - For debugging UI components

### Command Line Tools:

```bash
# Monitor logs in real-time
npm run dev | grep -E "(Email|PDF|Report)"

# Test with different payloads
curl -X POST localhost:3000/api/email/inbound \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: test_webhook_secret_123" \
  -d @various_test_payloads.json
```

### Database Monitoring:

- Use Sanity Studio to monitor incident creation
- Check Vision (Sanity's query tool) for data verification

This comprehensive testing approach will help you verify both features work correctly in your development environment!
