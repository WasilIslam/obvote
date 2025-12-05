import { NextResponse } from "next/server";
import { db } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const submissions = await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));

    const formattedSubmissions = submissions.map((submission) => ({
      id: submission.id,
      name: submission.name,
      email: submission.email,
      message: submission.message,
      metadata: submission.metadata,
      createdAt: submission.createdAt!.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedSubmissions,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contact submissions",
      },
      { status: 500 }
    );
  }
}
