# TownesDev API Testing Script (PowerShell)
# Make sure your development server is running on http://localhost:3000

param(
    [string]$ClientId = "your_client_id_here",  # Replace with actual client ID
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Month = "October 2025"
)

Write-Host "🧪 TownesDev API Testing Script" -ForegroundColor Blue
Write-Host "================================" -ForegroundColor Blue
Write-Host ""

# Function to test PDF generation
function Test-PDFGeneration {
    Write-Host "📄 Testing PDF Report Generation..." -ForegroundColor Blue
    Write-Host "Client ID: $ClientId"
    Write-Host "Month: $Month"
    Write-Host ""
    
    if ($ClientId -eq "your_client_id_here") {
        Write-Host "⚠️  Please provide a CLIENT_ID: .\test_apis.ps1 -ClientId 'your_actual_id'" -ForegroundColor Yellow
        return
    }
    
    try {
        $body = @{
            clientId = $ClientId
            month = $Month
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/reports/monthly" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -OutFile "test_report.pdf" `
            -PassThru
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ PDF generated successfully!" -ForegroundColor Green
            $fileSize = (Get-Item "test_report.pdf").Length
            Write-Host "File saved as: test_report.pdf"
            Write-Host "File size: $fileSize bytes"
        }
    }
    catch {
        Write-Host "❌ PDF generation failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Function to test email incidents
function Test-EmailIncident {
    param(
        [string]$Type,
        [string]$Subject,
        [string]$Text,
        [string]$From
    )
    
    Write-Host "📧 Testing $Type Email Incident..." -ForegroundColor Blue
    Write-Host "From: $From"
    Write-Host "Subject: $Subject"
    Write-Host ""
    
    try {
        $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
        $messageId = "${Type}_msg_" + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
        
        $body = @{
            from = $From
            subject = $Subject
            text = $Text
            timestamp = $timestamp
            id = $messageId
            attachments = @()
        } | ConvertTo-Json
        
        $headers = @{
            "Content-Type" = "application/json"
            "x-webhook-signature" = "test_webhook_secret_123"
        }
        
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/email/inbound" `
            -Method POST `
            -Headers $headers `
            -Body $body
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Incident created successfully!" -ForegroundColor Green
            $result = $response.Content | ConvertFrom-Json
            Write-Host "Incident ID: $($result.incident._id)"
        }
    }
    catch {
        Write-Host "❌ Incident creation failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error details: $errorBody" -ForegroundColor Red
        }
    }
    Write-Host ""
}

# Check if server is running
Write-Host "🔍 Checking if development server is running..." -ForegroundColor Blue
try {
    $healthCheck = Invoke-WebRequest -Uri $BaseUrl -Method GET -TimeoutSec 5
    Write-Host "✅ Server is running" -ForegroundColor Green
}
catch {
    Write-Host "❌ Server is not running or not accessible" -ForegroundColor Red
    Write-Host "Please start your development server with: npm run dev"
    exit 1
}
Write-Host ""

# Test PDF Generation
Test-PDFGeneration

# Test Email Incidents
Write-Host "📬 Testing Email to Incident Creation..." -ForegroundColor Blue
Write-Host ""

# Test 1: Urgent incident
Test-EmailIncident -Type "urgent" `
    -Subject "CRITICAL: Complete system outage" `
    -Text "All services are down. Website not accessible, database connections failing. Need immediate assistance." `
    -From "admin@acme.com"

# Test 2: Normal incident  
Test-EmailIncident -Type "normal" `
    -Subject "URGENT: Bot not responding to commands" `
    -Text "The Discord bot has stopped responding to slash commands. Users are unable to interact with it. This started about 30 minutes ago." `
    -From "client@example.com"

# Test 3: Question/Low priority
Test-EmailIncident -Type "question" `
    -Subject "Question about monthly maintenance window" `
    -Text "Hi, I wanted to ask about scheduling our monthly maintenance window. When would be the best time this month?" `
    -From "user@company.org"

Write-Host "🎉 Testing complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Check your Sanity Studio for new incident documents"
Write-Host "2. Open test_report.pdf to verify PDF generation"
Write-Host "3. Check server logs for any errors"