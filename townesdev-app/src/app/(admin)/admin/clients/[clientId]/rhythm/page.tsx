import { getMonthlyRhythmForClientMonth } from "@/queries/monthlyRhythm";
import MonthlyRhythmEditor from "@/components/admin/MonthlyRhythmEditor";

function monthLabel(d = new Date()) {
  return d.toLocaleString("en-US", { month: "long", year: "numeric" }); // e.g., "October 2025"
}

export default async function Page({ params }: { params: { id: string } }) {
  const clientId = params.id;
  const month = monthLabel();
  const doc = await getMonthlyRhythmForClientMonth(clientId, month);
  return (
    <MonthlyRhythmEditor clientId={clientId} month={month} initialValue={doc} />
  );
}
