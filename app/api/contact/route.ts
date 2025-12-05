import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, unitNumber, subject, phone, ...extraFields } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Generate UUID for the submission
    const submissionId = randomUUID();

    // Prepare metadata with additional fields
    const metadata: any = {
      ...extraFields,
    };

    if (unitNumber) metadata.unitNumber = unitNumber;
    if (subject) metadata.subject = subject;
    if (phone) metadata.phone = phone;

    // Add request metadata
    metadata.ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    metadata.userAgent = request.headers.get("user-agent");
    metadata.timestamp = new Date().toISOString();

    // Insert into database
    await db.insert(contactSubmissions).values({
      id: submissionId,
      name,
      email,
      message,
      metadata,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been sent successfully. We will get back to you soon!",
        data: {
          id: submissionId,
          submitted_at: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Database error:", error);

    return NextResponse.json(
      {
        error: "Failed to submit your message. Please try again later.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
