/**
 * Shared Application State Management via sessionStorage for SchemeBridge
 */

export interface AssessmentData {
  // Basic Financial Info
  income: number;
  loanAmount: number;

  // Loan Purpose & Scale
  primaryPurpose?: string;
  requirementText?: string;
  purposeDescription?: string;
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
  schemeId?: string;
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
  aiMatchScore?: number;
  cosineSimilarity?: number;
  reasons?: string[];
  topMatches?: any[];
  allEvaluations?: any[];
  aiModelUsed?: string;
  userSemanticText?: string;
  isAiAssisted?: boolean;
  timestamp?: string;
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
  userId?: string;
  userEmail?: string | null;
  schemeId?: string;
  scheme: string;
  schemeName?: string;
  amount: number;
  loanAmount?: number;
  interestRate: string | number;
  interestRateText?: string;
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
  createdAt?: string;
  updatedAt?: string;
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
      try {
        window.dispatchEvent(new CustomEvent("assessmentSubmitted", { detail: payload }));
      } catch (e) {
        // ignore
      }
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
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch {
          return [];
        }
      }
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
      try {
        window.dispatchEvent(new CustomEvent("assessmentSubmitted", { detail: null }));
      } catch (e) {
        // ignore
      }
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


