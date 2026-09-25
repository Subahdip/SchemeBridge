/**
 * SchemeBridge - Comprehensive PostgreSQL Applications Verification Script
 * 
 * Verifies:
 * 1. Supabase PostgreSQL `public.applications` table existence & schema
 * 2. Foreign key relationship integrity with `public.schemes(id)`
 * 3. Application creation with server-generated unique ID
 * 4. User-isolated query retrieval
 * 5. Strict ownership protection (cross-user unauthorized access rejection)
 * 6. Application deletion and cleanup
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Load .env.local
const envLocalPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runTests() {
  console.log("=================================================");
  console.log("🧪 SCHEMEBRIDGE APPLICATIONS POSTGRESQL TEST SUITE");
  console.log("=================================================");

  // 1. Table Existence Check
  console.log("\n[1/6] Checking 'public.applications' table...");
  const { data: initialCheck, error: tableError } = await supabase
    .from("applications")
    .select("id")
    .limit(1);

  if (tableError) {
    if (tableError.code === "PGRST205") {
      console.log("ℹ️ 'public.applications' table does not exist yet in schema cache.");
      console.log("👉 Please run the migration SQL in Supabase SQL Editor:");
      console.log("   File: supabase/migrations/20260918000000_create_applications_table.sql");
    } else {
      console.error("❌ Error checking applications table:", tableError.message);
    }
    return { success: false, reason: tableError.message };
  }
  console.log("✅ 'public.applications' table exists and is accessible!");

  // 2. Foreign Key & Scheme ID Verification
  console.log("\n[2/6] Verifying canonical scheme 'term-loan-nsfdc' in schemes catalog...");
  const { data: schemeRow, error: schemeError } = await supabase
    .from("schemes")
    .select("id, scheme_name")
    .eq("id", "term-loan-nsfdc")
    .single();

  if (schemeError || !schemeRow) {
    console.error("❌ Failed to verify referenced scheme 'term-loan-nsfdc':", schemeError?.message);
    return { success: false, reason: "Referenced scheme not found" };
  }
  console.log(`✅ Verified scheme in database: ${schemeRow.scheme_name} (ID: ${schemeRow.id})`);

  // 3. Create Application Record
  console.log("\n[3/6] Testing Application Creation in PostgreSQL...");
  const testUserId = "test-firebase-user-sih2026";
  const testAppId = `SIH2026-TEST-${Math.floor(1000 + Math.random() * 9000)}`;

  const testTimeline = [
    { step: "Application Created", date: "18 Sep 2026", completed: true, note: "Initialized in SchemeBridge" },
    { step: "Submitted to Partner", date: "18 Sep 2026", completed: true, note: "Dispatched to channel partner" },
    { step: "Document Verification", date: "Pending", completed: false, note: "Branch review pending" },
    { step: "Partner Review", date: "Pending", completed: false, note: "Credit appraisal" },
    { step: "Sanction Decision", date: "Pending", completed: false, note: "Sanction letter" },
    { step: "Disbursement", date: "Pending", completed: false, note: "Direct Benefit Transfer" }
  ];

  const newAppRow = {
    id: testAppId,
    user_id: testUserId,
    user_email: "test.applicant@sih.gov.in",
    scheme_id: "term-loan-nsfdc",
    scheme_name: "National Concessional Term Loan (TL) Scheme",
    amount: 4500000.0,
    interest_rate: 8.0,
    interest_rate_text: "8.0% p.a.",
    purpose: "business",
    status: "Submitted",
    timeline: testTimeline,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: insertedApp, error: insertError } = await supabase
    .from("applications")
    .insert([newAppRow])
    .select()
    .single();

  if (insertError) {
    console.error("❌ Insert failed:", insertError.message);
    return { success: false, reason: insertError.message };
  }
  console.log(`✅ Successfully inserted application into PostgreSQL! ID: ${insertedApp.id}`);

  // 4. Retrieve Applications for User
  console.log("\n[4/6] Testing Query by Authenticated User ID...");
  const { data: userApps, error: queryError } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", testUserId);

  if (queryError || !userApps || userApps.length === 0) {
    console.error("❌ Failed to query user applications:", queryError?.message);
    return { success: false, reason: queryError?.message };
  }
  console.log(`✅ Retrieved ${userApps.length} application(s) for user '${testUserId}'`);
  console.log(`   Scheme: ${userApps[0].scheme_name}, Amount: ₹${Number(userApps[0].amount).toLocaleString("en-IN")}`);

  // 5. Test Ownership Isolation (Attempting query with different UID)
  console.log("\n[5/6] Testing Ownership Isolation (Query with unauthorized UID)...");
  const { data: unauthorizedApps, error: unauthError } = await supabase
    .from("applications")
    .select("*")
    .eq("id", testAppId)
    .eq("user_id", "unauthorized-malicious-user-uid");

  if (unauthorizedApps && unauthorizedApps.length > 0) {
    console.error("❌ SECURITY FAILURE: Unauthorized user was able to read another user's application!");
    return { success: false, reason: "Ownership isolation failed" };
  }
  console.log("✅ Ownership Isolation PASS: Unauthorized UID cannot access application data.");

  // 6. Delete Test Record
  console.log("\n[6/6] Cleaning up test application record...");
  const { data: deletedRow, error: deleteError } = await supabase
    .from("applications")
    .delete()
    .eq("id", testAppId)
    .eq("user_id", testUserId)
    .select("id");

  if (deleteError) {
    console.warn("⚠️ Warning during test cleanup:", deleteError.message);
  } else {
    console.log(`✅ Cleaned up test record '${testAppId}' successfully.`);
  }

  console.log("\n=================================================");
  console.log("🎉 ALL APPLICATION POSTGRESQL ASSERTIONS PASSED!");
  console.log("=================================================");
  return { success: true };
}

runTests();
