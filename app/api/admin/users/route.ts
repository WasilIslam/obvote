import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, units, registrationCodes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // Fetch all users
    const allUsers = await db.select().from(users);

    // Fetch all units
    const allUnits = await db.select().from(units);

    // Fetch all registration codes
    const allCodes = await db.select().from(registrationCodes);

    // Create maps for quick lookup
    const unitsMap = new Map(allUnits.map((u) => [u.id, u]));
    const codesMap = new Map(allCodes.map((c) => [c.usedBy, c.code]));

    // Enrich users with unit and registration code info
    const enrichedUsers = allUsers.map((user) => {
      const unit = user.unitId ? unitsMap.get(user.unitId) : null;
      const regCode = codesMap.get(user.id);

      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        unitId: user.unitId,
        unitIdentifier: unit ? unit.identifier : null,
        registrationCode: regCode || null,
        createdAt: user.createdAt,
      };
    });

    // Sort by creation date (newest first)
    enrichedUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      users: enrichedUsers,
      count: enrichedUsers.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
