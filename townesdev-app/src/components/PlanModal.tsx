'use client'

interface Plan {
  name: string
  price: string
  features: string[]
  description?: string
  content?: string
}

interface PlanModalProps {
  plan: Plan | null
  isOpen: boolean
  onClose: () => void
}

export default function PlanModal({ plan, isOpen, onClose }: PlanModalProps) {
  if (!isOpen || !plan) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-nile-blue-900">
              {plan.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
          <p className="text-nile-blue-600 font-semibold text-lg mb-4">
            {plan.price}
          </p>
          {plan.description && (
            <p className="text-gray-600 mb-4">{plan.description}</p>
          )}
          <h3 className="text-lg font-semibold text-nile-blue-900 mb-2">
            Features
          </h3>
          <ul className="list-disc list-inside space-y-1 mb-4">
            {plan.features.map((feature, index) => (
              <li key={index} className="text-gray-700">
                {feature}
              </li>
            ))}
          </ul>
          {plan.content && (
            <div className="text-gray-600">
              <h3 className="text-lg font-semibold text-nile-blue-900 mb-2">
                Details
              </h3>
              <div className="prose prose-sm max-w-none">{plan.content}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
