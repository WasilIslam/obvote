import { NextResponse } from "next/server";
import { db } from "@/db";
import mysql from "mysql2/promise";

export async function GET() {
  try {
    // Get the raw mysql connection from drizzle
    const connection = (db as any).$client;

    // Query to get all tables in the database
    const [tables] = await connection.query(`
      SELECT
        TABLE_NAME as tableName,
        TABLE_TYPE as tableType,
        ENGINE as engine,
        TABLE_ROWS as rowCount,
        DATA_LENGTH as dataSize,
        INDEX_LENGTH as indexSize,
        CREATE_TIME as createdAt,
        UPDATE_TIME as updatedAt
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);

    return NextResponse.json({
      success: true,
      data: tables,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch database tables",
      },
      { status: 500 }
    );
  }
}
