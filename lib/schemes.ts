/**
 * SchemeBridge - Official Government Concessional Scheme Catalog
 * 
 * Sourced directly from official guidelines of the National Scheduled Castes 
 * Finance and Development Corporation (NSFDC) and Ministry of Social Justice 
 * and Empowerment (MoSJE), Government of India.
 * 
 * Official Reference Sources:
 * - NSFDC Official Portal: https://nsfdc.nic.in
 * - MoSJE Official Portal: https://dosje.gov.in
 * - National Portal for Schemes: https://myscheme.gov.in
 * - PM-SURAJ Portal: https://pmsuraj.dosje.gov.in
 */

export interface SchemeDefinition {
  id: string;
  schemeName: string;
  category: "MICRO" | "MEDIUM" | "LARGE" | "EDUCATION" | "PERSONAL";
  purposeCategory: "business" | "education" | "personal" | "other" | "all";
  maxLoanAmount: number;
  incomeLimit: number;
  interestRate: number;
  interestRateText: string;
  govtCoveragePercent: number;
  promoterMarginPercent: number;
  moratoriumAvailable: boolean;
  moratoriumDetails?: string;
  repaymentPeriod?: string;
  targetBeneficiaries: string;
  description: string;
  keyHighlights: string[];
  semanticDescription: string;
  officialSource?: string;
}

export const SCHEMES_CATALOG: SchemeDefinition[] = [
  {
    id: "micro-finance-small",
    schemeName: "Micro Credit Finance (MCF) Scheme",
    category: "MICRO",
    purposeCategory: "business",
    maxLoanAmount: 140000,
    incomeLimit: 500000,
    interestRate: 6.5,
    interestRateText: "6.5% p.a.",
    govtCoveragePercent: 90,
    promoterMarginPercent: 10,
    moratoriumAvailable: true,
    moratoriumDetails: "3 Months Moratorium",
    repaymentPeriod: "Up to 3 years (36 months) in quarterly installments",
    targetBeneficiaries: "Small artisans, street vendors, tailors, micro-business owners, petty shopkeepers belonging to Scheduled Castes",
    description: "Specially tailored micro-credit facility under NSFDC for small-scale entrepreneurs, artisans, and micro-business owners. Offers 90% direct financial assistance with minimal documentation.",
    keyHighlights: [
      "Concessional interest rate of 6.5% per annum to beneficiaries (NSFDC charges 2.5% to SCAs)",
      "90% loan funded by NSFDC / Channel Partner Agency (max loan ₹1.25L - ₹1.26L per unit)",
      "Only 10% beneficiary promoter margin contribution required",
      "Repayment period of up to 3 years (36 months) in quarterly installments",
      "Includes 3-month initial moratorium period"
    ],
    semanticDescription: "Micro Credit Finance scheme for micro businesses, petty shopkeepers, street vendors, small artisans, tailoring units, sewing machines, garment stitching, handicraft making, small equipment purchase, and working capital up to ₹1.40 Lakhs.",
    officialSource: "NSFDC / MoSJE (https://nsfdc.nic.in - Micro Credit Finance)"
  },
  {
    id: "term-loan-nsfdc",
    schemeName: "National Concessional Term Loan (TL) Scheme",
    category: "MEDIUM",
    purposeCategory: "business",
    maxLoanAmount: 5000000,
    incomeLimit: 500000,
    interestRate: 8.0,
    interestRateText: "8.0% p.a.",
    govtCoveragePercent: 90,
    promoterMarginPercent: 10,
    moratoriumAvailable: true,
    moratoriumDetails: "6 Months Moratorium (12 months for plantation/construction)",
    repaymentPeriod: "Up to 7 years (84 months) in quarterly installments",
    targetBeneficiaries: "SC commercial entrepreneurs, industrial units, expanding businesses, transport vehicle operators, equipment buyers",
    description: "Medium to large capital investment loan scheme designed for viable projects in industrial, agricultural, and service sectors, acquiring machinery, and commercial production.",
    keyHighlights: [
      "Concessional interest rate of 8.0% per annum to beneficiaries (NSFDC charges 4% to SCAs)",
      "90% NSFDC loan funding coverage (up to ₹45.00 Lakhs on ₹50.00 Lakhs project cost)",
      "Promoter contribution fixed at minimum 10%",
      "Tenure of up to 7 years (84 months) in quarterly installments",
      "6-month initial moratorium period (12 months for plantation/construction)"
    ],
    semanticDescription: "National Concessional Term Loan Scheme for medium to large business enterprises, industrial projects, acquiring heavy machinery, manufacturing equipment, setting up commercial service centers, transport vehicles, and factory expansion up to ₹50.00 Lakhs.",
    officialSource: "NSFDC / MoSJE (https://nsfdc.nic.in - Term Loan Scheme)"
  },
  {
    id: "education-loan-scheme",
    schemeName: "Educational Loan Scheme (ELS - Higher Studies)",
    category: "EDUCATION",
    purposeCategory: "education",
    maxLoanAmount: 4000000,
    incomeLimit: 500000,
    interestRate: 6.5,
    interestRateText: "6.5% p.a. (6.0% for female students)",
    govtCoveragePercent: 90,
    promoterMarginPercent: 10,
    moratoriumAvailable: true,
    moratoriumDetails: "Course Duration + 1 Year Moratorium (or 6 months after securing job)",
    repaymentPeriod: "Up to 5 to 10 years after moratorium period",
    targetBeneficiaries: "SC students pursuing full-time professional/technical courses (Engineering, Medical, Management, CA/CS, Research) in India and Abroad",
    description: "Comprehensive financial support for SC students pursuing full-time professional and technical studies in recognized institutions in India and abroad with zero repayment during study period.",
    keyHighlights: [
      "Concessional interest rate of 6.5% p.a. with 0.5% rebate for female students (6.0% p.a.)",
      "Up to 90% total educational expense covered by NSFDC (up to ₹40.00 Lakhs)",
      "10% margin money requirement by promoter/student",
      "Moratorium benefit: Repayment starts only 1 year after course completion or 6 months after job",
      "Covers admission/tuition fees, books, equipment, hostel, exam, and travel expenses"
    ],
    semanticDescription: "Subsidized Education Loan Scheme for students seeking financial assistance for higher education, university tuition fees, college degrees, professional and technical courses, engineering, medicine, management, higher studies abroad, textbooks, and hostel accommodation up to ₹40.00 Lakhs.",
    officialSource: "NSFDC / MoSJE (https://nsfdc.nic.in - Educational Loan Scheme)"
  },
  {
    id: "mahila-samriddhi-yojana",
    schemeName: "Mahila Samriddhi Yojana (MSY - Women Micro Credit)",
    category: "MICRO",
    purposeCategory: "business",
    maxLoanAmount: 140000,
    incomeLimit: 500000,
    interestRate: 4.0,
    interestRateText: "4.0% p.a.",
    govtCoveragePercent: 90,
    promoterMarginPercent: 10,
    moratoriumAvailable: true,
    moratoriumDetails: "3 Months Moratorium",
    repaymentPeriod: "Up to 3 years (36 months) in quarterly installments",
    targetBeneficiaries: "Women entrepreneurs, female artisans, women SHGs, tailoring, boutique, small livestock, micro retail",
    description: "Highly concessional micro-finance scheme specifically designed to empower women from the Scheduled Caste community by providing affordable credit for income-generating micro activities.",
    keyHighlights: [
      "Ultra-low concessional interest rate of 4.0% per annum to women beneficiaries",
      "Up to 90% funding coverage (max loan ₹1.25L on ₹1.40L project cost)",
      "10% beneficiary promoter margin contribution",
      "Repayment period of up to 3 years with 3-month initial moratorium",
      "Direct financial empowerment for women artisans and micro-entrepreneurs"
    ],
    semanticDescription: "Mahila Samriddhi Yojana micro credit scheme for women entrepreneurs, women self help groups, tailoring, boutique, handicrafts, small shops, beauty parlors, small livestock, and home-based micro businesses up to ₹1.40 Lakhs at 4% interest rate.",
    officialSource: "NSFDC / MoSJE (https://nsfdc.nic.in - Mahila Samriddhi Yojana)"
  },
  {
    id: "laghu-vyavsay-yojana",
    schemeName: "Laghu Vyavsay Yojana (LVY - Small Business Scheme)",
    category: "MEDIUM",
    purposeCategory: "business",
    maxLoanAmount: 500000,
    incomeLimit: 500000,
    interestRate: 6.0,
    interestRateText: "6.0% p.a.",
    govtCoveragePercent: 90,
    promoterMarginPercent: 10,
    moratoriumAvailable: true,
    moratoriumDetails: "6 Months Moratorium",
    repaymentPeriod: "Up to 5 years (60 months) in quarterly installments",
    targetBeneficiaries: "Dairy farmers, animal husbandry, small retail stores, vehicle repair workshops, rural service units",
    description: "Financial assistance under NSFDC for small commercial business units, dairy farming, milk booths, livestock rearing, retail shops, and commercial service establishments.",
    keyHighlights: [
      "Subsidized interest rate of 6.0% per annum to beneficiaries (NSFDC charges 3% to SCAs)",
      "Supports dairy business, cattle purchase, milk production, and small retail shops",
      "90% funding coverage (up to ₹4.50 Lakhs loan on ₹5.00 Lakhs project cost)",
      "Promoter margin contribution fixed at 10%",
      "Flexible repayment terms up to 5 years with 6 months initial moratorium"
    ],
    semanticDescription: "Laghu Vyavsay Yojana for small commercial businesses, dairy business, dairy farming, cattle purchase, livestock, milk production, grocery retail stores, workshop repair, photo studio, and small service enterprises up to ₹5.00 Lakhs.",
    officialSource: "NSFDC / MoSJE (https://nsfdc.nic.in - Laghu Vyavsay Yojana)"
  },
  {
    id: "green-business-scheme",
    schemeName: "Green Business Scheme (GBS - Eco & Renewable Ventures)",
    category: "MEDIUM",
    purposeCategory: "business",
    maxLoanAmount: 3000000,
    incomeLimit: 500000,
    interestRate: 6.0,
    interestRateText: "4.0% - 7.0% p.a. (1% rebate for women)",
    govtCoveragePercent: 90,
    promoterMarginPercent: 10,
    moratoriumAvailable: true,
    moratoriumDetails: "6 Months Moratorium",
    repaymentPeriod: "Up to 7 to 10 years in quarterly installments",
    targetBeneficiaries: "SC entrepreneurs setting up climate-mitigation green units, solar energy, e-rickshaws, organic farming, polyhouses",
    description: "Financial assistance for income-generating activities that address climate change, including battery-operated e-rickshaws, solar rooftop units/pumps, polyhouses, and waste recycling.",
    keyHighlights: [
      "Concessional interest rate: 4% p.a. (up to ₹7.5L), 6% p.a. (₹7.5L-₹15L), 7% p.a. (₹15L-₹30L)",
      "1% interest rebate per annum for women beneficiaries",
      "Up to 90% loan funded by NSFDC (up to ₹27.00 Lakhs on ₹30.00 Lakhs unit cost)",
      "10% promoter margin contribution",
      "Repayment tenure of up to 7 to 10 years including 6 months moratorium"
    ],
    semanticDescription: "Green Business Scheme for climate change mitigation, electric rickshaw, battery vehicles, solar rooftop units, solar pumps, polyhouses, organic farming, waste recycling, and renewable green energy projects up to ₹30.00 Lakhs.",
    officialSource: "NSFDC / MoSJE (https://dosje.gov.in & https://myscheme.gov.in - Green Business Scheme)"
  },
  {
    id: "swachhta-udyami-yojana",
    schemeName: "Swachhta Udyami Yojana (SUY - Sanitation Mechanization)",
    category: "LARGE",
    purposeCategory: "business",
    maxLoanAmount: 5000000,
    incomeLimit: 500000,
    interestRate: 4.0,
    interestRateText: "4.0% p.a. (1% rebate for women)",
    govtCoveragePercent: 90,
    promoterMarginPercent: 10,
    moratoriumAvailable: true,
    moratoriumDetails: "6 Months Moratorium",
    repaymentPeriod: "Up to 7 years (84 months) in quarterly installments",
    targetBeneficiaries: "Safai Karamcharis, manual scavengers rehabilitation, sanitation entrepreneurs, waste management operators",
    description: "Financial assistance for the procurement and operation of mechanized sanitation equipment, vacuum cleaning loaders, suction trucks, and garbage transport to eliminate manual scavenging.",
    keyHighlights: [
      "Highly concessional interest rate of 4.0% per annum (with 1% rebate for women)",
      "Up to 90% loan funding coverage by NSFDC (up to ₹45.00 Lakhs on ₹50.00 Lakhs project cost)",
      "Promoter margin contribution of 10%",
      "Tenure of up to 7 years (84 months) in quarterly installments",
      "6-month initial moratorium period included"
    ],
    semanticDescription: "Swachhta Udyami Yojana for mechanized sanitation equipment, vacuum loader trucks, suction machines, septic tank cleaning vehicles, garbage collection transport, and public hygiene infrastructure up to ₹50.00 Lakhs.",
    officialSource: "NSFDC / NSKFDC / MoSJE (https://dosje.gov.in & https://myscheme.gov.in - Swachhta Udyami Yojana)"
  },
  {
    id: "micro-finance-education",
    schemeName: "Micro Credit Finance - Skill & Vocational Training",
    category: "MICRO",
    purposeCategory: "education",
    maxLoanAmount: 140000,
    incomeLimit: 500000,
    interestRate: 6.5,
    interestRateText: "6.5% p.a.",
    govtCoveragePercent: 90,
    promoterMarginPercent: 10,
    moratoriumAvailable: true,
    moratoriumDetails: "Course Duration Moratorium",
    repaymentPeriod: "Up to 3 years (36 months) in quarterly installments",
    targetBeneficiaries: "SC students undergoing short-term vocational diplomas, ITI, skill certifications, NSDC programs",
    description: "Micro-credit support under NSFDC for vocational training, skill enhancement, short-term computer courses, diploma certifications, and technical equipment.",
    keyHighlights: [
      "Concessional interest rate of 6.5% p.a. to beneficiaries",
      "Up to 90% funding coverage (max loan ₹1.25L - ₹1.26L)",
      "Covers short-term vocational diplomas, ITI, computer hardware and coding certificates",
      "Minimal documentation with zero collateral"
    ],
    semanticDescription: "Micro Credit Finance for vocational courses, technical training, computer diploma, ITI certifications, skill development programs, short-term certification courses, and learning equipment up to ₹1.40 Lakhs.",
    officialSource: "NSFDC / MoSJE (https://nsfdc.nic.in - Skill Development & Micro Finance)"
  }
];
