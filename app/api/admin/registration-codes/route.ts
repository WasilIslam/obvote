import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { registrationCodes, units } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - Fetch all registration codes with unit info
export async function GET() {
  try {
    const allCodes = await db
      .select({
        code: registrationCodes.code,
        unitId: registrationCodes.unitId,
        usedBy: registrationCodes.usedBy,
        used: registrationCodes.used,
        createdAt: registrationCodes.createdAt,
        usedAt: registrationCodes.usedAt,
        unitIdentifier: units.identifier,
      })
      .from(registrationCodes)
      .leftJoin(units, eq(registrationCodes.unitId, units.id));

    return NextResponse.json({
      success: true,
      codes: allCodes,
    });
  } catch (error) {
    console.error("Error fetching registration codes:", error);
    return NextResponse.json({ error: "Failed to fetch registration codes" }, { status: 500 });
  }
}

// POST - Create a new registration code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, unitId } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Registration code is required" }, { status: 400 });
    }

    // Check if code already exists
    const existing = await db.select().from(registrationCodes).where(eq(registrationCodes.code, code)).limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "Registration code already exists" }, { status: 409 });
    }

    // If unitId is provided, verify it exists
    if (unitId) {
      const unitExists = await db.select().from(units).where(eq(units.id, unitId)).limit(1);

      if (unitExists.length === 0) {
        return NextResponse.json({ error: "Unit not found" }, { status: 404 });
      }
    }

    const newCode = {
      code: code.trim(),
      unitId: unitId || null,
      usedBy: null,
      used: false,
      createdAt: new Date(),
      usedAt: null,
    };

    await db.insert(registrationCodes).values(newCode);

    return NextResponse.json({
      success: true,
      code: newCode,
    });
  } catch (error) {
    console.error("Error creating registration code:", error);
    return NextResponse.json({ error: "Failed to create registration code" }, { status: 500 });
  }
}

// DELETE - Delete a registration code
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Registration code is required" }, { status: 400 });
    }

    // Check if code is used
    const existing = await db.select().from(registrationCodes).where(eq(registrationCodes.code, code)).limit(1);

    if (existing.length > 0 && existing[0].used) {
      return NextResponse.json({ error: "Cannot delete a used registration code" }, { status: 400 });
    }

    await db.delete(registrationCodes).where(eq(registrationCodes.code, code));

    return NextResponse.json({
      success: true,
      message: "Registration code deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting registration code:", error);
    return NextResponse.json({ error: "Failed to delete registration code" }, { status: 500 });
  }
}
