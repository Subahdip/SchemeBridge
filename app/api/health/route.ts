import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db/schemes";

export async function GET() {
  const dbHealth = await checkDatabaseHealth();

  return NextResponse.json({
    status: dbHealth.connected ? "healthy" : "degraded",
    framework: "Next.js 14 (App Router)",
    version: "14.2.35",
    database: dbHealth,
    aiProvider: "OpenRouter (openai/text-embedding-3-small)",
    timestamp: new Date().toISOString(),
  });
}
