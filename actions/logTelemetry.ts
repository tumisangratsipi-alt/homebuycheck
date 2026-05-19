"use server";

// actions/logTelemetry.ts — homebuycheck.com

import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export interface HomeBuyTelemetry {
  annual_income: number;
  monthly_debts: number;
  down_payment: number;
  interest_rate: number;
  loan_term_years: 15 | 30;
  time_horizon_years: number;
  state_code: string;
}

export async function logTelemetry(data: HomeBuyTelemetry): Promise<void> {
  const supabase = getClient();
  if (!supabase) return;

  const { error } = await supabase.from("calculator_telemetry").insert({
    app_source: "homebuycheck.com",
    input_data: data,
  });

  if (error) {
    console.error("[telemetry:homebuycheck]", error.message);
  }
}
