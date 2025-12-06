import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import landingDefaults from "@/content/landing.json";

// Deep merge utility
function deepMerge(target: any, source: any): any {
  if (!source) return target;
  if (!target) return source;

  const output = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        // Recursively merge objects
        output[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        // Override with source value (including arrays and primitives)
        output[key] = source[key];
      }
    }
  }

  return output;
}

// GET - Get landing settings (merged with JSON defaults)
export async function GET() {
  try {
    const result = await db.select().from(settings).where(eq(settings.id, "landing_settings")).limit(1);

    // Start with JSON defaults
    let mergedSettings = JSON.parse(JSON.stringify(landingDefaults));

    // If database has settings, deep merge them (DB overrides JSON)
    if (result.length > 0 && result[0].data) {
      const dbData = result[0].data;
      console.log("Raw DB data type:", typeof dbData);
      console.log("Raw DB data:", dbData);

      // Parse if it's a string (shouldn't happen with json type but just in case)
      const parsedData = typeof dbData === "string" ? JSON.parse(dbData) : dbData;
      console.log("Parsed data:", parsedData);

      mergedSettings = deepMerge(mergedSettings, parsedData);
    }

    // Ensure default boolean flags exist
    if (!mergedSettings.banner) {
      mergedSettings.banner = landingDefaults.banner;
    }
    if (mergedSettings.banner && typeof mergedSettings.banner.shouldShow === "undefined") {
      mergedSettings.banner.shouldShow = true;
    }

    if (!mergedSettings.recentUpdates) {
      mergedSettings.recentUpdates = landingDefaults.recentUpdates;
    }
    if (mergedSettings.recentUpdates && typeof mergedSettings.recentUpdates.shouldShow === "undefined") {
      mergedSettings.recentUpdates.shouldShow = true;
    }

    return NextResponse.json({
      success: true,
      settings: mergedSettings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PUT - Update landing settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings: newSettings } = body;

    if (!newSettings) {
      return NextResponse.json({ error: "Settings data is required" }, { status: 400 });
    }

    console.log("Saving settings:", JSON.stringify(newSettings, null, 2));

    // Check if settings exist
    const existing = await db.select().from(settings).where(eq(settings.id, "landing_settings")).limit(1);

    if (existing.length === 0) {
      // Insert new settings
      await db.insert(settings).values({
        id: "landing_settings",
        data: newSettings,
        updatedAt: new Date(),
      });
    } else {
      // Update existing settings
      await db
        .update(settings)
        .set({
          data: newSettings,
          updatedAt: new Date(),
        })
        .where(eq(settings.id, "landing_settings"));
    }

    // Verify save by reading back
    const saved = await db.select().from(settings).where(eq(settings.id, "landing_settings")).limit(1);

    console.log("Saved successfully. Data in DB:", JSON.stringify(saved[0]?.data, null, 2));

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      saved: saved[0]?.data,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
