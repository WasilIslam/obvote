import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { petitions, signatureAuditLog } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { generateSignatureHash, getClientIp, getUserAgent } from "@/lib/petitions";
import crypto from "crypto";

// POST - Sign a petition
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: petitionId } = await params;
    const body = await request.json();
    const { userId, userEmail, userFullName, consentChecked, typedSignature } = body;

    // Validate required fields
    if (!userId || !userEmail || !userFullName || !typedSignature) {
      return NextResponse.json({ error: "User information and signature are required" }, { status: 400 });
    }

    if (!consentChecked) {
      return NextResponse.json({ error: "You must agree to sign the petition" }, { status: 400 });
    }

    // Get petition
    const petition = await db.select().from(petitions).where(eq(petitions.id, petitionId)).limit(1);

    if (petition.length === 0) {
      return NextResponse.json({ error: "Petition not found" }, { status: 404 });
    }

    const currentPetition = petition[0];

    if (!currentPetition.isActive) {
      return NextResponse.json({ error: "This petition is no longer accepting signatures" }, { status: 400 });
    }

    // Check if user already signed this version
    const existingSignature = await db
      .select()
      .from(signatureAuditLog)
      .where(
        and(
          eq(signatureAuditLog.userId, userId),
          eq(signatureAuditLog.petitionId, petitionId),
          eq(signatureAuditLog.petitionVersionSigned, currentPetition.version)
        )
      )
      .limit(1);

    if (existingSignature.length > 0) {
      return NextResponse.json({ error: "You have already signed this petition" }, { status: 400 });
    }

    // Generate cryptographic signature
    const signedAt = new Date();
    const signatureHash = generateSignatureHash(userId, currentPetition.contentHash || "", signedAt, typedSignature);

    // Get client info
    const userIp = getClientIp(request.headers);
    const userAgent = getUserAgent(request.headers);

    // Create audit log entry
    const eventId = crypto.randomUUID();
    const auditEntry = {
      eventId,
      userId,
      userEmail,
      userFullName,
      userIpAddress: userIp,
      userAgent,
      petitionId,
      petitionVersionSigned: currentPetition.version,
      petitionTitleSnapshot: currentPetition.title,
      petitionContentHash: currentPetition.contentHash || "",
      consentCheckboxChecked: consentChecked,
      signatureTypedValue: typedSignature,
      signatureHash,
      signedAtUtc: signedAt,
      metadata: {
        userAgentParsed: userAgent ? { raw: userAgent } : null,
      },
    };

    await db.insert(signatureAuditLog).values(auditEntry);

    return NextResponse.json({
      success: true,
      signatureEventId: eventId,
      signedAt: signedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error signing petition:", error);
    return NextResponse.json({ error: "Failed to sign petition" }, { status: 500 });
  }
}

// GET - Get signatures for a petition
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: petitionId } = await params;

    const signatures = await db
      .select({
        eventId: signatureAuditLog.eventId,
        userFullName: signatureAuditLog.userFullName,
        signedAtUtc: signatureAuditLog.signedAtUtc,
        petitionVersionSigned: signatureAuditLog.petitionVersionSigned,
      })
      .from(signatureAuditLog)
      .where(eq(signatureAuditLog.petitionId, petitionId))
      .orderBy(desc(signatureAuditLog.signedAtUtc));

    return NextResponse.json({
      success: true,
      signatures,
      count: signatures.length,
    });
  } catch (error) {
    console.error("Error fetching signatures:", error);
    return NextResponse.json({ error: "Failed to fetch signatures" }, { status: 500 });
  }
}
