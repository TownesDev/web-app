/**
 * Test Utilities for PDF Reports and Email Incidents
 * Run these from the browser console or create a test page
 */

// Test PDF Report Generation
async function testPDFGeneration(clientId, month = 'October 2025') {
  try {
    console.log(
      `🔄 Testing PDF generation for client: ${clientId}, month: ${month}`
    )

    const response = await fetch('/api/reports/monthly', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: clientId,
        month: month,
      }),
    })

    console.log(`📊 Response status: ${response.status}`)

    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `test_report_${month.replace(' ', '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      console.log(`✅ PDF generated successfully! Size: ${blob.size} bytes`)
      return { success: true, size: blob.size }
    } else {
      const error = await response.json()
      console.error(`❌ PDF generation failed:`, error)
      return { success: false, error }
    }
  } catch (error) {
    console.error(`💥 Exception during PDF generation:`, error)
    return { success: false, error: error.message }
  }
}

// Test Email to Incident Creation
async function testEmailIncident(emailData) {
  try {
    console.log(`📧 Testing email incident creation:`, emailData)

    const response = await fetch('/api/email/inbound', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': 'test_webhook_secret_123', // Use your actual secret
      },
      body: JSON.stringify(emailData),
    })

    console.log(`📊 Response status: ${response.status}`)

    const result = await response.json()

    if (response.ok) {
      console.log(`✅ Incident created successfully!`, result)
      return { success: true, incident: result.incident }
    } else {
      console.error(`❌ Incident creation failed:`, result)
      return { success: false, error: result }
    }
  } catch (error) {
    console.error(`💥 Exception during incident creation:`, error)
    return { success: false, error: error.message }
  }
}

// Sample test data
const sampleEmailData = {
  from: 'client@example.com',
  subject: 'URGENT: Bot not responding to commands',
  text: 'The Discord bot has stopped responding to slash commands. Users are unable to interact with it. This started about 30 minutes ago.',
  html: '<p>The Discord bot has stopped responding to slash commands. Users are unable to interact with it. This started about 30 minutes ago.</p>',
  timestamp: new Date().toISOString(),
  id: `test_msg_${Date.now()}`,
  attachments: [
    {
      filename: 'bot_error_screenshot.png',
      contentType: 'image/png',
      size: 156789,
      url: 'https://example.com/screenshot.png',
    },
  ],
}

// High priority email test
const urgentEmailData = {
  from: 'admin@acme.com',
  subject: 'CRITICAL: Complete system outage',
  text: 'All services are down. Website not accessible, database connections failing. Need immediate assistance.',
  timestamp: new Date().toISOString(),
  id: `urgent_msg_${Date.now()}`,
  attachments: [],
}

// Simple question email test
const questionEmailData = {
  from: 'user@company.org',
  subject: 'Question about monthly maintenance window',
  text: 'Hi, I wanted to ask about scheduling our monthly maintenance window. When would be the best time this month?',
  timestamp: new Date().toISOString(),
  id: `question_msg_${Date.now()}`,
  attachments: [],
}

// Helper function to run all tests
async function runAllTests(clientId) {
  console.log(`🚀 Starting comprehensive test suite for client: ${clientId}`)
  console.log(`================================================`)

  // Test PDF generation
  console.log(`\n📄 Testing PDF Generation:`)
  const pdfResult = await testPDFGeneration(clientId)

  // Test email incidents with different scenarios
  console.log(`\n📧 Testing Email Incidents:`)

  console.log(`\n1️⃣ Testing urgent incident:`)
  const urgentResult = await testEmailIncident(urgentEmailData)

  console.log(`\n2️⃣ Testing normal incident:`)
  const normalResult = await testEmailIncident(sampleEmailData)

  console.log(`\n3️⃣ Testing question/low priority:`)
  const questionResult = await testEmailIncident(questionEmailData)

  // Summary
  console.log(`\n📊 Test Results Summary:`)
  console.log(`================================================`)
  console.log(`PDF Generation: ${pdfResult.success ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Urgent Email: ${urgentResult.success ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Normal Email: ${normalResult.success ? '✅ PASS' : '❌ FAIL'}`)
  console.log(
    `Question Email: ${questionResult.success ? '✅ PASS' : '❌ FAIL'}`
  )

  return {
    pdf: pdfResult,
    urgent: urgentResult,
    normal: normalResult,
    question: questionResult,
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testPDFGeneration,
    testEmailIncident,
    runAllTests,
    sampleEmailData,
    urgentEmailData,
    questionEmailData,
  }
}

// Usage instructions
console.log(`
🧪 Test Utilities Loaded!

To test PDF generation:
1. testPDFGeneration("your_client_id", "October 2025")

To test email incidents:
1. testEmailIncident(sampleEmailData)
2. testEmailIncident(urgentEmailData)  
3. testEmailIncident(questionEmailData)

To run all tests:
1. runAllTests("your_client_id")

Example:
runAllTests("client-abc-123").then(results => console.log(results));
`)
