'use client'

import { useState } from 'react'
import { Download, Mail, FileText, Play } from 'lucide-react'

interface TestResult {
  success: boolean
  message: string
  data?: unknown
}

interface TestResults {
  pdf?: TestResult
  urgent?: TestResult
  normal?: TestResult
  question?: TestResult
}

export default function TestingPage() {
  const [clientId, setClientId] = useState('')
  const [month, setMonth] = useState('October 2025')
  const [results, setResults] = useState<TestResults>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  // Test PDF Generation
  const testPDF = async () => {
    if (!clientId) {
      alert('Please enter a Client ID')
      return
    }

    setLoading((prev) => ({ ...prev, pdf: true }))
    try {
      const response = await fetch('/api/reports/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, month }),
      })

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

        setResults((prev: TestResults) => ({
          ...prev,
          pdf: {
            success: true,
            message: `PDF generated successfully! Size: ${blob.size} bytes`,
          },
        }))
      } else {
        const error = await response.json()
        setResults((prev: TestResults) => ({
          ...prev,
          pdf: {
            success: false,
            message: `Error: ${error.message || 'Unknown error'}`,
          },
        }))
      }
    } catch (error) {
      setResults((prev: TestResults) => ({
        ...prev,
        pdf: {
          success: false,
          message: `Exception: ${(error as Error).message}`,
        },
      }))
    }
    setLoading((prev) => ({ ...prev, pdf: false }))
  }

  // Test Email Incident
  const testEmailIncident = async (type: 'urgent' | 'normal' | 'question') => {
    const emailData = {
      urgent: {
        from: 'admin@acme.com',
        subject: 'CRITICAL: Complete system outage',
        text: 'All services are down. Website not accessible, database connections failing. Need immediate assistance.',
        timestamp: new Date().toISOString(),
        id: `urgent_msg_${Date.now()}`,
        attachments: [],
      },
      normal: {
        from: 'client@example.com',
        subject: 'URGENT: Bot not responding to commands',
        text: 'The Discord bot has stopped responding to slash commands. Users are unable to interact with it. This started about 30 minutes ago.',
        html: '<p>The Discord bot has stopped responding to slash commands. Users are unable to interact with it. This started about 30 minutes ago.</p>',
        timestamp: new Date().toISOString(),
        id: `normal_msg_${Date.now()}`,
        attachments: [
          {
            filename: 'bot_error_screenshot.png',
            contentType: 'image/png',
            size: 156789,
            url: 'https://example.com/screenshot.png',
          },
        ],
      },
      question: {
        from: 'user@company.org',
        subject: 'Question about monthly maintenance window',
        text: 'Hi, I wanted to ask about scheduling our monthly maintenance window. When would be the best time this month?',
        timestamp: new Date().toISOString(),
        id: `question_msg_${Date.now()}`,
        attachments: [],
      },
    }

    setLoading((prev) => ({ ...prev, [type]: true }))
    try {
      const response = await fetch('/api/email/inbound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In production you'd need the actual webhook secret
          'x-webhook-signature': 'test_webhook_secret_123',
        },
        body: JSON.stringify(emailData[type]),
      })

      const result = await response.json()

      if (response.ok) {
        setResults((prev: TestResults) => ({
          ...prev,
          [type]: {
            success: true,
            message: `Incident created successfully! ID: ${result.incident?._id || 'unknown'}`,
            data: result,
          },
        }))
      } else {
        setResults((prev: TestResults) => ({
          ...prev,
          [type]: {
            success: false,
            message: `Error: ${result.message || 'Unknown error'}`,
          },
        }))
      }
    } catch (error) {
      setResults((prev: TestResults) => ({
        ...prev,
        [type]: {
          success: false,
          message: `Exception: ${(error as Error).message}`,
        },
      }))
    }
    setLoading((prev) => ({ ...prev, [type]: false }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            TownesDev Feature Testing
          </h1>
          <p className="text-lg text-gray-700">
            Test the PDF reports and email-to-incident features
          </p>
        </div>

        {/* Configuration */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Test Configuration</h2>
          <p className="text-gray-600 mb-4">Set up your test parameters</p>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="clientId"
                className="block text-sm font-semibold text-gray-800 mb-2"
              >
                Client ID <span className="text-red-500">*</span>
              </label>
              <input
                id="clientId"
                type="text"
                value={clientId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setClientId(e.target.value)
                }
                placeholder="Enter a client ID from your Sanity database"
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
              />
            </div>
            <div>
              <label
                htmlFor="month"
                className="block text-sm font-semibold text-gray-800 mb-2"
              >
                Report Month
              </label>
              <input
                id="month"
                type="text"
                value={month}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMonth(e.target.value)
                }
                placeholder="e.g., October 2025"
                className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* PDF Testing */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Report Generation
          </h2>
          <p className="text-gray-600 mb-4">
            Test monthly PDF report generation
          </p>

          <button
            onClick={testPDF}
            disabled={loading.pdf || !clientId}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium mb-4 ${
              loading.pdf || !clientId
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading.pdf ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Generate Test PDF
              </>
            )}
          </button>

          {results.pdf && (
            <div
              className={`p-4 rounded-md border ${
                results.pdf.success
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {results.pdf.message}
            </div>
          )}
        </div>

        {/* Email Testing */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email to Incident Creation
          </h2>
          <p className="text-gray-600 mb-4">
            Test different types of email incidents
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <button
                onClick={() => testEmailIncident('urgent')}
                disabled={loading.urgent}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium ${
                  loading.urgent
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {loading.urgent ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Test Urgent Email
                  </>
                )}
              </button>
              {results.urgent && (
                <div
                  className={`mt-2 p-2 rounded text-sm ${
                    results.urgent.success
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {results.urgent.message}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => testEmailIncident('normal')}
                disabled={loading.normal}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium ${
                  loading.normal
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading.normal ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Test Normal Email
                  </>
                )}
              </button>
              {results.normal && (
                <div
                  className={`mt-2 p-2 rounded text-sm ${
                    results.normal.success
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {results.normal.message}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => testEmailIncident('question')}
                disabled={loading.question}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium ${
                  loading.question
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {loading.question ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Test Question Email
                  </>
                )}
              </button>
              {results.question && (
                <div
                  className={`mt-2 p-2 rounded text-sm ${
                    results.question.success
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {results.question.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
          <ol className="space-y-2 list-decimal list-inside">
            <li>
              <strong>Get a Client ID:</strong> Go to your Sanity Studio and
              copy a client document ID
            </li>
            <li>
              <strong>Test PDF:</strong> Enter the client ID and click
              &ldquo;Generate Test PDF&rdquo; - it should download a PDF
            </li>
            <li>
              <strong>Test Emails:</strong> Click each email test button to
              simulate different types of incidents
            </li>
            <li>
              <strong>Verify Results:</strong> Check your Sanity Studio for new
              incident documents
            </li>
            <li>
              <strong>Check Console:</strong> Open browser dev tools to see
              detailed logs
            </li>
          </ol>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p>
              <strong>Note:</strong> Make sure your development server is
              running and environment variables are configured correctly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
