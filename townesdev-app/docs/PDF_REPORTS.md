# PDF Reports Generation

## Overview

The PDF Reports feature allows administrators to generate comprehensive monthly reports for clients. These reports include monthly rhythm activities, incident summaries, billing information, and key metrics in a professional PDF format.

## Features

### Report Generation
- **Monthly Data Collection**: Automatically gathers data from multiple sources
- **PDF Generation**: Creates professional, styled PDF reports using Puppeteer
- **Real-time Data**: Reports are generated with current data at time of creation
- **Comprehensive Content**: Includes all major aspects of client service

### Data Sources
The system collects data from:
- **Monthly Rhythm**: Weekly activities, hours used, and progress notes
- **Incidents**: Reported issues, resolution status, and time tracking
- **Invoices**: Billing information, payment status, and amounts
- **Client Information**: Plan details, contact info, and service configuration

### Access Control
- **Admin/Staff**: Can generate reports for any client and any month
- **Clients**: Can view information about reports and request generation
- **RBAC Integration**: Uses existing role-based access control system

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

**Example:**
```javascript
const response = await fetch('/api/reports/monthly', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: 'client-123',
    month: 'December 2023'
  })
});

if (response.ok) {
  const blob = await response.blob();
  // Handle PDF download
}
```

### GET `/api/reports/monthly`
Get available report options and format information.

**Response:**
```json
{
  "availableMonths": ["January 2024", "December 2023"],
  "defaultMonth": "December 2023",
  "format": "Month YYYY (e.g., \"January 2024\")"
}
```

## User Interface

### Admin Portal
Located at `/admin/reports`, the admin interface provides:
- **Client Selection**: Dropdown with all active clients
- **Month Selection**: Current and previous months available
- **Generate Button**: Initiates PDF generation and download
- **Progress Indicator**: Shows generation status
- **Error Handling**: Clear error messages for troubleshooting

### Client Portal
Located at `/app/reports`, the client interface shows:
- **Report Information**: What's included in monthly reports
- **Request Process**: How to request reports from account manager
- **Schedule Information**: When reports are typically generated
- **Coming Soon**: Future self-service features

## Report Content

### Executive Summary
- **Service Hours**: Total hours used (rhythm + incidents)
- **Incident Metrics**: Total, resolved, and critical incidents
- **Billing Summary**: Invoice amounts and payment status

### Monthly Rhythm Section
- **Hours Tracking**: Used vs. included hours
- **Weekly Activities**: 
  - Week 1: Patch and Review activities
  - Week 2: Observability tasks
  - Week 3: Hardening efforts
  - Week 4: Report generation

### Incidents Section
- **Incident Details**: Title, description, severity, status
- **Time Tracking**: Hours spent on resolution
- **Timeline**: Reported and resolved dates
- **Status Indicators**: Visual status and severity markers

### Invoices Section
- **Invoice List**: Number, amount, dates, status
- **Payment Tracking**: Paid vs. pending invoices
- **Currency Display**: Proper formatting for amounts

## Configuration

### Environment Variables
```bash
# Required for PDF generation
PUPPETEER_EXECUTABLE_PATH=/path/to/chrome  # Optional: Custom Chrome path

# Sanity CMS access
SANITY_READ_TOKEN=your_read_token
SANITY_WRITE_TOKEN=your_write_token

# RBAC permissions
# Reports capabilities: reports:read, reports:generate
```

### Puppeteer Configuration
The system uses Puppeteer with these settings:
- **Headless Mode**: Enabled for server environments
- **PDF Format**: A4 with 1-inch margins
- **Print Background**: Enabled for proper styling
- **Wait Strategy**: Network idle for complete rendering

### Performance Considerations
- **Memory Usage**: Puppeteer can be memory-intensive
- **Generation Time**: Large reports may take 10-30 seconds
- **Concurrent Requests**: Limit simultaneous report generation
- **Browser Pool**: Consider browser instance pooling for high load

## Troubleshooting

### Common Issues

**PDF Generation Fails:**
- Check Puppeteer installation: `npm list puppeteer`
- Verify Chrome/Chromium availability
- Check memory limits and server resources
- Review Puppeteer logs for specific errors

**Missing Data in Reports:**
- Verify client has monthly rhythm for specified month
- Check incident and invoice date filtering
- Confirm client ID is valid and accessible
- Review Sanity query permissions

**Permission Errors:**
- Verify user has `reports:generate` capability
- Check RBAC role assignments
- Confirm authentication token validity
- Review access control logs

**Large Report Performance:**
- Monitor server memory usage during generation
- Consider pagination for reports with many incidents
- Optimize HTML/CSS for faster rendering
- Implement timeout handling for long generations

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=puppeteer:*
```

### Error Monitoring
The system logs errors at multiple levels:
- **Info**: Successful report generation
- **Warn**: Performance issues or large data sets
- **Error**: Generation failures, missing data, permission issues

## Future Enhancements

### Planned Features
1. **Report Scheduling**: Automated monthly generation
2. **Email Delivery**: Automatic report distribution
3. **Template Customization**: Client-specific report styling
4. **Historical Archive**: Report storage and retrieval system
5. **Custom Date Ranges**: Flexible reporting periods
6. **Export Formats**: Excel, CSV, and other formats
7. **Report Caching**: Store generated reports for quick access
8. **Batch Generation**: Process multiple reports efficiently

### Technical Improvements
1. **Browser Pool**: Reuse Puppeteer instances for better performance
2. **Async Processing**: Background report generation with notifications
3. **CDN Storage**: Store reports in cloud storage for faster access
4. **Template Engine**: More flexible report layout system
5. **Data Aggregation**: Pre-computed metrics for faster generation
6. **Memory Optimization**: Streaming and chunked processing
7. **Error Recovery**: Retry logic and graceful failure handling

## Security Considerations

### Data Protection
- **Access Control**: Strict RBAC enforcement
- **Data Filtering**: Client-specific data isolation
- **Secure Storage**: Temporary files cleaned up after generation
- **Audit Logging**: Track all report generation activities

### PDF Security
- **No External Resources**: All assets embedded in PDF
- **Clean HTML**: Sanitized content to prevent injection
- **File Validation**: PDF integrity checks
- **Temporary Files**: Secure cleanup of intermediate files

## Testing

### Test Scenarios
1. **Successful Generation**: Valid client and month
2. **Missing Data**: Client without monthly rhythm
3. **Empty Reports**: Months with no incidents/invoices
4. **Large Data Sets**: Clients with many incidents
5. **Permission Errors**: Unauthorized access attempts
6. **Invalid Parameters**: Malformed requests

### Load Testing
- Test concurrent report generation
- Monitor memory usage under load
- Verify timeout handling
- Check resource cleanup

### Integration Testing
- End-to-end report generation flow
- Admin UI functionality
- Client portal information display
- API endpoint responses

## Deployment

### Server Requirements
- **Node.js**: Version 18+ for Puppeteer compatibility
- **Memory**: Minimum 2GB RAM for PDF generation
- **Storage**: Temporary space for intermediate files
- **Chrome/Chromium**: For headless browser operations

### Production Setup
1. Install Puppeteer dependencies on server
2. Configure Chrome executable path if needed
3. Set appropriate memory limits
4. Enable debug logging for initial deployment
5. Monitor resource usage and performance
6. Set up error alerting and monitoring

### Docker Considerations
```dockerfile
# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    chromium-browser \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Chrome executable path
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

This comprehensive PDF reporting system provides a solid foundation for client reporting while maintaining security, performance, and usability standards.