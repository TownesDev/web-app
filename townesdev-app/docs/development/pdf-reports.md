# PDF Reports Generation

## Overview

The PDF Reports feature allows administrators to generate comprehensive monthly reports for clients. These reports include monthly rhythm activities, incident summaries, billing information, and key metrics in a professional PDF format.

## Features

### Report Generation

- **Monthly Data Collection**: Automatically gathers data from multiple sources
- **PDF Generation**: Creates professional, styled PDF reports using Puppeteer
- **Real-time Data**: Reports are generated with current data at time of creation
- **Comprehensive Content**: Includes all major aspects of client service

## User Interface

### Admin Portal

Located at `/admin/reports`, the admin interface provides:

- **Client Selection**: Dropdown with all active clients
- **Month Selection**: Current and previous months available
- **Generate Button**: Initiates PDF generation and download
- **Progress Indicator**: Shows generation status
- **Error Handling**: Clear error messages for troubleshooting

## API Endpoints

### POST `/api/reports/monthly`

Generate a monthly PDF report for a specific client and month.

**Headers:**

- `Content-Type: application/json`

**Request Body:**

```json
{
  "clientId": "client_document_id",
  "month": "January 2024"
}
```

**Response:**

- **Success (200)**: PDF file download with proper headers
- **Error (400)**: Invalid request parameters
- **Error (404)**: Client not found
- **Error (500)**: Generation error
