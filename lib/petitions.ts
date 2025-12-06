import crypto from "crypto";

/**
 * Generate SHA-256 hash of petition content
 */
export function generateContentHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Generate cryptographic signature hash
 * Format: SHA-256(userId + contentHash + timestamp + typedSignature)
 */
export function generateSignatureHash(
  userId: string,
  contentHash: string,
  timestamp: Date,
  typedSignature: string
): string {
  const signatureData = [userId, contentHash, timestamp.toISOString(), typedSignature].join("|");

  return crypto.createHash("sha256").update(signatureData).digest("hex");
}

/**
 * Verify signature authenticity by recomputing hash
 */
export function verifySignature(
  userId: string,
  contentHash: string,
  timestamp: Date,
  typedSignature: string,
  storedHash: string
): boolean {
  const computedHash = generateSignatureHash(userId, contentHash, timestamp, typedSignature);
  return computedHash === storedHash;
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(headers: Headers): string | null {
  // Try various headers in order of reliability
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return null;
}

/**
 * Get user agent from request headers
 */
export function getUserAgent(headers: Headers): string | null {
  return headers.get("user-agent");
}
