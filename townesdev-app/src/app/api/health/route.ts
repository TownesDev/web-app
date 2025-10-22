import { NextResponse } from 'next/server'

export async function GET() {
  // Quick health check - you can extend this with DB/service checks
  return NextResponse.json({ status: 'ok', time: new Date().toISOString() })
}
