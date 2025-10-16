import { PlanCard } from "../../../components/PlanCard";
import { sanity } from "../../../lib/client";
import { qPlans } from "../../../sanity/lib/queries";

interface Plan {
  _id: string;
  name: string;
  price: string;
  features: string[];
  description: string;
}

async function getPlans(): Promise<Plan[]> {
  const plans = await sanity.fetch(qPlans);
  return plans;
}

export default async function PlansPage() {
  const plans = await getPlans();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your business needs. All plans include
            our core features with different levels of support and
            customization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan._id}
              name={plan.name}
              price={plan.price}
              features={plan.features}
              description={plan.description}
              isPopular={index === 1} // Make the middle plan "popular"
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Need a custom solution? Contact us for enterprise pricing.
          </p>
          <button className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}
