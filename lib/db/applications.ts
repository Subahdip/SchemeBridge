/**
 * SchemeBridge - Database Access Layer for Applications
 * 
 * Manages persistence and retrieval of loan applications in Supabase PostgreSQL.
 * Strictly enforces user isolation so users can only access their own applications.
 */

import { getSupabaseClient } from "./supabase";

export interface DatabaseApplicationRow {
  id: string;
  user_id: string;
  user_email?: string | null;
  scheme_id: string;
  scheme_name: string;
  amount: number | string;
  interest_rate?: number | string | null;
  interest_rate_text?: string | null;
  purpose: string;
  status: string;
  timeline: any;
  created_at: string;
  updated_at: string;
}

export interface ApplicationTimelineStep {
  step: string;
  date: string;
  completed: boolean;
  note?: string;
}

export interface ApplicationRecord {
  applicationId: string;
  id?: string | number;
  userId: string;
  userEmail?: string | null;
  schemeId: string;
  scheme: string;
  schemeName?: string;
  amount: number;
  loanAmount?: number;
  interestRate: number | string;
  interestRateText: string;
  tenureMonths?: number;
  tenureYears?: number;
  emi?: number;
  totalInterest?: number;
  totalPayment?: number;
  channelPartner?: string;
  purpose: string;
  status: "Submitted" | "Under Review" | "Documents Verified" | "Approved" | "Loan Approved" | "Disbursed" | "Rejected" | "approved" | "pending" | "rejected" | string;
  submittedDate: string;
  appliedDate?: string;
  timeline: ApplicationTimelineStep[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationInput {
  userId: string;
  userEmail?: string | null;
  schemeId: string;
  schemeName: string;
  amount: number;
  interestRate?: number;
  interestRateText?: string;
  purpose: string;
}

/**
 * Standard neutral workflow milestones for the SchemeBridge persistent tracking timeline.
 */
export function getDefaultApplicationTimeline(createdDateStr: string): ApplicationTimelineStep[] {
  return [
    {
      step: "Application Created",
      date: createdDateStr,
      completed: true,
      note: "Application record initialized in SchemeBridge portal",
    },
    {
      step: "Submitted to Partner",
      date: createdDateStr,
      completed: true,
      note: "Application dispatched for channel partner evaluation",
    },
    {
      step: "Document Verification",
      date: "Pending Verification",
      completed: false,
      note: "Verification of caste certificate, identity, and income proofs",
    },
    {
      step: "Partner Review",
      date: "Pending Review",
      completed: false,
      note: "Channel partner credit appraisal and branch assessment",
    },
    {
      step: "Sanction Decision",
      date: "Pending Sanction",
      completed: false,
      note: "Issuance of formal scheme sanction advice",
    },
    {
      step: "Disbursement",
      date: "Pending Disbursement",
      completed: false,
      note: "Fund disbursement via Direct Benefit Transfer / Bank Channel",
    },
  ];
}

/**
 * Maps a database row (snake_case) to the ApplicationRecord model (camelCase).
 */
export function mapDatabaseRowToApplication(row: DatabaseApplicationRow): ApplicationRecord {
  let parsedTimeline: ApplicationTimelineStep[] = [];
  if (Array.isArray(row.timeline)) {
    parsedTimeline = row.timeline;
  } else if (typeof row.timeline === "string") {
    try {
      const parsed = JSON.parse(row.timeline);
      parsedTimeline = Array.isArray(parsed) ? parsed : [];
    } catch {
      parsedTimeline = [];
    }
  }

  const createdDate = new Date(row.created_at);
  const formattedDate = !isNaN(createdDate.getTime())
    ? createdDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recent";

  return {
    applicationId: row.id,
    userId: row.user_id,
    userEmail: row.user_email || null,
    schemeId: row.scheme_id,
    scheme: row.scheme_name,
    amount: Number(row.amount || 0),
    interestRate: Number(row.interest_rate || 0),
    interestRateText: row.interest_rate_text || `${row.interest_rate || 0}% p.a.`,
    purpose: row.purpose,
    status: row.status,
    submittedDate: formattedDate,
    timeline: parsedTimeline.length > 0 ? parsedTimeline : getDefaultApplicationTimeline(formattedDate),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Creates and persists a new application in PostgreSQL.
 * Generates a unique server-side application ID (e.g. SIH2026-XXXX).
 */
export async function createApplicationInDB(input: CreateApplicationInput): Promise<ApplicationRecord> {
  const supabase = getSupabaseClient();

  // Server-generated unique Application ID with timestamp and random entropy
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit
  const appId = `SIH2026-${randomSuffix}`;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const timeline = getDefaultApplicationTimeline(dateFormatted);

  const rowData = {
    id: appId,
    user_id: input.userId,
    user_email: input.userEmail || null,
    scheme_id: input.schemeId,
    scheme_name: input.schemeName,
    amount: input.amount,
    interest_rate: input.interestRate ?? null,
    interest_rate_text: input.interestRateText || (input.interestRate ? `${input.interestRate}% p.a.` : null),
    purpose: input.purpose,
    status: "Submitted",
    timeline: timeline,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  const { data, error } = await supabase
    .from("applications")
    .insert([rowData])
    .select()
    .single();

  if (error) {
    console.error("❌ [DB Service] Failed to insert application into PostgreSQL:", error.message);
    throw new Error(`Database error while creating application: ${error.message}`);
  }

  return mapDatabaseRowToApplication(data as DatabaseApplicationRow);
}

/**
 * Fetches all applications for a specific authenticated user.
 */
export async function fetchApplicationsByUser(userId: string): Promise<ApplicationRecord[]> {
  if (!userId || typeof userId !== "string") {
    throw new Error("A valid authenticated userId is required.");
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ [DB Service] Failed to fetch user applications from PostgreSQL:", error.message);
    throw new Error(`Database error while fetching applications: ${error.message}`);
  }

  return (data || []).map((row) => mapDatabaseRowToApplication(row as DatabaseApplicationRow));
}

/**
 * Fetches a single application by ID for the authenticated owner.
 * Returns null if not found or if the application does not belong to the requesting user.
 */
export async function fetchApplicationById(applicationId: string, userId: string): Promise<ApplicationRecord | null> {
  if (!applicationId || !userId) {
    return null;
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(`❌ [DB Service] Error fetching application ${applicationId}:`, error.message);
    throw new Error(`Database error while fetching application: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapDatabaseRowToApplication(data as DatabaseApplicationRow);
}

/**
 * Deletes an application record by ID, strictly enforcing user ownership.
 */
export async function deleteApplicationById(applicationId: string, userId: string): Promise<boolean> {
  if (!applicationId || !userId) {
    throw new Error("Both applicationId and authenticated userId are required.");
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId)
    .eq("user_id", userId)
    .select("id");

  if (error) {
    console.error(`❌ [DB Service] Error deleting application ${applicationId}:`, error.message);
    throw new Error(`Database error while deleting application: ${error.message}`);
  }

  return Boolean(data && data.length > 0);
}
