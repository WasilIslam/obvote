import { mysqlTable, serial, varchar, text, timestamp, boolean, json, unique } from "drizzle-orm/mysql-core";

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

// Petitions table
export const petitions = mysqlTable("obvote_petitions", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  title: varchar("title", { length: 500 }).notNull(),
  summary: text("summary"),
  text: text("text").notNull(),
  metadata: json("metadata"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Petition signatures table
export const petitionSignatures = mysqlTable(
  "obvote_petition_signatures",
  {
    id: varchar("id", { length: 36 }).primaryKey(), // UUID
    petitionId: varchar("petition_id", { length: 36 }).notNull(), // FK to petitions.id
    userId: varchar("user_id", { length: 36 }).notNull(), // FK to users.id
    signatureValue: text("signature_value").notNull(),
    metadata: json("metadata"), // IP, UA, method, confirmation flags
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueSignature: unique().on(table.petitionId, table.userId),
  })
);

// Signature audit log table
export const signatureAuditLog = mysqlTable("obvote_signature_audit_log", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  petitionId: varchar("petition_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  data: json("data").notNull(), // All NYS e-signature data
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
