import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { signatureAuditLog } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET - Get all signatures for a specific user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const signatures = await db
      .select({
        eventId: signatureAuditLog.eventId,
        petitionId: signatureAuditLog.petitionId,
        petitionTitleSnapshot: signatureAuditLog.petitionTitleSnapshot,
        petitionVersionSigned: signatureAuditLog.petitionVersionSigned,
        signedAtUtc: signatureAuditLog.signedAtUtc,
      })
      .from(signatureAuditLog)
      .where(eq(signatureAuditLog.userId, userId))
      .orderBy(desc(signatureAuditLog.signedAtUtc));

    return NextResponse.json({
      success: true,
      signatures,
      count: signatures.length,
    });
  } catch (error) {
    console.error("Error fetching user signatures:", error);
    return NextResponse.json({ error: "Failed to fetch signatures" }, { status: 500 });
  }
}
