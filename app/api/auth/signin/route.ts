import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// Simple hash function
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// POST - Sign in a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Find user by email
    const userRecord = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json(
        { error: "No account found with this email address. Please register first." },
        { status: 401 }
      );
    }

    const user = userRecord[0];

    console.log(user);

    // Check if user has auth data
    if (!user.auth) {
      return NextResponse.json(
        { error: "Account not properly configured. Please contact support or register a new account." },
        { status: 401 }
      );
    }

    // Parse auth data if it's a string (MySQL returns JSON as string sometimes)
    let authData: { passwordHash?: string; method?: string };
    if (typeof user.auth === "string") {
      try {
        authData = JSON.parse(user.auth);
      } catch (e) {
        return NextResponse.json(
          { error: "Account not properly configured. Please contact support or register a new account." },
          { status: 401 }
        );
      }
    } else {
      authData = user.auth as { passwordHash?: string; method?: string };
    }

    // Verify password
    const passwordHash = hashPassword(password);
    if (authData.passwordHash !== passwordHash) {
      return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 });
    }

    // Create session token (simple approach)
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        unitId: user.unitId,
      },
      session: {
        token: sessionToken,
        expiry: sessionExpiry,
      },
    });
  } catch (error) {
    console.error("Error during signin:", error);
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 });
  }
}
