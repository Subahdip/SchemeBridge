/**
 * SchemeBridge - Database Access Layer for Government Scheme Catalog
 * 
 * Fetches and maps audited schemes from Supabase PostgreSQL (Source of Truth).
 */

import { SchemeDefinition } from "../schemes";
import { getSupabaseClient } from "./supabase";

export interface DatabaseSchemeRow {
  id: string;
  scheme_name: string;
  category: "MICRO" | "MEDIUM" | "LARGE" | "EDUCATION" | "PERSONAL";
  purpose_category: "business" | "education" | "personal" | "other" | "all";
  max_loan_amount: number | string;
  income_limit: number | string;
  interest_rate: number | string;
  interest_rate_text: string;
  govt_coverage_percent: number | string;
  promoter_margin_percent: number | string;
  moratorium_available: boolean;
  moratorium_details?: string | null;
  repayment_period?: string | null;
  target_beneficiaries: string;
  description: string;
  key_highlights: string[] | string | null;
  semantic_description: string;
  official_source?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Maps a database row (snake_case) to the SchemeDefinition model (camelCase).
 */
export function mapDatabaseRowToScheme(row: DatabaseSchemeRow): SchemeDefinition {
  let parsedHighlights: string[] = [];
  if (Array.isArray(row.key_highlights)) {
    parsedHighlights = row.key_highlights;
  } else if (typeof row.key_highlights === "string") {
    try {
      const parsed = JSON.parse(row.key_highlights);
      parsedHighlights = Array.isArray(parsed) ? parsed : [row.key_highlights];
    } catch {
      parsedHighlights = [row.key_highlights];
    }
  }

  return {
    id: String(row.id),
    schemeName: String(row.scheme_name || ""),
    category: row.category,
    purposeCategory: row.purpose_category,
    maxLoanAmount: Number(row.max_loan_amount || 0),
    incomeLimit: Number(row.income_limit || 0),
    interestRate: Number(row.interest_rate || 0),
    interestRateText: String(row.interest_rate_text || `${row.interest_rate}% p.a.`),
    govtCoveragePercent: Number(row.govt_coverage_percent || 90),
    promoterMarginPercent: Number(row.promoter_margin_percent || 10),
    moratoriumAvailable: Boolean(row.moratorium_available),
    moratoriumDetails: row.moratorium_details ? String(row.moratorium_details) : undefined,
    repaymentPeriod: row.repayment_period ? String(row.repayment_period) : undefined,
    targetBeneficiaries: String(row.target_beneficiaries || ""),
    description: String(row.description || ""),
    keyHighlights: parsedHighlights,
    semanticDescription: String(row.semantic_description || ""),
    officialSource: row.official_source ? String(row.official_source) : undefined,
  };
}

/**
 * Fetches all active government schemes from Supabase PostgreSQL.
 * Throws an explicit error if the database connection fails or the catalog is empty.
 */
export async function fetchActiveSchemesFromDB(): Promise<SchemeDefinition[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("schemes")
    .select("*")
    .eq("is_active", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("❌ [DB Service] Failed to fetch schemes from Supabase PostgreSQL:", error.message);
    throw new Error(`Database error while fetching schemes: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.error("❌ [DB Service] Supabase PostgreSQL 'schemes' table is empty.");
    throw new Error("No active government schemes found in PostgreSQL database. Please run the database seed.");
  }

  const mappedSchemes = data.map((row) => mapDatabaseRowToScheme(row as DatabaseSchemeRow));
  return mappedSchemes;
}

/**
 * Checks PostgreSQL / Supabase connection health and returns table metrics.
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  tableExists: boolean;
  schemeCount: number;
  error?: string;
}> {
  try {
    const supabase = getSupabaseClient();
    const { data, error, count } = await supabase
      .from("schemes")
      .select("id", { count: "exact" })
      .eq("is_active", true);

    if (error) {
      return {
        connected: false,
        tableExists: error.code !== "PGRST205",
        schemeCount: 0,
        error: error.message,
      };
    }

    return {
      connected: true,
      tableExists: true,
      schemeCount: count ?? (data ? data.length : 0),
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      schemeCount: 0,
      error: err?.message || "Unknown error connecting to database",
    };
  }
}
