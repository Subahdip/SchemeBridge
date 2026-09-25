import { NextRequest, NextResponse } from "next/server";
import { matchSchemesWithAI, UserMatchingProfile } from "@/lib/ai-matcher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const profile: UserMatchingProfile = {
      income: Number(body.income || body.annualIncome || 0),
      loanAmount: Number(body.loanAmount || 0),
      loanPurpose: body.loanPurpose || body.purpose,
      requirementText: body.requirementText || body.purposeDescription || body.otherPurposeText || "",
      businessType: body.businessType,
      businessProjectSize: body.businessProjectSize || body.businessScale,
      personalReason: body.personalReason,
      personalProjectSize: body.personalProjectSize,
      educationCategory: body.educationCategory || body.educationLevel,
      educationProjectSize: body.educationProjectSize,
      otherPurposeText: body.otherPurposeText,
      otherProjectSize: body.otherProjectSize,
      creditScore: body.creditScore || "good",
      existingEmis: Number(body.existingEmis || 0),
      netSalary: Number(body.netSalary || 0),
      companyName: body.companyName || body.name,
      residentialStatus: body.residentialStatus,
      pincode: body.pincode
    };

    const result = await matchSchemesWithAI(profile);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("❌ [API /api/match-schemes] Unhandled error:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error during AI scheme matching",
        errorCode: "INTERNAL_SERVER_ERROR",
        bestMatch: null,
        topEligibleSchemes: [],
        allEvaluations: []
      },
      { status: 500 }
    );
  }
}
