import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, registrationCodes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

// Simple hash function
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// POST - Sign up a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, registrationCode } = body;

    // Validate required fields
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Please fill in all required fields: email, password, and full name." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "This email is already registered. Please sign in instead." }, { status: 409 });
    }

    let unitId = null;

    // If registration code provided, validate and mark as used
    if (registrationCode) {
      const codeRecord = await db
        .select()
        .from(registrationCodes)
        .where(and(eq(registrationCodes.code, registrationCode), eq(registrationCodes.used, false)))
        .limit(1);

      if (codeRecord.length === 0) {
        return NextResponse.json({ error: "Invalid or already used registration code" }, { status: 400 });
      }

      unitId = codeRecord[0].unitId;
    }

    // Create user
    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(password);

    const newUser = {
      id: userId,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || null,
      unitId: unitId,
      auth: {
        passwordHash,
        method: "local",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(users).values(newUser);

    // Mark registration code as used
    if (registrationCode) {
      await db
        .update(registrationCodes)
        .set({
          used: true,
          usedBy: userId,
          usedAt: new Date(),
        })
        .where(eq(registrationCodes.code, registrationCode));
    }

    // Create session token (simple approach)
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: newUser.email,
        fullName: newUser.fullName,
        unitId: newUser.unitId,
      },
      session: {
        token: sessionToken,
        expiry: sessionExpiry,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
