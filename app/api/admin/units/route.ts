import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { units } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// GET - Fetch all units
export async function GET() {
  try {
    const allUnits = await db.select().from(units);

    return NextResponse.json({
      success: true,
      units: allUnits,
    });
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 });
  }
}

// POST - Create a new unit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, metadata } = body;

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json({ error: "Unit identifier is required" }, { status: 400 });
    }

    // Check if unit with this identifier already exists
    const existing = await db.select().from(units).where(eq(units.identifier, identifier)).limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "Unit with this identifier already exists" }, { status: 409 });
    }

    const newUnit = {
      id: crypto.randomUUID(),
      identifier: identifier.trim(),
      metadata: metadata || null,
      createdAt: new Date(),
    };

    await db.insert(units).values(newUnit);

    return NextResponse.json({
      success: true,
      unit: newUnit,
    });
  } catch (error) {
    console.error("Error creating unit:", error);
    return NextResponse.json({ error: "Failed to create unit" }, { status: 500 });
  }
}

// DELETE - Delete a unit
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Unit ID is required" }, { status: 400 });
    }

    await db.delete(units).where(eq(units.id, id));

    return NextResponse.json({
      success: true,
      message: "Unit deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting unit:", error);
    return NextResponse.json({ error: "Failed to delete unit" }, { status: 500 });
  }
}
