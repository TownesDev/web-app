import { getCurrentClient } from "../../../../lib/auth";
import { getIncidentsByClient } from "../../../../queries/incidents";
import IncidentManager from "../../../../components/IncidentManager";
import { notFound } from "next/navigation";

export default async function IncidentsPage() {
  const client = await getCurrentClient();

  if (!client) {
    notFound();
  }

  const incidents = await getIncidentsByClient(client._id);

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <IncidentManager initialIncidents={incidents} />
      </div>
    </div>
  );
}
