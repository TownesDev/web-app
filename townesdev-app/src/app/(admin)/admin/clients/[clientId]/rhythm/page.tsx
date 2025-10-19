import { getMonthlyRhythmForClientMonth } from "@/queries/monthlyRhythm";
import MonthlyRhythmEditor from "@/components/admin/MonthlyRhythmEditor";
import { runQuery } from "@/lib/client";
import { qMonthlyRhythmForClientMonth } from "@/sanity/lib/queries";

function monthLabel(d = new Date()) {
  return d.toLocaleString("en-US", { month: "long", year: "numeric" }); // e.g., "October 2025"
}

export default async function Page({ params }: { params: { id: string } }) {
  const clientId = params.id;
  const month = monthLabel();

  // Try direct query call for debugging
  const doc = await runQuery(qMonthlyRhythmForClientMonth, { clientId, month });

  return (
    <MonthlyRhythmEditor clientId={clientId} month={month} initialValue={doc} />
  );
}
