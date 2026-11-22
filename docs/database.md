# VerseSnap Database Architecture & Schema Specification

This document details the PostgreSQL 16 schema managed via Prisma ORM 6.

> [!IMPORTANT]
> **First Migration Notice:** The schema definition resides in `backend/prisma/schema.prisma`. The initial database migration (`npx prisma migrate dev --name init`) must be generated and committed exclusively by the **Backend Lead**. Developers should run `npm run db:generate` to generate the client once the first migration has been committed to the repository.

---

## 1. Table-by-Table Reference

### 1.1 `users`
- **Purpose**: Core entity representing a registered individual across all client applications.
- **Key Columns**:
  - `id`: UUID (Primary Key)
  - `role`: Enum `UserRole` (`USER`, `ADMIN`, `MODERATOR`)
  - `status`: Enum `AccountStatus` (`ACTIVE`, `SUSPENDED`, `DEACTIVATED`, `BANNED`)
  - `username`: Nullable unique string
  - `email`: Nullable unique string
  - `displayName`, `avatarUrl`: Profile metadata
  - `createdAt`, `updatedAt`: Timestamps with time zone (`timestamptz(6)`)
- **Foreign Key Actions**: Root record. Deletion cascades to owned user settings, auth accounts, verses, and streaks.

### 1.2 `auth_accounts`
- **Purpose**: Identity provider bindings for authentication (e.g. Telegram ID, Google OAuth, Email/Password).
- **Key Columns**:
  - `id`: UUID (Primary Key)
  - `userId`: Foreign key to `users.id` (`onDelete: Cascade`)
  - `provider`: Enum `AuthProvider` (`TELEGRAM`, `GOOGLE`, `EMAIL`, `PASSWORD`)
  - `providerUserId`: External unique identifier provided by the auth service (e.g. Telegram chat ID / user ID)
  - `passwordHash`: Argon2/bcrypt hash for password-based logins
  - `metadata`: JSON payload containing provider-specific profile claims
- **Constraints**:
  - Unique composite `(provider, providerUserId)`: Ensures an external account maps to only one account.
  - Unique composite `(userId, provider)`: Prevents multiple accounts of the exact same provider on a single user.

### 1.3 `user_settings`
- **Purpose**: User preferences and timezone alignment for streak calculations.
- **Key Columns**:
  - `id`: UUID (Primary Key)
  - `userId`: Unique foreign key to `users.id` (`onDelete: Cascade`)
  - `timezone`: IANA timezone string (default `"Africa/Addis_Ababa"`)
  - `dailyReminderTime`: String representation (e.g. `"20:00"`)
  - `reminderEnabled`: Boolean (default `true`)
  - `preferredLanguage`: Locale string (default `"en"`)

### 1.4 `verses`
- **Purpose**: User-submitted daily verse entries and reflections.
- **Key Columns**:
  - `id`: UUID (Primary Key)
  - `userId`: Foreign key to `users.id` (`onDelete: Cascade`)
  - `reference`: Scriptural reference string (e.g., `"Romans 8:28"`)
  - `text`: Text body of the verse
  - `reflection`: Optional commentary or personal prayer note
  - `visibility`: Enum `PostVisibility` (`PUBLIC`, `FRIENDS`, `PRIVATE`)
  - `postedAt`: Explicit submission timestamp (`timestamptz(6)`)

### 1.5 `streaks`
- **Purpose**: Aggregate streak tracker summarizing an individual's active and historical streak performance.
- **Key Columns**:
  - `id`: UUID (Primary Key)
  - `userId`: Unique foreign key to `users.id` (`onDelete: Cascade`)
  - `currentStreak`: Integer counter of consecutive completed days
  - `longestStreak`: Highest streak count achieved
  - `status`: Enum `StreakStatus` (`ACTIVE`, `BROKEN`, `RESTORED`, `FROZEN`)
  - `lastPostedAt`: Timestamp of the most recent qualifying post

### 1.6 `streak_days`
- **Purpose**: Immutable daily audit log recording each calendar day associated with a streak.
- **Key Columns**:
  - `id`: UUID (Primary Key)
  - `streakId`: Foreign key to `streaks.id` (`onDelete: Cascade`)
  - `userId`: Foreign key to `users.id` (`onDelete: Cascade`)
  - `verseId`: Nullable foreign key to `verses.id` (`onDelete: SetNull`)
  - `localDate`: Calendar date of the post relative to user timezone (`@db.Date`)
  - `status`: Enum `StreakDayStatus` (`COMPLETED`, `MISSED`, `RESTORED_FREE`, `RESTORED_PAID`, `FROZEN`)
- **Constraints**:
  - Unique composite `(userId, localDate)`: Prevents multiple streak days for the same user on the same calendar date.

### 1.7 `streak_breaks`
- **Purpose**: Dedicated tracking of broken streak events, grace windows, and restoration state lifecycles.
- **Key Columns**:
  - `id`: UUID (Primary Key)
  - `streakId`: Foreign key to `streaks.id` (`onDelete: Cascade`)
  - `userId`: Foreign key to `users.id` (`onDelete: Cascade`)
  - `missedDate`: The specific calendar date missed (`@db.Date`)
  - `streakCountBeforeBreak`: The streak count preserved for restoration
  - `status`: Enum `BreakStatus` (`ELIGIBLE_FREE`, `ELIGIBLE_PAID`, `PENDING_VERIFICATION`, `RESTORED`, `EXPIRED`, `REJECTED`)
  - `freeWindowExpiresAt`: Cutoff timestamp for free restoration (exactly missed date + 24 hours)
  - `paidWindowExpiresAt`: Cutoff timestamp for paid Telebirr restoration
  - `restoredAt`: Timestamp when restoration completed
  - `restorationMethod`: Enum `RestorationMethod` (`FREE_MANUAL`, `TELEBIRR_PAID`)
- **Constraints**:
  - Unique composite `(userId, missedDate)`: Guarantees one break record per missed date.

### 1.8 `streak_restoration_payments`
- **Purpose**: Financial ledger records for Telebirr payments submitted to restore an expired streak break.
- **Key Columns**:
  - `id`: UUID (Primary Key)
  - `breakId`: Foreign key to `streak_breaks.id` (`onDelete: Restrict`)
  - `userId`: Foreign key to `users.id` (`onDelete: Restrict`)
  - `amount`: Decimal value (`@db.Decimal(10, 2)`)
  - `currency`: ISO currency code (`"ETB"`)
  - `transactionReference`: Telebirr reference code (`@unique` in Prisma; case-insensitive functional unique index in PostgreSQL)
  - `payerPhone`: Customer phone number used for Telebirr transfer
  - `screenshotUrl`: Cloud storage path or URL to uploaded payment receipt screenshot
  - `reviewStatus`: Enum `PaymentReviewStatus` (`PENDING`, `APPROVED`, `REJECTED`)
  - `adminNotes`: Internal notes recorded by reviewing administrator
  - `reviewedByAdminId`: Nullable foreign key to `users.id` (`onDelete: SetNull`)
  - `reviewedAt`: Timestamp of review resolution
- **Foreign Key Behavior**:
  - Both `breakId` and `userId` use **`onDelete: Restrict`**. Financial and audit records must never be cascaded or orphaned if related operational rows are altered.

### 1.9 `notifications`
- **Purpose**: System alerts, daily verse reminders, and streak status updates delivered via in-app feeds or Telegram.
- **Key Columns**:
  - `id`: UUID (Primary Key)
  - `userId`: Foreign key to `users.id` (`onDelete: Cascade`)
  - `type`: Enum `NotificationType` (`STREAK_REMINDER`, `STREAK_BROKEN`, `PAYMENT_APPROVED`, `PAYMENT_REJECTED`, `SYSTEM`)
  - `status`: Enum `NotificationStatus` (`PENDING`, `SENT`, `FAILED`, `READ`)
  - `title`, `body`: Content fields
  - `data`: Optional structured JSON metadata (e.g. redirect links, break IDs)
  - `readAt`: Timestamp when marked as read

### 1.10 `sessions`
- **Purpose**: Active authentication sessions and refresh tokens for web and mobile clients.
- **Key Columns**:
  - `id`: UUID (Primary Key)
  - `userId`: Foreign key to `users.id` (`onDelete: Cascade`)
  - `tokenHash`: SHA-256 hashed refresh token (`@unique`)
  - `expiresAt`: Absolute expiration timestamp
  - `ipAddress`, `userAgent`: Audit and security tracking fields

---

## 2. Architectural Rationales

### 2.1 `users` vs `auth_accounts`
Decoupling identity from credentials allows a single user to maintain multiple sign-in methods seamlessly:
- A user can register via the Telegram Bot using their Telegram Chat ID.
- Later, the same user can open the Web App and link an email/password or Google OAuth account to the same profile.
- All streak progress, verse submissions, and payment records remain attached to the unified `User` record regardless of which front door the user entered through.

### 2.2 `streaks` vs `streak_days`
- `streaks` maintains instantaneous counters (`currentStreak`, `longestStreak`, `lastPostedAt`) for low-latency queries across the UI and Telegram bot commands (`/streak`).
- `streak_days` is an append-only daily journal representing each calendar day's participation. This preserves historical analytics, calendar heatmap rendering, and unambiguous audit proof of which verses satisfied which calendar dates.

### 2.3 `streak_breaks` as an Independent State Machine
A break is not merely a boolean flag on a user; it is a time-sensitive financial lifecycle:
- Day 0 (Missed): Break created in `ELIGIBLE_FREE` status; `freeWindowExpiresAt` set to 24 hours.
- Day 1 (Expired Free): Transition to `ELIGIBLE_PAID`; `paidWindowExpiresAt` calculated.
- Day 2 (Payment Submitted): Transition to `PENDING_VERIFICATION` upon Telebirr reference submission.
- Day 3 (Admin Action): Transition to `RESTORED` (streak count restored) or `REJECTED` (streak reset).
Separating this into `streak_breaks` prevents polluting the main `streaks` aggregate with temporal recovery metadata.

### 2.4 `streak_restoration_payments` Strict Integrity
Financial records require strict immutability and auditability:
- `onDelete: Restrict` ensures no accidental deletion of user accounts or breaks can wipe out payment transaction history.
- Telebirr receipts require manual human verification against the admin banking portal, requiring explicit reviewer assignment (`reviewedByAdminId`) and review timestamping.

---

## 3. Database Constraints Managed Outside Prisma Schema

Prisma Schema cannot natively express partial unique indexes (`WHERE` clause) or functional expression indexes (`LOWER()`). The following indexes will be added in a **follow-up raw SQL migration** coordinated by the Backend Lead:

```sql
-- 1. Enforce case-insensitive uniqueness on Telebirr transaction references:
CREATE UNIQUE INDEX idx_payments_tx_ref_ci 
  ON streak_restoration_payments (LOWER(transaction_reference));

-- 2. Enforce at most one OPEN break per user:
CREATE UNIQUE INDEX idx_streak_breaks_one_open_per_user 
  ON streak_breaks (user_id) 
  WHERE status IN ('ELIGIBLE_FREE', 'ELIGIBLE_PAID', 'PENDING_VERIFICATION');

-- 3. Enforce at most one PENDING payment review per break:
CREATE UNIQUE INDEX idx_payments_one_pending_per_break 
  ON streak_restoration_payments (break_id) 
  WHERE review_status = 'PENDING';

-- 4. Enforce at most one APPROVED payment per break:
CREATE UNIQUE INDEX idx_payments_one_approved_per_break 
  ON streak_restoration_payments (break_id) 
  WHERE review_status = 'APPROVED';
```
