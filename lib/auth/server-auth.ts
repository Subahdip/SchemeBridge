/**
 * SchemeBridge - Server-Side Firebase Authentication & Cryptographic Token Verification
 * 
 * Verifies Firebase ID Tokens (RS256) directly against Google's public x509 certificates.
 * Prevents user spoofing by deriving the authenticated UID strictly from verified cryptographic claims.
 */

import crypto from "crypto";

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  name: string | null;
}

interface GoogleCertsCache {
  certs: Record<string, string>;
  expiresAt: number;
}

let certsCache: GoogleCertsCache | null = null;

const GOOGLE_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

/**
 * Fetches and caches Google's public x509 certificates for Firebase Auth token verification.
 */
async function getGooglePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (certsCache && certsCache.expiresAt > now) {
    return certsCache.certs;
  }

  try {
    const res = await fetch(GOOGLE_CERTS_URL);
    if (!res.ok) {
      throw new Error(`Failed to fetch Google public certs: HTTP ${res.status}`);
    }

    const cacheControl = res.headers.get("cache-control") || "";
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    const maxAgeSeconds = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 3600;

    const certs: Record<string, string> = await res.json();
    certsCache = {
      certs,
      expiresAt: now + maxAgeSeconds * 1000,
    };
    return certs;
  } catch (err: any) {
    console.error("❌ [Auth] Error fetching Google public certs:", err.message);
    if (certsCache) return certsCache.certs;
    throw err;
  }
}

/**
 * Helper to base64url decode a string.
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Cryptographically verifies a Firebase ID Token using Google's public certificates.
 * Returns the authenticated user claims or throws an error.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<AuthenticatedUser> {
  if (!idToken || typeof idToken !== "string") {
    throw new Error("Missing or invalid authentication token.");
  }

  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed JWT token format.");
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  // 1. Decode Header & Payload
  let header: any;
  let payload: any;
  try {
    header = JSON.parse(base64UrlDecode(headerB64));
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch {
    throw new Error("Failed to parse token header or payload.");
  }

  // 2. Validate Header
  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Invalid token algorithm or missing key ID (kid).");
  }

  // 3. Fetch Google public certificates
  const certs = await getGooglePublicCerts();
  const cert = certs[header.kid];
  if (!cert) {
    throw new Error("Token key ID (kid) not found in Google public certificates.");
  }

  // 4. Verify Cryptographic RSA-SHA256 Signature
  const signedData = `${headerB64}.${payloadB64}`;
  const signature = Buffer.from(signatureB64.replace(/-/g, "+").replace(/_/g, "/"), "base64");

  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(signedData);
  const isValid = verifier.verify(cert, signature);

  if (!isValid) {
    throw new Error("Cryptographic token signature verification failed.");
  }

  // 5. Validate Standard Claims
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sihscheme";
  const nowInSec = Math.floor(Date.now() / 1000);

  if (payload.exp && payload.exp < nowInSec) {
    throw new Error("Authentication token has expired. Please sign in again.");
  }

  if (payload.iat && payload.iat > nowInSec + 300) {
    throw new Error("Token issued in the future (clock skew detected).");
  }

  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error(`Invalid token issuer. Expected https://securetoken.google.com/${projectId}`);
  }

  if (payload.aud !== projectId) {
    throw new Error(`Invalid token audience. Expected ${projectId}`);
  }

  if (!payload.sub || typeof payload.sub !== "string" || payload.sub.trim() === "") {
    throw new Error("Token missing valid subject (sub) user ID.");
  }

  return {
    uid: payload.sub,
    email: payload.email || null,
    name: payload.name || null,
  };
}

/**
 * Extracts and verifies the authenticated user from an incoming Next.js Request.
 * Reads the Authorization header: `Bearer <token>`
 */
export async function getAuthenticatedUser(request: Request): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token) return null;

  try {
    return await verifyFirebaseIdToken(token);
  } catch (err: any) {
    console.warn("⚠️ [Auth] Token verification failed:", err.message);
    return null;
  }
}
