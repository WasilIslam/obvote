# ObVote Database Setup

This document explains how to set up and initialize the ObVote database using Drizzle ORM.

## Database Schema

The application uses a comprehensive database schema designed for a petition and voting platform:

### Core Tables

#### Users (`obvote_users`)

- **Purpose**: Store user accounts and authentication
- **Key Fields**: id (UUID), full_name, email (unique), phone, unit_id, auth (JSONB)
- **Features**: OAuth support, unit association

#### Units (`obvote_units`)

- **Purpose**: Manage residential units
- **Key Fields**: id (UUID), identifier (unique), metadata (JSONB)
- **Features**: Flexible unit identification

#### Registration Codes (`obvote_registration_codes`)

- **Purpose**: One-time codes for unit registration
- **Key Fields**: code (PK), unit_id, used_by, used (boolean), timestamps
- **Features**: Prevents code reuse

#### Petitions (`obvote_petitions`)

- **Purpose**: Store petition content and metadata
- **Key Fields**: id (UUID), title, summary, text, metadata (JSONB), is_active
- **Features**: Full-text search, active/inactive status

#### Petition Signatures (`obvote_petition_signatures`)

- **Purpose**: Store user signatures on petitions
- **Key Fields**: id (UUID), petition_id, user_id, signature_value, metadata (JSONB)
- **Constraint**: UNIQUE(petition_id, user_id) - prevents duplicate signatures

#### Signature Audit Log (`obvote_signature_audit_log`)

- **Purpose**: Append-only audit trail for NYS e-signature compliance
- **Key Fields**: id (UUID), petition_id, user_id, data (JSONB)
- **Features**: Complete signature history, legal compliance

#### Contact Submissions (`obvote_contact_submissions`)

- **Purpose**: Store contact form submissions
- **Key Fields**: id (UUID), name, email, message, metadata (JSONB)
- **Features**: Flexible metadata storage (unit, subject, phone, IP, etc.)

#### Settings (`obvote_settings`)

- **Purpose**: Single table for all site configuration
- **Key Fields**: id (PK, e.g. "site_settings"), data (JSONB)
- **Features**: Centralized configuration management

## Database Initialization

### Prerequisites

1. **MySQL Server**: Running MySQL 8.0+ or compatible
2. **Database Access**: User with CREATE, ALTER, and INSERT privileges
3. **Environment Variables** (optional): Configure in `.env` or use direct values in config

### Database Configuration

The database connection is configured in:

- `drizzle.config.ts` - Drizzle configuration
- `db/index.ts` - Database connection instance

**Current Configuration:**

```typescript
host: "obvote.com";
user: "oceanbre_wasil";
password: "jR4$45&*jkgsFFf90)";
database: "oceanbre_wp_czhhn";
port: 3306;
```

### Running the Initializer

Execute the database initialization script:

```bash
npm run init-db
```

This will:

1. ✅ Connect to MySQL server
2. ✅ Create database if it doesn't exist
3. ✅ Create all tables with proper indexes and constraints
4. ✅ Insert default site settings
5. ✅ Display success confirmation

### What Gets Created

The initializer creates:

**Tables:**

- `obvote_users` - User management
- `obvote_units` - Unit management
- `obvote_registration_codes` - Registration system
- `obvote_petitions` - Petition content
- `obvote_petition_signatures` - Signatures with uniqueness
- `obvote_signature_audit_log` - Audit trail
- `obvote_contact_submissions` - Contact forms
- `obvote_settings` - Site configuration

**Indexes:**

- Email indexes for `obvote_users` and `obvote_contact_submissions`
- Foreign key indexes for all FK relationships
- Full-text search on `obvote_petitions` (title, text)
- Timestamp indexes for audit logs and performance

**Default Data:**

- Site settings inserted into `obvote_settings` table
- Feature flags, security settings, and notification configs

## Migration Commands

After initialization, use these commands for database management:

```bash
# Generate new migrations
npm run db:generate

# Push schema changes (⚠️  CAUTION: may lose data)
npm run db:push

# Check schema compatibility
npm run db:check

# Open Drizzle Studio (visual database management)
npm run db:studio
```

## Schema Evolution

When making schema changes:

1. **Update** `db/schema.ts` with your changes
2. **Generate** migrations: `npm run db:generate`
3. **Review** generated SQL in `drizzle/` directory
4. **Test** locally before deploying
5. **Apply** migrations in production

## Environment Variables (Optional)

Instead of hardcoded values, you can use environment variables:

```bash
DB_HOST=your-host.com
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database
DB_PORT=3306
```

## Troubleshooting

### Connection Issues

- Verify MySQL server is running
- Check credentials and network access
- Ensure database user has proper privileges

### Table Creation Failures

- Check MySQL version compatibility
- Verify database charset/collation support
- Ensure no naming conflicts with existing tables

### Migration Issues

- Always backup before schema changes
- Test migrations on development first
- Use `db:check` to validate schema compatibility

## Security Notes

- **Passwords**: Never commit real credentials to version control
- **Privileges**: Use minimal required MySQL permissions
- **Backups**: Always backup before major schema changes
- **Audit Trail**: Signature audit log is append-only for legal compliance

## Architecture Benefits

- **Type Safety**: Full TypeScript integration
- **Flexible Metadata**: JSONB fields for extensible data
- **Performance**: Proper indexing and constraints
- **Scalability**: UUIDs prevent enumeration attacks
- **Compliance**: Audit trails for legal requirements
- **Maintainability**: Single source of truth for schema
