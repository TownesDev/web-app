import { runAdminQuery } from '@/lib/admin/client'
import { qMonthlyRhythmForClientMonth } from '@/sanity/lib/queries'
import MonthlyRhythmEditor from '@/components/admin/MonthlyRhythmEditor'

function monthLabel(d = new Date()) {
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' }) // e.g., "October 2025"
}

export default async function Page({
  params,
}: {
  params: { clientId: string }
}) {
  const clientId = params.clientId
  const month = monthLabel()
  const doc = await runAdminQuery(qMonthlyRhythmForClientMonth, { clientId, month })

  return (
    <MonthlyRhythmEditor clientId={clientId} month={month} initialValue={doc} />
  )
}
