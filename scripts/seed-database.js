/**
 * Automated Database Migration & Seed Script for SchemeBridge
 * 
 * Sourced directly from lib/schemes.ts (Audited NSFDC / MoSJE Catalog)
 * Total schemes: 8
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Load .env.local
const envLocalPath = path.join(__dirname, "..", ".env.local");
const envVars = {};
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      envVars[key] = val;
      process.env[key] = val;
    }
  });
}

// Complete 8 audited schemes matching lib/schemes.ts
const SCHEMES_SEED_DATA = [
  {
    id: "micro-finance-small",
    scheme_name: "Micro Credit Finance (MCF) Scheme",
    category: "MICRO",
    purpose_category: "business",
    max_loan_amount: 140000.0,
    income_limit: 500000.0,
    interest_rate: 6.5,
    interest_rate_text: "6.5% p.a.",
    govt_coverage_percent: 90.0,
    promoter_margin_percent: 10.0,
    moratorium_available: true,
    moratorium_details: "3 Months Moratorium",
    repayment_period: "Up to 3 years (36 months) in quarterly installments",
    target_beneficiaries: "Small artisans, street vendors, tailors, micro-business owners, petty shopkeepers belonging to Scheduled Castes",
    description: "Specially tailored micro-credit facility under NSFDC for small-scale entrepreneurs, artisans, and micro-business owners. Offers 90% direct financial assistance with minimal documentation.",
    key_highlights: [
      "Concessional interest rate of 6.5% per annum to beneficiaries (NSFDC charges 2.5% to SCAs)",
      "90% loan funded by NSFDC / Channel Partner Agency (max loan ₹1.25L - ₹1.26L per unit)",
      "Only 10% beneficiary promoter margin contribution required",
      "Repayment period of up to 3 years (36 months) in quarterly installments",
      "Includes 3-month initial moratorium period"
    ],
    semantic_description: "Micro Credit Finance scheme for micro businesses, petty shopkeepers, street vendors, small artisans, tailoring units, sewing machines, garment stitching, handicraft making, small equipment purchase, and working capital up to ₹1.40 Lakhs.",
    official_source: "NSFDC / MoSJE (https://nsfdc.nic.in - Micro Credit Finance)",
    is_active: true
  },
  {
    id: "term-loan-nsfdc",
    scheme_name: "National Concessional Term Loan (TL) Scheme",
    category: "MEDIUM",
    purpose_category: "business",
    max_loan_amount: 5000000.0,
    income_limit: 500000.0,
    interest_rate: 8.0,
    interest_rate_text: "8.0% p.a.",
    govt_coverage_percent: 90.0,
    promoter_margin_percent: 10.0,
    moratorium_available: true,
    moratorium_details: "6 Months Moratorium (12 months for plantation/construction)",
    repayment_period: "Up to 7 years (84 months) in quarterly installments",
    target_beneficiaries: "SC commercial entrepreneurs, industrial units, expanding businesses, transport vehicle operators, equipment buyers",
    description: "Medium to large capital investment loan scheme designed for viable projects in industrial, agricultural, and service sectors, acquiring machinery, and commercial production.",
    key_highlights: [
      "Concessional interest rate of 8.0% per annum to beneficiaries (NSFDC charges 4% to SCAs)",
      "90% NSFDC loan funding coverage (up to ₹45.00 Lakhs on ₹50.00 Lakhs project cost)",
      "Promoter contribution fixed at minimum 10%",
      "Tenure of up to 7 years (84 months) in quarterly installments",
      "6-month initial moratorium period (12 months for plantation/construction)"
    ],
    semantic_description: "National Concessional Term Loan Scheme for medium to large business enterprises, industrial projects, acquiring heavy machinery, manufacturing equipment, setting up commercial service centers, transport vehicles, and factory expansion up to ₹50.00 Lakhs.",
    official_source: "NSFDC / MoSJE (https://nsfdc.nic.in - Term Loan Scheme)",
    is_active: true
  },
  {
    id: "education-loan-scheme",
    scheme_name: "Educational Loan Scheme (ELS - Higher Studies)",
    category: "EDUCATION",
    purpose_category: "education",
    max_loan_amount: 4000000.0,
    income_limit: 500000.0,
    interest_rate: 6.5,
    interest_rate_text: "6.5% p.a. (6.0% for female students)",
    govt_coverage_percent: 90.0,
    promoter_margin_percent: 10.0,
    moratorium_available: true,
    moratorium_details: "Course Duration + 1 Year Moratorium (or 6 months after securing job)",
    repayment_period: "Up to 5 to 10 years after moratorium period",
    target_beneficiaries: "SC students pursuing full-time professional/technical courses (Engineering, Medical, Management, CA/CS, Research) in India and Abroad",
    description: "Comprehensive financial support for SC students pursuing full-time professional and technical studies in recognized institutions in India and abroad with zero repayment during study period.",
    key_highlights: [
      "Concessional interest rate of 6.5% p.a. with 0.5% rebate for female students (6.0% p.a.)",
      "Up to 90% total educational expense covered by NSFDC (up to ₹40.00 Lakhs)",
      "10% margin money requirement by promoter/student",
      "Moratorium benefit: Repayment starts only 1 year after course completion or 6 months after job",
      "Covers admission/tuition fees, books, equipment, hostel, exam, and travel expenses"
    ],
    semantic_description: "Subsidized Education Loan Scheme for students seeking financial assistance for higher education, university tuition fees, college degrees, professional and technical courses, engineering, medicine, management, higher studies abroad, textbooks, and hostel accommodation up to ₹40.00 Lakhs.",
    official_source: "NSFDC / MoSJE (https://nsfdc.nic.in - Educational Loan Scheme)",
    is_active: true
  },
  {
    id: "mahila-samriddhi-yojana",
    scheme_name: "Mahila Samriddhi Yojana (MSY - Women Micro Credit)",
    category: "MICRO",
    purpose_category: "business",
    max_loan_amount: 140000.0,
    income_limit: 500000.0,
    interest_rate: 4.0,
    interest_rate_text: "4.0% p.a.",
    govt_coverage_percent: 90.0,
    promoter_margin_percent: 10.0,
    moratorium_available: true,
    moratorium_details: "3 Months Moratorium",
    repayment_period: "Up to 3 years (36 months) in quarterly installments",
    target_beneficiaries: "Women entrepreneurs, female artisans, women SHGs, tailoring, boutique, small livestock, micro retail",
    description: "Highly concessional micro-finance scheme specifically designed to empower women from the Scheduled Caste community by providing affordable credit for income-generating micro activities.",
    key_highlights: [
      "Ultra-low concessional interest rate of 4.0% per annum to women beneficiaries",
      "Up to 90% funding coverage (max loan ₹1.25L on ₹1.40L project cost)",
      "10% beneficiary promoter margin contribution",
      "Repayment period of up to 3 years with 3-month initial moratorium",
      "Direct financial empowerment for women artisans and micro-entrepreneurs"
    ],
    semantic_description: "Mahila Samriddhi Yojana micro credit scheme for women entrepreneurs, women self help groups, tailoring, boutique, handicrafts, small shops, beauty parlors, small livestock, and home-based micro businesses up to ₹1.40 Lakhs at 4% interest rate.",
    official_source: "NSFDC / MoSJE (https://nsfdc.nic.in - Mahila Samriddhi Yojana)",
    is_active: true
  },
  {
    id: "laghu-vyavsay-yojana",
    scheme_name: "Laghu Vyavsay Yojana (LVY - Small Business Scheme)",
    category: "MEDIUM",
    purpose_category: "business",
    max_loan_amount: 500000.0,
    income_limit: 500000.0,
    interest_rate: 6.0,
    interest_rate_text: "6.0% p.a.",
    govt_coverage_percent: 90.0,
    promoter_margin_percent: 10.0,
    moratorium_available: true,
    moratorium_details: "6 Months Moratorium",
    repayment_period: "Up to 5 years (60 months) in quarterly installments",
    target_beneficiaries: "Dairy farmers, animal husbandry, small retail stores, vehicle repair workshops, rural service units",
    description: "Financial assistance under NSFDC for small commercial business units, dairy farming, milk booths, livestock rearing, retail shops, and commercial service establishments.",
    key_highlights: [
      "Subsidized interest rate of 6.0% per annum to beneficiaries (NSFDC charges 3% to SCAs)",
      "Supports dairy business, cattle purchase, milk production, and small retail shops",
      "90% funding coverage (up to ₹4.50 Lakhs loan on ₹5.00 Lakhs project cost)",
      "Promoter margin contribution fixed at 10%",
      "Flexible repayment terms up to 5 years with 6 months initial moratorium"
    ],
    semantic_description: "Laghu Vyavsay Yojana for small commercial businesses, dairy business, dairy farming, cattle purchase, livestock, milk production, grocery retail stores, workshop repair, photo studio, and small service enterprises up to ₹5.00 Lakhs.",
    official_source: "NSFDC / MoSJE (https://nsfdc.nic.in - Laghu Vyavsay Yojana)",
    is_active: true
  },
  {
    id: "green-business-scheme",
    scheme_name: "Green Business Scheme (GBS - Eco & Renewable Ventures)",
    category: "MEDIUM",
    purpose_category: "business",
    max_loan_amount: 3000000.0,
    income_limit: 500000.0,
    interest_rate: 6.0,
    interest_rate_text: "4.0% - 7.0% p.a. (1% rebate for women)",
    govt_coverage_percent: 90.0,
    promoter_margin_percent: 10.0,
    moratorium_available: true,
    moratorium_details: "6 Months Moratorium",
    repayment_period: "Up to 7 to 10 years in quarterly installments",
    target_beneficiaries: "SC entrepreneurs setting up climate-mitigation green units, solar energy, e-rickshaws, organic farming, polyhouses",
    description: "Financial assistance for income-generating activities that address climate change, including battery-operated e-rickshaws, solar rooftop units/pumps, polyhouses, and waste recycling.",
    key_highlights: [
      "Concessional interest rate: 4% p.a. (up to ₹7.5L), 6% p.a. (₹7.5L-₹15L), 7% p.a. (₹15L-₹30L)",
      "1% interest rebate per annum for women beneficiaries",
      "Up to 90% loan funded by NSFDC (up to ₹27.00 Lakhs on ₹30.00 Lakhs unit cost)",
      "10% promoter margin contribution",
      "Repayment tenure of up to 7 to 10 years including 6 months moratorium"
    ],
    semantic_description: "Green Business Scheme for climate change mitigation, electric rickshaw, battery vehicles, solar rooftop units, solar pumps, polyhouses, organic farming, waste recycling, and renewable green energy projects up to ₹30.00 Lakhs.",
    official_source: "NSFDC / MoSJE (https://dosje.gov.in & https://myscheme.gov.in - Green Business Scheme)",
    is_active: true
  },
  {
    id: "swachhta-udyami-yojana",
    scheme_name: "Swachhta Udyami Yojana (SUY - Sanitation Mechanization)",
    category: "LARGE",
    purpose_category: "business",
    max_loan_amount: 5000000.0,
    income_limit: 500000.0,
    interest_rate: 4.0,
    interest_rate_text: "4.0% p.a. (1% rebate for women)",
    govt_coverage_percent: 90.0,
    promoter_margin_percent: 10.0,
    moratorium_available: true,
    moratorium_details: "6 Months Moratorium",
    repayment_period: "Up to 7 years (84 months) in quarterly installments",
    target_beneficiaries: "Safai Karamcharis, manual scavengers rehabilitation, sanitation entrepreneurs, waste management operators",
    description: "Financial assistance for the procurement and operation of mechanized sanitation equipment, vacuum cleaning loaders, suction trucks, and garbage transport to eliminate manual scavenging.",
    key_highlights: [
      "Highly concessional interest rate of 4.0% per annum (with 1% rebate for women)",
      "Up to 90% loan funding coverage by NSFDC (up to ₹45.00 Lakhs on ₹50.00 Lakhs project cost)",
      "Promoter margin contribution of 10%",
      "Tenure of up to 7 years (84 months) in quarterly installments",
      "6-month initial moratorium period included"
    ],
    semantic_description: "Swachhta Udyami Yojana for mechanized sanitation equipment, vacuum loader trucks, suction machines, septic tank cleaning vehicles, garbage collection transport, and public hygiene infrastructure up to ₹50.00 Lakhs.",
    official_source: "NSFDC / NSKFDC / MoSJE (https://dosje.gov.in & https://myscheme.gov.in - Swachhta Udyami Yojana)",
    is_active: true
  },
  {
    id: "micro-finance-education",
    scheme_name: "Micro Credit Finance - Skill & Vocational Training",
    category: "MICRO",
    purpose_category: "education",
    max_loan_amount: 140000.0,
    income_limit: 500000.0,
    interest_rate: 6.5,
    interest_rate_text: "6.5% p.a.",
    govt_coverage_percent: 90.0,
    promoter_margin_percent: 10.0,
    moratorium_available: true,
    moratorium_details: "Course Duration Moratorium",
    repayment_period: "Up to 3 years (36 months) in quarterly installments",
    target_beneficiaries: "SC students undergoing short-term vocational diplomas, ITI, skill certifications, NSDC programs",
    description: "Micro-credit support under NSFDC for vocational training, skill enhancement, short-term computer courses, diploma certifications, and technical equipment.",
    key_highlights: [
      "Concessional interest rate of 6.5% p.a. to beneficiaries",
      "Up to 90% funding coverage (max loan ₹1.25L - ₹1.26L)",
      "Covers short-term vocational diplomas, ITI, computer hardware and coding certificates",
      "Minimal documentation with zero collateral"
    ],
    semantic_description: "Micro Credit Finance for vocational courses, technical training, computer diploma, ITI certifications, skill development programs, short-term certification courses, and learning equipment up to ₹1.40 Lakhs.",
    official_source: "NSFDC / MoSJE (https://nsfdc.nic.in - Skill Development & Micro Finance)",
    is_active: true
  }
];

async function seedDatabase() {
  console.log("=================================================");
  console.log("🌱 SchemeBridge - Supabase PostgreSQL Seed Process");
  console.log(`Audited schemes to seed: ${SCHEMES_SEED_DATA.length}`);
  console.log("=================================================");

  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Upserting schemes into Supabase PostgreSQL 'schemes' table...");

  const { data, error } = await supabase
    .from("schemes")
    .upsert(SCHEMES_SEED_DATA, { onConflict: "id" })
    .select("id, scheme_name, purpose_category, max_loan_amount");

  if (error) {
    console.error("❌ Supabase Upsert Error:", error.message);
    if (error.code === "PGRST205" || error.message.includes("Could not find the table")) {
      console.log("\n⚠️ The 'schemes' table does not exist yet in PostgreSQL.");
      console.log("Please run the migration SQL file in the Supabase SQL Editor:");
      console.log("Path: supabase/migrations/20260917000000_create_schemes_table.sql");
    }
    process.exit(1);
  }

  console.log(`✅ Successfully seeded/upserted ${data.length} schemes into Supabase PostgreSQL!`);
  data.forEach((s, idx) => {
    console.log(`  ${idx + 1}. [${s.id}] ${s.scheme_name} (Category: ${s.purpose_category}, Max: ₹${s.max_loan_amount.toLocaleString("en-IN")})`);
  });
  process.exit(0);
}

seedDatabase();
