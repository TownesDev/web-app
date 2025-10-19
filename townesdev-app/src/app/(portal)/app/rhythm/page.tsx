import { getCurrentClient } from "@/lib/auth";
import { getMonthlyRhythmByClient } from "@/queries/monthlyRhythm";
import RhythmTimeline from "@/components/portal/RhythmTimeline";
import { notFound } from "next/navigation";

export default async function RhythmPage() {
  const client = await getCurrentClient();

  if (!client) {
    notFound();
  }

  const rhythmItems = await getMonthlyRhythmByClient(client._id);
  const retainerHoursIncluded = client.selectedPlan?.retainerHours || 0;

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-nile-blue-900 mb-4">
            Monthly Rhythm
          </h1>
          <p className="text-gray-600">
            View your maintenance schedules and monthly updates.
          </p>
        </div>

        <RhythmTimeline
          items={rhythmItems}
          retainerHoursIncluded={retainerHoursIncluded}
        />
      </div>
    </div>
  );
}
