import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { petitions, signatureAuditLog } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateContentHash } from "@/lib/petitions";
import crypto from "crypto";

// GET - List all active petitions with signature counts
export async function GET() {
  try {
    const allPetitions = await db
      .select()
      .from(petitions)
      .where(eq(petitions.isActive, true))
      .orderBy(desc(petitions.createdAt));

    // Get signature counts for each petition
    const petitionsWithCounts = await Promise.all(
      allPetitions.map(async (petition) => {
        const signatures = await db
          .select()
          .from(signatureAuditLog)
          .where(eq(signatureAuditLog.petitionId, petition.id));

        return {
          ...petition,
          signatureCount: signatures.length,
        };
      })
    );

    return NextResponse.json({
      success: true,
      petitions: petitionsWithCounts,
    });
  } catch (error) {
    console.error("Error fetching petitions:", error);
    return NextResponse.json({ error: "Failed to fetch petitions" }, { status: 500 });
  }
}

// POST - Create a new petition (admin only - add auth check later)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, imageUrl } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const petitionId = crypto.randomUUID();
    const contentHash = generateContentHash(content);

    const newPetition = {
      id: petitionId,
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl || null,
      version: 1,
      contentHash,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(petitions).values(newPetition);

    return NextResponse.json({
      success: true,
      petition: newPetition,
    });
  } catch (error) {
    console.error("Error creating petition:", error);
    return NextResponse.json({ error: "Failed to create petition" }, { status: 500 });
  }
}
