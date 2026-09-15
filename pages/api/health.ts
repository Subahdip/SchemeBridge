import type { NextApiRequest, NextApiResponse } from "next";

type HealthResponse = {
  status: string;
  framework: string;
  version: string;
  timestamp: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  res.status(200).json({
    status: "healthy",
    framework: "Next.js 14 (App & Pages ready)",
    version: "14.2.35",
    timestamp: new Date().toISOString(),
  });
}
