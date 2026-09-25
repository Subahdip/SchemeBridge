/**
 * SchemeBridge - Applications API Route
 * 
 * Endpoints:
 * - POST /api/applications: Create new application in Supabase PostgreSQL
 * - GET /api/applications: Retrieve all applications for the authenticated user
 */

import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { createApplicationInDB, fetchApplicationsByUser } from "@/lib/db/applications";
import { SCHEMES_CATALOG } from "@/lib/schemes";

export async function POST(request: Request) {
  try {
    // 1. Strict Authentication Check
    const user = await getAuthenticatedUser(request);
    if (!user || !user.uid) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. A valid Firebase authentication token is required.",
        },
        { status: 401 }
      );
    }

    // 2. Parse & Validate Payload
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const { schemeId, schemeName, amount, interestRate, interestRateText, purpose } = body;

    if (!schemeId || typeof schemeId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing required field: schemeId." },
        { status: 400 }
      );
    }

    // Canonical scheme check
    const knownScheme = SCHEMES_CATALOG.find((s) => s.id === schemeId);
    if (!knownScheme) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid scheme_id '${schemeId}'. Must reference a valid statutory scheme.`,
        },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be a positive number." },
        { status: 400 }
      );
    }

    const applicationPurpose = purpose || knownScheme.purposeCategory || "General Assistance";
    const finalSchemeName = schemeName || knownScheme.schemeName;
    const finalInterestRate = typeof interestRate === "number" ? interestRate : knownScheme.interestRate;
    const finalInterestRateText = interestRateText || knownScheme.interestRateText;

    // 3. Persist to PostgreSQL
    const createdApplication = await createApplicationInDB({
      userId: user.uid,
      userEmail: user.email,
      schemeId: knownScheme.id,
      schemeName: finalSchemeName,
      amount: numericAmount,
      interestRate: finalInterestRate,
      interestRateText: finalInterestRateText,
      purpose: applicationPurpose,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted and persisted in PostgreSQL successfully.",
        application: createdApplication,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ [API /api/applications POST] Error:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to persist application in PostgreSQL.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // 1. Strict Authentication Check
    const user = await getAuthenticatedUser(request);
    if (!user || !user.uid) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. A valid Firebase authentication token is required.",
        },
        { status: 401 }
      );
    }

    // 2. Validate URL Parameters
    const url = new URL(request.url);
    const requestedUserId = url.searchParams.get("userId");

    // Enforce ownership: reject if client asks for another user's UID
    if (requestedUserId && requestedUserId !== user.uid) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden. You cannot access another user's applications.",
        },
        { status: 403 }
      );
    }

    // 3. Fetch from PostgreSQL using verified UID
    const applications = await fetchApplicationsByUser(user.uid);

    return NextResponse.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err: any) {
    console.error("❌ [API /api/applications GET] Error:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to retrieve applications from PostgreSQL.",
      },
      { status: 500 }
    );
  }
}
