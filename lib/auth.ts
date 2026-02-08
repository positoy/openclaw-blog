import { NextRequest, NextResponse } from "next/server";

export function isAuthenticated(request: NextRequest): boolean {
  const apiKey = request.headers.get("X-API-KEY");
  const validKey = process.env.API_KEY;

  console.log("apiKey", apiKey);
  console.log("validKey", validKey);
  if (!validKey) {
    // If API_KEY is not configured, we might deny all writes or allow (insecure).
    // Defaulting to deny for security.
    console.warn("API_KEY is not configured on server.");
    return false;
  }

  return apiKey === validKey;
}
