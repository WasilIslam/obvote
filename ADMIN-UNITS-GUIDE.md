# Admin Units & Registration Codes - User Guide

## Overview

The Units admin page (`/admin/units`) provides a comprehensive interface for managing apartment units and their associated registration codes. You can manage codes in two ways:

1. **Inline Management** - Directly within the units table (expandable rows)
2. **Separate Tab** - View all codes across all units in one place

---

## Units Tab - Expandable View

### Main Table Features

The units table shows:

- **Expand/Collapse Icon** - Click to toggle code view
- **Unit ID** - The apartment identifier (e.g., "4B", "12A")
- **Code Count Badge** - Shows how many codes are assigned to this unit
  - Green badge = Has codes
  - Gray badge = No codes yet
- **Created Date** - When the unit was added
- **Delete Button** - Remove the unit

### How to View & Manage Codes for a Unit

**Step 1: Expand a Unit**

- Click anywhere on the unit row (or the chevron icon)
- The row expands to show all registration codes for that unit

**Step 2: View Codes**
When expanded, you'll see:

- A nested table with all codes for that unit
- Code value (e.g., "ABCD-1234-EFGH")
- Status badge (Used/Unused)
- Created date
- Delete button (disabled for used codes)

**Step 3: Quick Add Code**

- Click the "Add Code" button in the expanded section
- A new random code is instantly generated and assigned to the unit
- No need to switch tabs or fill out forms

**Step 4: Delete Unused Codes**

- Click the delete button next to any unused code
- Used codes cannot be deleted (button is disabled)

---

## Registration Codes Tab - Global View

This tab shows **all registration codes** across all units in one table.

### Features:

- View codes from all units in one place
- Filter by unit using the unit column
- Create codes manually or auto-generate
- Optionally assign codes to units during creation
- See which codes are used/unused
- Delete unused codes

### When to Use This Tab:

- Creating multiple codes at once
- Getting an overview of all codes
- Finding codes not yet assigned to units
- Bulk management operations

---

## Workflow Examples

### Example 1: Setting up a new unit with codes

1. Go to Units tab
2. Click "Add Unit"
3. Enter unit identifier (e.g., "5C")
4. Click "Create Unit"
5. Find the new unit in the table
6. Click to expand it
7. Click "Add Code" 2-3 times to create multiple codes
8. Done! The unit now has registration codes ready for residents

### Example 2: Checking which codes are available

**Quick Method (Inline):**

1. Expand the unit you're interested in
2. Look at the status badges
3. Unused codes are available for new residents

**Comprehensive Method (Separate Tab):**

1. Switch to "Registration Codes" tab
2. Scan the status column
3. Filter by unit if needed
4. See all available codes at a glance

### Example 3: Resident asks for their unit's code

1. Go to Units tab
2. Find their unit (e.g., "4B")
3. Click to expand
4. Look for unused codes
5. Share the code with the resident
6. After they register, the code will show as "Used"

---

## Visual Indicators

### Code Count Badges (in main table)

- 🟢 **Green badge** - Unit has codes assigned
- ⚪ **Gray badge** - No codes yet

### Status Badges (in code tables)

- ✅ **Green "Used"** - Code has been redeemed by a resident
- 🟠 **Orange "Unused"** - Code is available for registration

### Expandable Rows

- ▶️ **Right chevron** - Row is collapsed
- 🔽 **Down chevron** - Row is expanded

---

## Tips & Best Practices

1. **Generate codes in advance** - Create 2-3 codes per unit before residents move in
2. **Use inline management** for quick operations on specific units
3. **Use the separate tab** for bulk operations or overview
4. **Used codes are protected** - They cannot be deleted to maintain audit trail
5. **Hover over rows** - The background changes to help you see what you're clicking
6. **Click anywhere on the row** - Not just the chevron icon

---

## Keyboard & Mouse Shortcuts

- **Click unit row** → Expand/collapse
- **Click chevron** → Expand/collapse
- **Hover over unit row** → Highlight effect
- **Click "Add Code"** → Instant code generation (no form needed)

---

## Common Questions

**Q: Can I delete a unit that has codes?**
A: Yes, but be careful. Deleting a unit doesn't automatically delete its codes.

**Q: What happens to used codes if I delete a unit?**
A: Used codes remain in the database for audit purposes. They're just no longer associated with a unit.

**Q: Can I edit a code after creating it?**
A: No, codes are immutable once created. You can only delete unused codes.

**Q: How do I know which code a resident used?**
A: Used codes show a "Used" badge. You can also check the user's profile to see their associated unit.

**Q: Can I assign multiple codes to one unit?**
A: Yes! This is useful for units with multiple residents or for having backup codes.

---

## Technical Notes

- Codes are auto-generated using uppercase letters and numbers (excluding ambiguous characters)
- Format: XXXX-XXXX-XXXX (12 characters + hyphens)
- Codes are case-insensitive when residents enter them
- Each code can only be used once
- Codes are validated server-side during registration
