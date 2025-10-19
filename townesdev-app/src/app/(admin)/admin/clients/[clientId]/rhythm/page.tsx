import { sanity } from "@/lib/client";
import MonthlyRhythmEditor from "@/components/admin/MonthlyRhythmEditor";

function monthLabel(d = new Date()) {
  return d.toLocaleString("en-US", { month: "long", year: "numeric" }); // e.g., "October 2025"
}

export default async function Page({ params }: { params: { clientId: string } }) {
  const clientId = params.clientId;
  const month = monthLabel();

  // Try calling sanity.fetch directly
  console.log("Calling sanity.fetch directly with params:", { clientId, month });
  const doc = await sanity.fetch(
    `*[_type == "monthlyRhythm" && client._ref == $clientId && month == $month][0]{
      _id, month, hoursUsed, hoursIncluded,
      week1Patch, week2Observability, week3Hardening, week4Report
    }`,
    { clientId, month }
  );
  console.log("Direct sanity.fetch result:", doc);

  return (
    <MonthlyRhythmEditor clientId={clientId} month={month} initialValue={doc} />
  );
}
