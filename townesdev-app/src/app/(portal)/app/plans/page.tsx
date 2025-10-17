import { getSession } from "../../../../lib/session";
import { getClientByUserId } from "../../../../lib/stripe";
import { sanity } from "../../../../lib/client";
import { redirect } from "next/navigation";
import { BillingPortalButton } from "./BillingPortalButton";

interface Retainer {
  _id: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  hoursIncluded: number;
  hoursUsed: number;
  plan?: {
    _id: string;
    name: string;
    price: string;
    features: string[];
  };
  asset?: {
    _id: string;
    title: string;
  };
}

async function getClientRetainers(clientId: string): Promise<Retainer[]> {
  console.log("Querying retainers for clientId:", clientId);
  const retainers = await sanity.fetch(
    `*[_type=="retainer" && client._ref==$clientId]{
      _id,
      status,
      periodStart,
      periodEnd,
      hoursIncluded,
      hoursUsed,
      plan->{
        _id,
        name,
        price,
        features
      },
      asset->{
        _id,
        title
      }
    }`,
    { clientId }
  );
  console.log("Found retainers:", retainers);
  return retainers;
}

export default async function ClientPlansPage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/signin");
  }

  const client = await getClientByUserId(session.id);
  if (!client) {
    console.log("No client found for user:", session.id);
    redirect("/auth/signin");
  }

  console.log("Found client:", client);
  const retainers = await getClientRetainers(client._id);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Plans & Billing
          </h1>
          <p className="text-gray-600">
            Manage your active subscriptions and billing information.
          </p>
        </div>

        {/* Billing Portal Access */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Billing Management
          </h2>
          <p className="text-gray-600 mb-4">
            Update payment methods, view invoices, and manage your subscription
            from your Stripe billing portal.
          </p>
          <BillingPortalButton />
        </div>

        {/* Active Retainers */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Active Plans
          </h2>

          {retainers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                You don&apos;t have any active plans yet.
              </p>
              <a
                href="/plans"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-block"
              >
                Browse Plans
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {retainers.map((retainer: Retainer) => (
                <div
                  key={retainer._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {retainer.plan?.name || "Unknown Plan"}
                      </h3>
                      {retainer.asset && (
                        <p className="text-sm text-gray-600">
                          Asset: {retainer.asset.title}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        retainer.status === "active"
                          ? "bg-green-100 text-green-800"
                          : retainer.status === "canceled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {retainer.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-700">Hours Included</p>
                      <p className="font-semibold text-gray-900">
                        {retainer.hoursIncluded}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700">Hours Used</p>
                      <p className="font-semibold text-gray-900">
                        {retainer.hoursUsed || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700">Period Start</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(retainer.periodStart).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700">Period End</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(retainer.periodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
