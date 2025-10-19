"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createMonthlyRhythm, updateMonthlyRhythm } from "@/sanity/actions/monthlyRhythm";

export default function MonthlyRhythmEditor({
  clientId, month, initialValue
}: {
  clientId: string;
  month: string;
  initialValue?: {
    _id: string; hoursIncluded?: number; hoursUsed?: number;
    week1Patch?: string; week2Observability?: string; week3Hardening?: string; week4Report?: string;
  } | null;
}) {
  const [form, setForm] = useState({
    month,
    hoursIncluded: initialValue?.hoursIncluded ?? 0,
    hoursUsed: initialValue?.hoursUsed ?? 0,
    week1Patch: initialValue?.week1Patch ?? "",
    week2Observability: initialValue?.week2Observability ?? "",
    week3Hardening: initialValue?.week3Hardening ?? "",
    week4Report: initialValue?.week4Report ?? "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (initialValue?._id) {
        await updateMonthlyRhythm(initialValue._id, form);
        toast.success("Monthly rhythm updated");
      } else {
        await createMonthlyRhythm({ clientId, ...form });
        toast.success("Monthly rhythm created");
      }
    } catch (err) {
      toast.error("Save failed");
      console.error(err);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-nile-blue-900 mb-6">
          Edit Monthly Rhythm
        </h1>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <input
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-nile-blue-500 focus:ring-nile-blue-500 p-2 border"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
              required
            />
          </div>

          {/* Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hours Included</label>
              <input
                type="number" min={0} step="0.1"
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-nile-blue-500 focus:ring-nile-blue-500 p-2 border"
                value={form.hoursIncluded}
                onChange={(e) => setForm({ ...form, hoursIncluded: parseFloat(e.target.value || "0") })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hours Used</label>
              <input
                type="number" min={0} step="0.1"
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-nile-blue-500 focus:ring-nile-blue-500 p-2 border"
                value={form.hoursUsed}
                onChange={(e) => setForm({ ...form, hoursUsed: parseFloat(e.target.value || "0") })}
              />
            </div>
          </div>

          {/* Weeks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Week 1 – Patch & Review</label>
            <textarea
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-nile-blue-500 focus:ring-nile-blue-500 p-2 border min-h-28"
              value={form.week1Patch}
              onChange={(e) => setForm({ ...form, week1Patch: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Week 2 – Observability</label>
            <textarea
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-nile-blue-500 focus:ring-nile-blue-500 p-2 border min-h-28"
              value={form.week2Observability}
              onChange={(e) => setForm({ ...form, week2Observability: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Week 3 – Hardening</label>
            <textarea
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-nile-blue-500 focus:ring-nile-blue-500 p-2 border min-h-28"
              value={form.week3Hardening}
              onChange={(e) => setForm({ ...form, week3Hardening: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Week 4 – Report</label>
            <textarea
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-nile-blue-500 focus:ring-nile-blue-500 p-2 border min-h-28"
              value={form.week4Report}
              onChange={(e) => setForm({ ...form, week4Report: e.target.value })}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-nile-blue-600 hover:bg-nile-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nile-blue-500"
            >
              Save Monthly Rhythm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}