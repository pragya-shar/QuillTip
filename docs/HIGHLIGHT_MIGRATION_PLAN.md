# Highlight Migration Plan: Add `highlightId` to Existing Records

## ⚠️ CRITICAL CONTEXT

**Problem:** Old highlights in database lack the `highlightId` field, but:
- Some have already been tipped (tips stored on Stellar blockchain - IMMUTABLE)
- `highlightTips` table references these highlights by `highlightId`
- Current schema requires `highlightId: v.string()` causing deployment failures

**Goal:** Backfill `highlightId` for ALL existing highlights without data loss

---

## 📋 PRE-MIGRATION CHECKLIST

### Safety Measures
- [ ] Convex provides automatic backups (verify in dashboard)
- [ ] Have access to Convex dashboard for manual inspection
- [ ] Dev environment is working (`npm run dev`)
- [ ] Can run Convex functions (`npx convex run`)

### Data Audit
- [ ] Count total highlights in database
- [ ] Count highlights WITH `highlightId`
- [ ] Count highlights WITHOUT `highlightId`
- [ ] Count total `highlightTips` records
- [ ] Verify blockchain tips match database `highlightTips`

---

## 🔍 PHASE 1: AUDIT & VALIDATION

### Script 1: Audit Database State
**File:** `convex/migrations/01_auditHighlights.ts`

**Purpose:**
- Count records with/without `highlightId`
- Identify potential hash collisions
- Find orphaned tips

**Run:**
```bash
npx convex run migrations/01_auditHighlights:audit
```

**Expected Output:**
```json
{
  "highlights": {
    "total": 25,
    "withHighlightId": 10,
    "withoutHighlightId": 15
  },
  "highlightTips": {
    "total": 8
  },
  "potentialIssues": {
    "orphanedTips": [],
    "duplicateTexts": []
  }
}
```

**Red Flags:**
- `orphanedTips.length > 0` → Tips exist but no matching highlight
- `duplicateTexts.length > 0` → Same text highlighted multiple times (potential collision)

---

## 🛠️ PHASE 2: CREATE MIGRATION SCRIPTS

### Script 2: Migration (Dry Run)
**File:** `convex/migrations/02_backfillHighlightIds.ts`

**Features:**
1. **Idempotent** - Can run multiple times safely
2. **Dry-run mode** - Validate without writing
3. **Batch processing** - Handle large datasets
4. **Progress reporting** - Track completion
5. **Error handling** - Catch and report issues

**Key Logic:**
```typescript
// For each highlight WITHOUT highlightId:
1. Generate highlightId using same algorithm as createHighlight
2. Check if generated ID already exists (collision detection)
3. In dry-run: Log what would be updated
4. In live mode: Update the record
5. Track success/failure counts
```

**Run Dry-Run:**
```bash
npx convex run migrations/02_backfillHighlightIds:dryRun
```

**Expected Output:**
```json
{
  "mode": "DRY_RUN",
  "wouldUpdate": 15,
  "wouldSkip": 10,
  "collisions": [],
  "errors": [],
  "details": [
    {
      "highlightId": "abc123...",
      "text": "example text",
      "action": "WOULD_ADD_ID"
    }
  ]
}
```

---

## 🚀 PHASE 3: EXECUTE MIGRATION

### Step 1: Make Field Optional

**Change:** `convex/schema.ts:127`
```typescript
// BEFORE
highlightId: v.string(),

// AFTER (temporary)
highlightId: v.optional(v.string()), // MIGRATION: Will be required after backfill
```

**Deploy:**
```bash
npx convex deploy
```

**Verify:** No errors during deployment

---

### Step 2: Run Migration (Live)

**Run:**
```bash
npx convex run migrations/02_backfillHighlightIds:migrate
```

**Monitor Output:**
```json
{
  "mode": "LIVE",
  "updated": 15,
  "skipped": 10,
  "failed": 0,
  "duration": "1.2s"
}
```

**Success Criteria:**
- `failed === 0`
- `updated + skipped === total highlights`
- No error messages

**If Failures Occur:**
- DO NOT PROCEED
- Review error details
- Check for hash collisions
- May need manual intervention

---

### Step 3: Validate Results

**Script:** `convex/migrations/03_validateMigration.ts`

**Checks:**
1. All highlights now have `highlightId`
2. No duplicate `highlightId` values
3. `highlightTips` records match `highlights` by `highlightId`
4. No orphaned tips

**Run:**
```bash
npx convex run migrations/03_validateMigration:validate
```

**Expected Output:**
```json
{
  "validation": "PASSED",
  "highlights": {
    "total": 25,
    "withHighlightId": 25,
    "withoutHighlightId": 0
  },
  "integrity": {
    "orphanedTips": 0,
    "duplicateIds": 0,
    "mismatchedTips": 0
  }
}
```

**Failure Handling:**
If validation fails:
1. DO NOT make field required yet
2. Review specific failures
3. Run rollback script if needed
4. Fix issues manually
5. Re-run migration

---

### Step 4: Make Field Required Again

**Change:** `convex/schema.ts:127`
```typescript
// BEFORE (temporary)
highlightId: v.optional(v.string()),

// AFTER (final)
highlightId: v.string(), // ✅ Migration complete
```

**Deploy:**
```bash
npx convex deploy
```

**Verify:** Deployment succeeds

---

## 🔄 ROLLBACK PROCEDURES

### If Migration Fails Mid-Way

**Option 1: Re-run Migration**
- Migration is idempotent
- Can safely run multiple times
- Will skip already-migrated records

**Option 2: Manual Rollback**
**Script:** `convex/migrations/99_rollback.ts`

**Actions:**
1. Remove `highlightId` from recently updated records
2. Restore to pre-migration state
3. Keep field optional for retry

**Run:**
```bash
npx convex run migrations/99_rollback:rollback
```

---

## ⚠️ POTENTIAL ISSUES & SOLUTIONS

### Issue 1: Hash Collision
**Symptom:** Two highlights generate same `highlightId`

**Cause:** Same text, same position, same article

**Solution:**
- Add `userId` to hash formula (breaking change)
- OR: Accept collision (same highlight by different users = same ID)
- Current approach: Same highlight = same ID (intentional)

### Issue 2: Orphaned Tips
**Symptom:** `highlightTips` has records with no matching `highlights`

**Cause:** Highlight was deleted but tip remains

**Solution:**
- Create placeholder highlight with data from tip
- OR: Mark tip as orphaned
- OR: Delete orphaned tip

### Issue 3: Migration Timeout
**Symptom:** Migration takes too long

**Cause:** Large dataset (1000+ highlights)

**Solution:**
- Batch processing already implemented
- Process 100 records at a time
- Run multiple times if needed

### Issue 4: New Highlights During Migration
**Symptom:** User creates highlight while migration running

**Cause:** App still running during migration

**Solution:**
- Migration checks for `highlightId` existence
- New highlights already have ID (from `createHighlight`)
- Will be skipped automatically

---

## ✅ POST-MIGRATION VERIFICATION

### Manual Testing
1. Create new highlight → verify has `highlightId`
2. Tip existing highlight → verify tip links correctly
3. View highlight details → verify tip stats show
4. Delete highlight → verify cascades properly

### Database Inspection
1. Open Convex dashboard
2. Check `highlights` table → all have `highlightId`
3. Check `highlightTips` table → all link to valid highlights
4. Run query: `getUserHighlightsWithTips` → no errors

### Blockchain Verification
1. Check Stellar testnet explorer
2. Verify recent tips have correct `highlightId` in memo
3. Confirm amounts match database

---

## 📊 EXPECTED TIMELINE

| Phase | Duration | Can Fail? | Rollback? |
|-------|----------|-----------|-----------|
| Audit | 1 min | No | N/A |
| Create Scripts | 10 min | No | N/A |
| Deploy Optional | 1 min | Unlikely | Yes (revert schema) |
| Dry Run | 1 min | Yes (review) | N/A |
| Live Migration | 2 min | Possible | Yes (rollback script) |
| Validate | 1 min | Possible | Yes (rollback script) |
| Deploy Required | 1 min | Unlikely | Yes (make optional) |
| **Total** | **~20 min** | | |

---

## 🎯 SUCCESS CRITERIA

Migration is complete when:
- ✅ All highlights have `highlightId` field
- ✅ No duplicate `highlightId` values
- ✅ All `highlightTips` link to valid highlights
- ✅ Schema has `highlightId: v.string()` (required)
- ✅ Can create new highlights without errors
- ✅ Can tip highlights and see stats
- ✅ `npm run dev` starts without errors

---

## 📝 NOTES

### Why Not Just Delete?
- Blockchain tips are immutable
- Would break tip → highlight linkage
- Lose valuable test data showing system works

### Why Temporary Optional?
- Convex rejects deployment if required field missing
- Need to deploy schema before running migration
- Migration adds field, then we make required again

### Hash Formula
```typescript
const data = `${articleSlug}:${startOffset}:${endOffset}:${text.slice(0, 50)}`;
const hash = sha256(data).slice(0, 28); // Stellar memo max length
```

Same formula used:
- Client: `lib/stellar/highlight-utils.ts`
- Server: `convex/lib/highlightHash.ts`
- Contract: Receives pre-generated hash (doesn't re-hash)

---

## 🚨 EMERGENCY CONTACTS

If something goes catastrophically wrong:
1. Stop deployment: Cancel any running `npx convex deploy`
2. Contact Convex support: https://docs.convex.dev/
3. Check backups in Convex dashboard
4. Keep field optional until resolved

---

**Last Updated:** 2025-10-15
**Status:** DRAFT - Review before execution
