/**
 * Shared Application State Management via sessionStorage for SchemeBridge
 */

export interface AssessmentData {
  // Basic Financial Info
  income: number;
  loanAmount: number;

  // Loan Purpose & Scale
  primaryPurpose?: string;
  businessScale?: string;
  educationCategory?: string;
  educationProjectSize?: string;
  businessType?: string;
  businessProjectSize?: string;
  personalReason?: string;
  personalProjectSize?: string;
  otherPurposeText?: string;
  otherProjectSize?: string;

  // Financial Liabilities & Banking
  existingEmis?: number;
  salaryBank?: string;
  netSalary?: number;

  // Professional & Stability
  companyName?: string;
  yearsAtJob?: string;
  totalExperience?: string;

  // Loan Details & Demographics
  loanPurpose?: string;
  pincode?: string;
  residentialStatus?: string;
  address?: string;

  // Credit Score
  creditScore?: string;

  // DTI Ratio
  dtiRatio?: number;

  // Legacy/Derived fields
  purpose?: "Business" | "Education" | string;
  projectType?: "Small" | "Medium" | "Large" | string;
  educationLevel?: "Undergraduate" | "Postgraduate" | "Professional" | string;
  timestamp?: string;
}

export interface MatchedSchemeData {
  isEligible: boolean;
  schemeName: string;
  interestRate: number; // e.g. 6.5 or 7.5
  interestRateText: string; // e.g. "7.5% p.a."
  maxLoanAmount: number;
  maxLoanText: string;
  govtCoveragePercent: number; // e.g. 90
  promoterMarginPercent: number; // e.g. 10
  govtShareAmount: number;
  promoterMarginAmount: number;
  totalProjectCost: number;
  fundingRatio: string; // e.g. "90:10"
  description: string;
  moratoriumAvailable: boolean;
  moratoriumDetails?: string;
  ineligibleReason?: string;
  timestamp?: string;
}

export interface ApplicationTimelineStep {
  step: string;
  date: string;
  completed: boolean;
}

export interface ApplicationRecord {
  applicationId: string;
  scheme: string;
  amount: number;
  interestRate: string | number;
  purpose: string;
  status: "Submitted" | "Under Review" | "Documents Verified" | "Approved" | "Loan Approved" | "Disbursed" | "Rejected";
  submittedDate: string;
  timeline: ApplicationTimelineStep[];
}

export const AppState = {
  saveAssessment: (data: AssessmentData): void => {
    if (typeof window !== "undefined") {
      const payload = {
        ...data,
        timestamp: new Date().toISOString(),
      };
      sessionStorage.setItem("schemebridge_assessment", JSON.stringify(payload));
      sessionStorage.setItem("assessment", JSON.stringify(payload));
    }
  },

  getAssessment: (): AssessmentData | null => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("schemebridge_assessment") || sessionStorage.getItem("assessment");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  saveScheme: (data: MatchedSchemeData): void => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("schemebridge_matched_scheme", JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
      }));
    }
  },

  getScheme: (): MatchedSchemeData | null => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("schemebridge_matched_scheme");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  getApplications: (): ApplicationRecord[] => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("applications");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch {
          // fallback to mock
        }
      }

      // Default mock applications for demo if empty
      const mockApps: ApplicationRecord[] = [
        {
          applicationId: "SIH2026-001",
          scheme: "Term Loan Scheme",
          amount: 2500000,
          interestRate: 7.5,
          purpose: "Business",
          status: "Under Review",
          submittedDate: "04 Sep 2026",
          timeline: [
            { step: "Submitted", date: "04 Sep 2026", completed: true },
            { step: "Documents Verified", date: "05 Sep 2026", completed: true },
            { step: "Loan Approved", date: "07 Sep 2026 (Est.)", completed: false },
            { step: "Disbursed", date: "10 Sep 2026 (Est.)", completed: false }
          ]
        },
        {
          applicationId: "SIH2026-002",
          scheme: "Education Loan Scheme",
          amount: 1000000,
          interestRate: 6.5,
          purpose: "Education",
          status: "Approved",
          submittedDate: "01 Sep 2026",
          timeline: [
            { step: "Submitted", date: "01 Sep 2026", completed: true },
            { step: "Documents Verified", date: "02 Sep 2026", completed: true },
            { step: "Loan Approved", date: "04 Sep 2026", completed: true },
            { step: "Disbursed", date: "07 Sep 2026 (Est.)", completed: false }
          ]
        },
        {
          applicationId: "SIH2026-003",
          scheme: "Micro Finance Scheme",
          amount: 100000,
          interestRate: 6.5,
          purpose: "Small Business",
          status: "Disbursed",
          submittedDate: "25 Aug 2026",
          timeline: [
            { step: "Submitted", date: "25 Aug 2026", completed: true },
            { step: "Documents Verified", date: "26 Aug 2026", completed: true },
            { step: "Loan Approved", date: "28 Aug 2026", completed: true },
            { step: "Disbursed", date: "30 Aug 2026", completed: true }
          ]
        }
      ];

      sessionStorage.setItem("applications", JSON.stringify(mockApps));
      return mockApps;
    }
    return [];
  },

  saveApplication: (application: ApplicationRecord): void => {
    if (typeof window !== "undefined") {
      const list = AppState.getApplications();
      list.unshift(application);
      sessionStorage.setItem("applications", JSON.stringify(list));
    }
  },

  getApplicationById: (appId: string): ApplicationRecord | null => {
    const list = AppState.getApplications();
    return list.find((a) => a.applicationId === appId) || null;
  },

  clearAll: (): void => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("schemebridge_assessment");
      sessionStorage.removeItem("assessment");
      sessionStorage.removeItem("schemebridge_matched_scheme");
      sessionStorage.removeItem("creditDecision");
      sessionStorage.removeItem("schemebridge_credit_decision");
    }
  },

  saveCreditDecision: (decision: any): void => {
    if (typeof window !== "undefined") {
      const payload = JSON.stringify(decision);
      sessionStorage.setItem("creditDecision", payload);
      sessionStorage.setItem("schemebridge_credit_decision", payload);
    }
  },

  getCreditDecision: (): any | null => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("creditDecision") || sessionStorage.getItem("schemebridge_credit_decision");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  }
};


