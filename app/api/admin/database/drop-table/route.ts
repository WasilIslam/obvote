import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import mysql from "mysql2/promise";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableName, action } = body;

    if (!tableName) {
      return NextResponse.json({ success: false, error: "Table name is required" }, { status: 400 });
    }

    if (!action || !["drop", "clear"].includes(action)) {
      return NextResponse.json({ success: false, error: "Action must be 'drop' or 'clear'" }, { status: 400 });
    }

    // Safety check - don't allow dropping critical system tables
    const protectedTables = ["mysql", "information_schema", "performance_schema", "sys"];
    if (protectedTables.includes(tableName.toLowerCase())) {
      return NextResponse.json({ success: false, error: "Cannot modify system tables" }, { status: 403 });
    }

    // Get the raw mysql connection from drizzle
    const connection = (db as any).$client;

    // First check if table exists
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
      [tableName]
    );

    if ((tables as any[]).length === 0) {
      return NextResponse.json({ success: false, error: "Table does not exist" }, { status: 404 });
    }

    if (action === "drop") {
      // Drop the table
      await connection.query(`DROP TABLE \`${tableName}\``);

      return NextResponse.json({
        success: true,
        message: `Table '${tableName}' has been dropped successfully`,
        action: "drop",
      });
    } else if (action === "clear") {
      // Clear all data from the table (but keep the structure)
      await connection.query(`TRUNCATE TABLE \`${tableName}\``);

      return NextResponse.json({
        success: true,
        message: `All data from table '${tableName}' has been cleared successfully`,
        action: "clear",
      });
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform table operation",
      },
      { status: 500 }
    );
  }
}
