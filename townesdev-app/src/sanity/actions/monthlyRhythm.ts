"use server";

import { sanityWrite } from "../../lib/client";

export async function createMonthlyRhythm(input: {
  clientId: string;
  month: string;
  hoursIncluded?: number;
  hoursUsed?: number;
  week1Patch?: string;
  week2Observability?: string;
  week3Hardening?: string;
  week4Report?: string;
}) {
  return sanityWrite.create({
    _type: "monthlyRhythm",
    client: { _type: "reference", _ref: input.clientId },
    month: input.month,
    hoursIncluded: input.hoursIncluded ?? 0,
    hoursUsed: input.hoursUsed ?? 0,
    week1Patch: input.week1Patch ?? "",
    week2Observability: input.week2Observability ?? "",
    week3Hardening: input.week3Hardening ?? "",
    week4Report: input.week4Report ?? "",
  });
}

export async function updateMonthlyRhythm(id: string, fields: Partial<{
  month: string;
  hoursIncluded: number;
  hoursUsed: number;
  week1Patch: string;
  week2Observability: string;
  week3Hardening: string;
  week4Report: string;
}>) {
  return sanityWrite.patch(id).set(fields).commit();
}