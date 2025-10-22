import { NextRequest, NextResponse } from "next/server";
import { requireCapability } from "../../../../lib/rbac/guards";
import { collectMonthlyReportData, getCurrentMonth, getPreviousMonth } from "../../../../lib/reportData";
import { generateMonthlyReportPDF } from "../../../../lib/pdfGenerator";

/**
 * Generate monthly PDF report for a client
 * POST /api/reports/monthly
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin capabilities
    await requireCapability("reports:generate");

    const body = await request.json();
    const { clientId, month } = body;

    // Validate required parameters
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Default to previous month if not specified
    const reportMonth = month || getPreviousMonth();

    console.log(`[Report API] Generating report for client ${clientId}, month ${reportMonth}`);

    // Collect report data
    const reportData = await collectMonthlyReportData(clientId, reportMonth);

    // Generate PDF
    const pdfBuffer = await generateMonthlyReportPDF(reportData);

    // Generate filename
    const filename = `${reportData.client.name.replace(/[^a-zA-Z0-9]/g, '_')}_${reportMonth.replace(' ', '_')}_Report.pdf`;

    console.log(`[Report API] Generated PDF report: ${filename} (${pdfBuffer.length} bytes)`);

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('[Report API] Error generating report:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes('Invalid month format')) {
      return NextResponse.json(
        { error: 'Invalid month format. Expected format: "January 2024"' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to generate report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get available report options
 * GET /api/reports/monthly
 */
export async function GET() {
  try {
    await requireCapability("reports:read");

    const currentMonth = getCurrentMonth();
    const previousMonth = getPreviousMonth();

    return NextResponse.json({
      availableMonths: [currentMonth, previousMonth],
      defaultMonth: previousMonth,
      format: 'Month YYYY (e.g., "January 2024")'
    });

  } catch (error) {
    console.error('[Report API] Error getting report options:', error);
    return NextResponse.json(
      { error: 'Failed to get report options' },
      { status: 500 }
    );
  }
}

// Only allow POST and GET requests
export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}