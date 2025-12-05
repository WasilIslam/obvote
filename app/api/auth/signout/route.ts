import { NextResponse } from "next/server";

// POST - Sign out (client-side handles clearing localStorage)
export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Signed out successfully",
  });
}
