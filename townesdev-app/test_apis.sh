#!/bin/bash

# TownesDev API Testing Script
# Make sure your development server is running on http://localhost:3000

BASE_URL="http://localhost:3000"
CLIENT_ID="your_client_id_here"  # Replace with actual client ID
MONTH="October 2025"

echo "🧪 TownesDev API Testing Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test PDF generation
test_pdf() {
    echo -e "${BLUE}📄 Testing PDF Report Generation...${NC}"
    echo "Client ID: $CLIENT_ID"
    echo "Month: $MONTH"
    echo ""
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "{\"clientId\":\"$CLIENT_ID\",\"month\":\"$MONTH\"}" \
        "$BASE_URL/api/reports/monthly" \
        -o "test_report.pdf")
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ PDF generated successfully!${NC}"
        echo "File saved as: test_report.pdf"
        file_size=$(stat -c%s "test_report.pdf" 2>/dev/null || stat -f%z "test_report.pdf" 2>/dev/null)
        echo "File size: $file_size bytes"
    else
        echo -e "${RED}❌ PDF generation failed (HTTP $http_code)${NC}"
        cat test_report.pdf 2>/dev/null
    fi
    echo ""
}

# Function to test email incidents
test_email_incident() {
    local type=$1
    local subject=$2
    local text=$3
    local from=$4
    
    echo -e "${BLUE}📧 Testing $type Email Incident...${NC}"
    echo "From: $from"
    echo "Subject: $subject"
    echo ""
    
    json_payload=$(cat <<EOF
{
    "from": "$from",
    "subject": "$subject", 
    "text": "$text",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
    "id": "${type}_msg_$(date +%s)",
    "attachments": []
}
EOF
)
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "x-webhook-signature: test_webhook_secret_123" \
        -d "$json_payload" \
        "$BASE_URL/api/email/inbound")
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ Incident created successfully!${NC}"
        echo "$response_body" | jq . 2>/dev/null || echo "$response_body"
    else
        echo -e "${RED}❌ Incident creation failed (HTTP $http_code)${NC}"
        echo "$response_body" | jq . 2>/dev/null || echo "$response_body"
    fi
    echo ""
}

# Check if CLIENT_ID is set
if [ "$CLIENT_ID" = "your_client_id_here" ]; then
    echo -e "${YELLOW}⚠️  Please set CLIENT_ID variable at the top of this script${NC}"
    echo -e "${YELLOW}   Get a client ID from your Sanity Studio${NC}"
    echo ""
fi

# Check if server is running
echo -e "${BLUE}🔍 Checking if development server is running...${NC}"
if curl -s "$BASE_URL" > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running or not accessible${NC}"
    echo "Please start your development server with: npm run dev"
    exit 1
fi
echo ""

# Test PDF Generation
if [ "$CLIENT_ID" != "your_client_id_here" ]; then
    test_pdf
else
    echo -e "${YELLOW}⏭️  Skipping PDF test (CLIENT_ID not set)${NC}"
    echo ""
fi

# Test Email Incidents
echo -e "${BLUE}📬 Testing Email to Incident Creation...${NC}"
echo ""

# Test 1: Urgent incident
test_email_incident "urgent" \
    "CRITICAL: Complete system outage" \
    "All services are down. Website not accessible, database connections failing. Need immediate assistance." \
    "admin@acme.com"

# Test 2: Normal incident  
test_email_incident "normal" \
    "URGENT: Bot not responding to commands" \
    "The Discord bot has stopped responding to slash commands. Users are unable to interact with it. This started about 30 minutes ago." \
    "client@example.com"

# Test 3: Question/Low priority
test_email_incident "question" \
    "Question about monthly maintenance window" \
    "Hi, I wanted to ask about scheduling our monthly maintenance window. When would be the best time this month?" \
    "user@company.org"

echo -e "${GREEN}🎉 Testing complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Check your Sanity Studio for new incident documents"
echo "2. Open test_report.pdf to verify PDF generation"
echo "3. Check server logs for any errors"