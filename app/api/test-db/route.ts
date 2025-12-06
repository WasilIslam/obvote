import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function GET() {
  try {
    const startTime = Date.now();

    // Simple test: Fetch one user (or empty result if no users)
    const result = await db.select().from(users).limit(1);

    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      status: "✅ SUCCESS",
      message: "Database connection is working",
      execution_time: `${executionTime}ms`,
      timestamp: new Date().toISOString(),
      test_query: "SELECT * FROM obvote_users LIMIT 1",
      result_count: result.length,
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    return NextResponse.json(
      {
        status: "❌ FAILED",
        message: "Database connection failed",
        timestamp: new Date().toISOString(),
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          type: error instanceof Error ? error.constructor.name : typeof error,
          code: (error as any)?.code,
          errno: (error as any)?.errno,
          sqlState: (error as any)?.sqlState,
          sqlMessage: (error as any)?.sqlMessage,
          stack: error instanceof Error ? error.stack?.split("\n").slice(0, 5).join("\n") : undefined,
        },
        env_check: {
          DATABASE_URL_exists: !!process.env.DATABASE_URL,
          DATABASE_URL_preview: process.env.DATABASE_URL
            ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@").substring(0, 50) + "..."
            : "❌ NOT SET",
        },
        troubleshooting: [
          "1. Check if MySQL/MariaDB server is running",
          "2. Verify DATABASE_URL in .env.local file",
          "3. Ensure database credentials are correct",
          "4. Run: npm run db:push (to create tables)",
          "5. Check database host and port are accessible",
        ],
      },
      { status: 500 }
    );
  }
}
