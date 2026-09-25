/**
 * SchemeBridge - Individual Application API Route
 * 
 * Endpoints:
 * - GET /api/applications/[id]: Retrieve a specific application (owner only)
 * - DELETE /api/applications/[id]: Delete an application (owner only)
 */

import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { fetchApplicationById, deleteApplicationById } from "@/lib/db/applications";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const applicationId = params?.id;
    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: "Missing application ID parameter." },
        { status: 400 }
      );
    }

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

    // 2. Fetch application from PostgreSQL strictly scoped to authenticated user
    const application = await fetchApplicationById(applicationId, user.uid);

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: "Application not found or you do not have permission to view it.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (err: any) {
    console.error(`❌ [API /api/applications/${params?.id} GET] Error:`, err.message);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to retrieve application from PostgreSQL.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const applicationId = params?.id;
    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: "Missing application ID parameter." },
        { status: 400 }
      );
    }

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

    // 2. Delete application strictly scoped to authenticated user
    const deleted = await deleteApplicationById(applicationId, user.uid);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Application not found or you do not have permission to delete it.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Application ${applicationId} successfully removed from PostgreSQL.`,
    });
  } catch (err: any) {
    console.error(`❌ [API /api/applications/${params?.id} DELETE] Error:`, err.message);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to delete application from PostgreSQL.",
      },
      { status: 500 }
    );
  }
}
