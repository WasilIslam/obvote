import { mysqlTable, serial, varchar, text, timestamp, boolean, json, unique, int } from "drizzle-orm/mysql-core";

// Users table
export const users = mysqlTable("obvote_users", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  unitId: varchar("unit_id", { length: 36 }), // FK to units.id
  auth: json("auth"), // JSONB equivalent for auth provider info
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Units table
export const units = mysqlTable("obvote_units", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  identifier: varchar("identifier", { length: 100 }).notNull().unique(),
  metadata: json("metadata"), // JSONB for extra info
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Registration codes table
export const registrationCodes = mysqlTable("obvote_registration_codes", {
  code: varchar("code", { length: 100 }).primaryKey(),
  unitId: varchar("unit_id", { length: 36 }), // FK to units.id
  usedBy: varchar("used_by", { length: 36 }), // FK to users.id
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
});

// Petitions table - Content storage with versioning
export const petitions = mysqlTable("obvote_petitions", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("image_url", { length: 500 }), // Optional image
  version: int("version").default(1).notNull(), // Increments on edit
  contentHash: varchar("content_hash", { length: 64 }), // SHA-256 hash
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Signature audit log table - APPEND ONLY for legal compliance
// This is the single source of truth for all signature events
export const signatureAuditLog = mysqlTable("obvote_signature_audit_log", {
  eventId: varchar("event_id", { length: 36 }).primaryKey(), // UUID

  // WHO: Attribution
  userId: varchar("user_id", { length: 36 }).notNull(),
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  userFullName: varchar("user_full_name", { length: 255 }).notNull(),
  userIpAddress: varchar("user_ip_address", { length: 45 }), // IPv4/IPv6
  userAgent: text("user_agent"),

  // WHAT: Association
  petitionId: varchar("petition_id", { length: 36 }).notNull(),
  petitionVersionSigned: int("petition_version_signed").notNull(),
  petitionTitleSnapshot: text("petition_title_snapshot").notNull(),
  petitionContentHash: varchar("petition_content_hash", { length: 64 }).notNull(),

  // HOW: Intent & Integrity
  consentCheckboxChecked: boolean("consent_checkbox_checked").notNull().default(false),
  signatureTypedValue: varchar("signature_typed_value", { length: 255 }).notNull(),
  signatureHash: varchar("signature_hash", { length: 64 }).notNull(), // SHA-256

  // WHEN: Temporal proof
  signedAtUtc: timestamp("signed_at_utc").notNull().defaultNow(),

  // Additional metadata
  metadata: json("metadata"),
});

// Contact submissions table (updated structure)
export const contactSubmissions = mysqlTable("obvote_contact_submissions", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  message: text("message").notNull(),
  metadata: json("metadata"), // Additional contact info
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Settings table
export const settings = mysqlTable("obvote_settings", {
  id: varchar("id", { length: 100 }).primaryKey(), // e.g., "site_settings"
  data: json("data").notNull(), // Entire settings JSON blob
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
