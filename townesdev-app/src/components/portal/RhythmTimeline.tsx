'use client'

/**
 * RhythmTimeline Component
 * Displays monthly rhythm entries with expandable week sections and hours tracking
 */

import { useState } from 'react'
import { ChevronDown, ChevronRight, Clock, AlertTriangle } from 'lucide-react'

interface MonthlyRhythm {
  _id: string
  month: string
  monthDate?: string
  hoursUsed?: number
  hoursIncluded?: number
  week1Patch?: string
  week2Observability?: string
  week3Hardening?: string
  week4Report?: string
}

interface RhythmTimelineProps {
  items: MonthlyRhythm[]
  retainerHoursIncluded?: number
}

export default function RhythmTimeline({
  items,
  retainerHoursIncluded,
}: RhythmTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const calculateHours = (item: MonthlyRhythm) => {
    const included = item.hoursIncluded || retainerHoursIncluded || 0
    const used = item.hoursUsed || 0
    const percentage = included > 0 ? (used / included) * 100 : 0
    const overage = used - included

    return { included, used, percentage, overage }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-nile-blue-500'
  }

  const formatWeekContent = (content?: string) => {
    if (!content) return 'No content available'
    return content
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No rhythm entries yet
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Your monthly check-ins will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const { included, used, percentage, overage } = calculateHours(item)
        const isExpanded = expandedItems.has(item._id)

        return (
          <div
            key={item._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            {/* Header */}
            <div
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpanded(item._id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  toggleExpanded(item._id)
                }
              }}
              aria-expanded={isExpanded}
              aria-label={`Toggle details for ${item.month}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-nile-blue-900">
                      {item.month}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {used} of {included} hours used
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Hours Progress Bar */}
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(percentage)} transition-all duration-300`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>

                  {/* Overage Badge */}
                  {overage > 0 && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      <span>+{overage.toFixed(1)}h over</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-6 pb-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Week 1 - Patch and Review
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {formatWeekContent(item.week1Patch)}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Week 2 - Observability
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {formatWeekContent(item.week2Observability)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Week 3 - Hardening
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {formatWeekContent(item.week3Hardening)}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Week 4 - Report
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {formatWeekContent(item.week4Report)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
