import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import * as schema from "../db/schema";

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "obvote.com",
  user: process.env.DB_USER || "oceanbre_wasil",
  password: process.env.DB_PASSWORD || "jR4$45&*jkgsFFf90)",
  database: process.env.DB_NAME || "oceanbre_wp_czhhn",
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

async function initializeDatabase() {
  let connection: mysql.Connection | null = null;

  try {
    console.log("🚀 Initializing ObVote Database...");
    console.log(`📍 Host: ${dbConfig.host}`);
    console.log(`📊 Database: ${dbConfig.database}`);
    console.log(`👤 User: ${dbConfig.user}`);

    // Create connection
    connection = await mysql.createConnection({
      ...dbConfig,
      database: undefined, // Connect without specifying database first
    });

    console.log("✅ Connected to MySQL server");

    // Create database if it doesn't exist
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`📁 Database '${dbConfig.database}' ready`);

    // Switch to the database
    await connection.execute(`USE \`${dbConfig.database}\``);

    // Initialize Drizzle
    const db = drizzle(connection, { schema, mode: "default" });

    console.log("🔄 Creating tables...");

    // Create tables manually since we're not using migrations for this initializer
    const createTableQueries = [
      // Users table
      `CREATE TABLE IF NOT EXISTS obvote_users (
        id VARCHAR(36) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20),
        unit_id VARCHAR(36),
        auth JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX idx_users_email (email),
        INDEX idx_users_unit_id (unit_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Units table
      `CREATE TABLE IF NOT EXISTS obvote_units (
        id VARCHAR(36) PRIMARY KEY,
        identifier VARCHAR(100) NOT NULL UNIQUE,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        INDEX idx_units_identifier (identifier)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Registration codes table
      `CREATE TABLE IF NOT EXISTS obvote_registration_codes (
        code VARCHAR(100) PRIMARY KEY,
        unit_id VARCHAR(36),
        used_by VARCHAR(36),
        used BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        used_at TIMESTAMP NULL,
        INDEX idx_registration_codes_unit_id (unit_id),
        INDEX idx_registration_codes_used_by (used_by),
        INDEX idx_registration_codes_used (used)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Petitions table
      `CREATE TABLE IF NOT EXISTS obvote_petitions (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        summary TEXT,
        text TEXT NOT NULL,
        metadata JSON,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX idx_petitions_is_active (is_active),
        FULLTEXT idx_petitions_title_text (title, text)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Petition signatures table
      `CREATE TABLE IF NOT EXISTS obvote_petition_signatures (
        id VARCHAR(36) PRIMARY KEY,
        petition_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        signature_value TEXT NOT NULL,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        UNIQUE KEY unique_petition_user (petition_id, user_id),
        INDEX idx_petition_signatures_petition_id (petition_id),
        INDEX idx_petition_signatures_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Signature audit log table
      `CREATE TABLE IF NOT EXISTS obvote_signature_audit_log (
        id VARCHAR(36) PRIMARY KEY,
        petition_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        INDEX idx_signature_audit_log_petition_id (petition_id),
        INDEX idx_signature_audit_log_user_id (user_id),
        INDEX idx_signature_audit_log_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Contact submissions table
      `CREATE TABLE IF NOT EXISTS obvote_contact_submissions (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        INDEX idx_contact_submissions_email (email),
        INDEX idx_contact_submissions_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Settings table
      `CREATE TABLE IF NOT EXISTS obvote_settings (
        id VARCHAR(100) PRIMARY KEY,
        data JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    ];

    // Execute all table creation queries
    for (const query of createTableQueries) {
      await connection.execute(query);
    }

    console.log("✅ All tables created successfully");

    // Insert default settings if they don't exist
    console.log("🔄 Setting up default configuration...");

    const defaultSettings = {
      site: {
        name: "ObVote",
        description: "Trustworthy voting platform",
        version: "1.0.0",
        maintenance: false,
      },
      features: {
        petitions: true,
        contact: true,
        userRegistration: true,
      },
      security: {
        maxLoginAttempts: 5,
        sessionTimeout: 3600000, // 1 hour
        passwordMinLength: 8,
      },
      notifications: {
        emailEnabled: false,
        smtpHost: null,
        smtpPort: null,
      },
    };

    await connection.execute(
      `
      INSERT INTO obvote_settings (id, data)
      VALUES ('site_settings', ?)
      ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = CURRENT_TIMESTAMP
    `,
      [JSON.stringify(defaultSettings)]
    );

    console.log("✅ Default settings initialized");

    console.log("🎉 Database initialization completed successfully!");
    console.log("\n📋 Tables created:");
    console.log("  • obvote_users");
    console.log("  • obvote_units");
    console.log("  • obvote_registration_codes");
    console.log("  • obvote_petitions");
    console.log("  • obvote_petition_signatures");
    console.log("  • obvote_signature_audit_log");
    console.log("  • obvote_contact_submissions");
    console.log("  • obvote_settings");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

// Run the initialization
initializeDatabase();
