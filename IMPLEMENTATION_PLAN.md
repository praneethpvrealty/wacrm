# Implementation Plan: ROI Yield Matching & Contact Expected ROI Preference

This document outlines the detailed design and implementation steps for introducing the Minimum Expected ROI preference field for contacts and upgrading the real estate matching engine to support location-agnostic high-yield matching.

---

## 1. Goal Description

Many real estate buyers (especially institutional and commercial investors) prioritize rental yield (ROI %) over specific locations. Currently, the system matches contacts to properties based on budget, areas of interest, and property interests. 

This enhancement will:
1. **Store Expected ROI**: Add a `min_roi` field to the contacts table to save a buyer's minimum expected yield (e.g. 4.5% ROI).
2. **Upgrade UI Forms**: Expose a "Expected Min ROI (%)" input field in contact forms and preference view sheets.
3. **Enhance Matching Engine**: Filter properties such that `property.roi >= contact.min_roi`.
4. **Location-Agnostic Matching**: Allow contacts who have specified `'any'` or left their areas of interest blank to match properties in any location, prioritizing the ROI match score components.

---

## 2. Database Migration Plan

We need to add a new `min_roi` numeric field to the `contacts` table.

### [NEW] Migration: `supabase/migrations/048_add_contacts_min_roi.sql`

Create a new migration script to add the column, set indices, and ensure that Row Level Security (RLS) policies are unaffected.

```sql
-- Migration 048: Add Expected Min ROI to Contacts Table
ALTER TABLE contacts 
  ADD COLUMN IF NOT EXISTS min_roi NUMERIC CHECK (min_roi >= 0);

COMMENT ON COLUMN contacts.min_roi IS 'Minimum expected rental yield ROI (%) for buyer profiles.';
```

### [MODIFY] Combined Script: [RUN_IN_SUPABASE_SQL_EDITOR.sql](file:///Volumes/work/CRM%20project/waCrmCustomised/wacrm/supabase/RUN_IN_SUPABASE_SQL_EDITOR.sql)
Append the migration statement to the end of the master script for complete workspace seeding portability.

---

## 3. TypeScript Type Definition Updates

Update the shared type definitions so that other files can resolve the new field safely.

### [MODIFY] [src/types/index.ts](file:///Volumes/work/CRM%20project/waCrmCustomised/wacrm/src/types/index.ts)
```typescript
export interface Contact {
  id: string;
  account_id: string;
  name: string;
  phone: string;
  email?: string;
  classification?: 'Owner' | 'Seller' | 'Buyer' | 'Agent' | 'Others';
  status?: 'active' | 'pending_review';
  // ... existing fields ...
  min_budget?: number | null;
  max_budget?: number | null;
  no_budget?: boolean;
  areas_of_interest?: string[];
  property_interests?: string[];
  min_roi?: number | null; // <-- NEW
  created_at?: string;
  updated_at?: string;
}
```

---

## 4. Frontend UI Upgrades

We must expose this new preference attribute to CRM operators so they can input and edit it.

### [MODIFY] Contact Preferences Form: [contact-form.tsx](file:///Volumes/work/CRM%20project/waCrmCustomised/wacrm/src/components/contacts/contact-form.tsx)
- Add a new input field for "Expected Min ROI (%)" inside the "Real Estate Preferences" grid.
- Bind it to a `minRoi` numeric state.
- Ensure the payload sent to `/api/contacts` includes `min_roi`.

```tsx
// Example UI Control
<div>
  <label className="text-sm font-medium text-slate-300">Expected Min ROI (%)</label>
  <Input
    type="number"
    step="0.01"
    placeholder="e.g. 4.5"
    value={minRoi}
    onChange={(e) => setMinRoi(e.target.value)}
    className="mt-1 bg-slate-900 border-slate-700 text-slate-100"
  />
</div>
```

### [MODIFY] Contact Detail sheet: [contact-detail-view.tsx](file:///Volumes/work/CRM%20project/waCrmCustomised/wacrm/src/components/contacts/contact-detail-view.tsx)
- Under the **Preferences** tab, render the "Expected Min ROI (%)" value.
- Add an editable number input field during Edit Mode for `min_roi`.

---

## 5. Matching Engine Modification

Upgrade the core matching algorithm to support yield matching.

### [MODIFY] Matching Rules: [matching.ts](file:///Volumes/work/CRM%20project/waCrmCustomised/wacrm/src/lib/matching.ts)

1. **ROI Yield Check**:
   - If `contact.min_roi` is defined and has a numeric value:
     - Check if `property.roi` exists and is a number.
     - The property is a match only if `property.roi >= contact.min_roi`.
     - If `contact.min_roi` is not defined or is null, matching defaults to `true` for the ROI criteria.
   - If a contact fails the ROI match, they must be excluded from the match results.

2. **Location-Agnostic Area Check**:
   - If `contact.areas_of_interest` contains `'any'`, `'not specific'`, or is empty, the `areaMatch` resolves to `true` immediately.

3. **Scoring Logic Upgrades**:
   - If a specific `min_roi` is specified and matches, allocate **30 points** to the match score.
   - If the location is set to `'any'` or left blank, the scoring logic should prioritize interests and ROI matching.

```typescript
// Proposed structure additions to getMatchingContacts()
let roiMatch = false;
const propertyRoi = property.roi ? Number(property.roi) : null;
const minExpectedRoi = contact.min_roi ? Number(contact.min_roi) : null;

if (minExpectedRoi !== null) {
  roiMatch = propertyRoi !== null && propertyRoi >= minExpectedRoi;
} else {
  // Default to true if contact has no specific ROI requirements
  roiMatch = true;
}

// Ensure the contact is only matched if (budgetMatch && areaMatch && interestMatch && roiMatch)
```

---

## 6. Verification Plan

### Automated Testing
1. **TypeScript Compile Check**: Run `npm run typecheck` to confirm no type signature regressions occur.
2. **Unit Tests**: Add a test suite inside `src/lib/matching.test.ts` to verify:
   - A property with `roi = 5%` matches a contact with `min_roi = 4%`.
   - A property with `roi = 3%` does **not** match a contact with `min_roi = 4%`.
   - A location-agnostic contact (`areas_of_interest = ['any']` or empty) matches properties in different locations.
3. Run the tests using `npm test`.

### Manual Testing
1. Create a commercial property (e.g. "Commercial Office Block") with Price: 10 Crore, monthly rent: 4 Lakhs (ROI = 4.8%).
2. Open contacts and create a Buyer ("Surya Yield Investor") with Expected Min ROI = 4.5% and areas of interest left blank.
3. Verify that "Surya Yield Investor" appears as a matching contact on the commercial property form's Matching Contacts tab.
4. Modify the contact Expected Min ROI to 5.0% and verify that the contact disappears from the matching list.
