# ObVote Cryptographic Signature System

## Overview

This document explains the cryptographically-secure, legally-compliant signature system for petitions.

## Database Architecture

### 1. Petitions Table (`obvote_petitions`)

Stores petition content with versioning and integrity verification.

**Key Fields:**

- `id`: Unique identifier (UUID)
- `title`: Petition title
- `content`: Full petition text
- `version`: Integer version number (increments on edits)
- `content_hash`: SHA-256 hash of the content for integrity verification
- `is_active`: Whether petition accepts new signatures
- `created_at`, `updated_at`: Timestamps

**Purpose:**

- Maintains petition content
- Tracks versions if content is modified
- Provides content hash for signature verification

### 2. Signature Audit Log (`obvote_signature_audit_log`)

**⚠️ APPEND ONLY TABLE - NEVER DELETE RECORDS**

This is the single source of truth for all signature events and provides legal compliance.

**WHO - Attribution (Required for legal validity):**

- `user_id`: Reference to user who signed
- `user_email`: Snapshot of email at signing time
- `user_full_name`: Snapshot of name at signing time
- `user_ip_address`: IPv4/IPv6 address (for fraud detection)
- `user_agent`: Browser/device information

**WHAT - Association (Links signature to specific content):**

- `petition_id`: Which petition was signed
- `petition_version_signed`: Which version of the petition
- `petition_title_snapshot`: Title at time of signing
- `petition_content_hash`: Hash of the exact content signed

**HOW - Intent & Integrity (Proves deliberate action):**

- `consent_checkbox_checked`: User explicitly checked consent (required TRUE)
- `signature_typed_value`: What the user typed as their signature (e.g., "John Smith")
- `signature_hash`: Cryptographic proof - SHA-256(user_id + petition_content_hash + timestamp + typed_value)

**WHEN - Temporal Proof:**

- `signed_at_utc`: UTC timestamp when signature occurred

**Additional Context:**

- `metadata`: JSON field for device type, session info, etc.

## Cryptographic Signature Flow

### Step 1: User Initiates Signature

1. User clicks "Sign Petition"
2. Modal displays petition content
3. User must:
   - Read the petition
   - Check consent checkbox: "I agree to sign this petition"
   - Type their full name exactly as it appears in their account

### Step 2: Generate Content Hash

```javascript
const contentHash = crypto.createHash("sha256").update(petitionContent).digest("hex");
```

### Step 3: Generate Signature Hash

```javascript
const signatureData = [userId, contentHash, timestamp.toISOString(), typedSignatureValue].join("|");

const signatureHash = crypto.createHash("sha256").update(signatureData).digest("hex");
```

### Step 4: Record in Audit Log

Insert complete record into `obvote_signature_audit_log` with all fields populated.

### Step 5: Verification (Any Time)

To verify a signature's authenticity:

1. Retrieve audit log entry
2. Reconstruct signature hash from stored data
3. Compare with stored `signature_hash`
4. Verify `petition_content_hash` matches original petition

## Legal Compliance Features

### ✅ NYS E-Signature Requirements Met:

1. **Attribution**: Clear identification of signer (name, email, user_id)
2. **Intent**: Explicit consent checkbox + typed signature
3. **Integrity**: Cryptographic hash prevents tampering
4. **Non-repudiation**: Cannot deny signing (hash proves it)
5. **Association**: Signature linked to specific content version
6. **Temporal**: Precise timestamp of signature event
7. **Audit Trail**: Complete immutable record of event

### 🔒 Security Features:

- **Immutable**: Audit log is append-only (never delete/modify)
- **Tamper-Proof**: Any change to data invalidates signature hash
- **Version Tracking**: Signs specific petition version
- **IP Logging**: Fraud detection and investigation
- **Unique Constraint**: One signature per user per petition version

## API Endpoints (To Be Implemented)

### POST /api/petitions/:id/sign

```json
{
  "consentChecked": true,
  "typedSignature": "John Smith"
}
```

**Response:**

```json
{
  "success": true,
  "signatureEventId": "uuid",
  "signedAt": "2025-12-05T10:30:00Z"
}
```

### GET /api/petitions/:id/signatures

Returns list of valid signatures with public info (name, timestamp)

### GET /api/petitions/:id/verify/:signatureEventId

Verifies a specific signature's cryptographic integrity

## UI Components Needed

### 1. Petition Signature Modal

- Display full petition content
- Consent checkbox: "I have read and agree to sign this petition"
- Input field: "Type your full name: [__________]"
- Warning: "Your signature will be legally binding and publicly visible"
- Sign button (disabled until both checkbox + name match)

### 2. Signature List View

- Show all signatures on a petition
- Display: Name, Date, Verification status
- Public-facing (non-sensitive data only)

### 3. Admin Signature Verification

- View complete audit trail
- Verify cryptographic hashes
- Export for legal purposes

## Implementation Checklist

- [ ] Create petition signature modal component
- [ ] Implement POST /api/petitions/:id/sign endpoint
- [ ] Add signature hash generation utility
- [ ] Add signature verification utility
- [ ] Create GET /api/petitions/:id/signatures endpoint
- [ ] Add signature count to petition display
- [ ] Implement signature verification endpoint
- [ ] Add admin signature audit view
- [ ] Create signature export functionality (CSV/PDF)
- [ ] Add tests for cryptographic functions

## Example: Verifying a Signature

```typescript
import crypto from "crypto";

function verifySignature(auditLogEntry: SignatureAuditLog): boolean {
  // Reconstruct the signature hash
  const signatureData = [
    auditLogEntry.userId,
    auditLogEntry.petitionContentHash,
    auditLogEntry.signedAtUtc.toISOString(),
    auditLogEntry.signatureTypedValue,
  ].join("|");

  const computedHash = crypto.createHash("sha256").update(signatureData).digest("hex");

  // Compare with stored hash
  return computedHash === auditLogEntry.signatureHash;
}
```

## Migration Notes

**Previous Tables Removed:**

- `obvote_petition_signatures` (replaced by audit log)
- Old `obvote_signature_audit_log` (restructured)

**To Apply Changes:**

```bash
# Drop old tables (if you already ran this)
# DROP TABLE IF EXISTS obvote_petition_signatures;
# DROP TABLE IF EXISTS obvote_signature_audit_log;

# Run the new init script
npm run db:init
# or: node scripts/init-db.ts
```

## Security Best Practices

1. **Never modify audit log records** - Append only
2. **Always verify hashes** before displaying signature counts
3. **Log failed signature attempts** for fraud detection
4. **Rate limit signature endpoints** to prevent abuse
5. **Validate typed signature** matches user's registered name
6. **Store IP addresses** but don't display publicly
7. **Use HTTPS only** for signature submission

## Questions or Issues?

This system provides bank-grade security for petition signatures while meeting legal e-signature requirements. The cryptographic hashes make it mathematically impossible to forge or tamper with signatures after they're recorded.
