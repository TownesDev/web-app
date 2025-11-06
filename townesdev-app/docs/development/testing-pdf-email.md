# Testing Guide: PDF Reports & Email Incidents

## Prerequisites for Testing

### 1. Development Environment Setup

```powershell
cd c:\TownesDev\app\web\townesdev-app
npm install  # Ensure Puppeteer is installed
npm run dev  # Start development server
```

### 2. Required Environment Variables

Create or update `.env.local`:

```powershell
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

```powershell
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
