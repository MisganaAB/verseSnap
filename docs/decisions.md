# VerseSnap Architecture & Business Decisions

The following three core decisions must be reviewed and settled by the team before the end of Week 1 to unblock implementation of the streak restoration engine.

---

## Decision 1: Paid Restoration Pricing

- **Status**: OPEN (Requires confirmation by Product & Business lead)
- **Context**: Once the 24-hour free manual restoration window expires, users who wish to recover their broken streak must pay via Telebirr. We need to define the standardized restoration fee per broken streak event.
- **Options Considered**:
  1. **50 ETB flat fee** (Accessible, high volume, low friction for Ethiopian market).
  2. **100 ETB flat fee** (Higher perceived value on streaks, discourages breaking).
  3. **Tiered pricing based on streak length** (e.g. 50 ETB for streaks < 30 days, 100 ETB for streaks 30-100 days, 200 ETB for 100+ days).
- **Recommended Default**: **50 ETB flat fee**. Minimizes complexity in payment verification and aligns well with standard micro-transactions in Ethiopia.
- **Team Final Choice**:
  - *Agreed Price*: `[PENDING TEAM SIGN-OFF]`
  - *Sign-off Date*: `[YYYY-MM-DD]`
  - *Approved By*: `[Names]`

---

## Decision 2: Paid Restoration Eligibility Window

- **Status**: OPEN (Requires confirmation by Product lead)
- **Context**: After the initial 24-hour free manual restoration window expires, how long does the user have to initiate a paid restoration before the streak is permanently unrecoverable?
- **Options Considered**:
  1. **7 days (168 hours)** from missed date: Gives users a full week to notice, pay via Telebirr, and submit the reference.
  2. **3 days (72 hours)** from missed date: Higher urgency, keeps streak data fresh.
  3. **Indefinite (No expiry)**: Allows restoring months later as long as fee is paid.
- **Recommended Default**: **7 days (168 hours)** from missed date (`missedDate + interval '7 days'`). Strikes the right balance between user flexibility and preserving the psychological incentive of maintaining a streak.
- **Team Final Choice**:
  - *Agreed Window*: `[PENDING TEAM SIGN-OFF]`
  - *Sign-off Date*: `[YYYY-MM-DD]`
  - *Approved By*: `[Names]`

---

## Decision 3: Handling New Posts While Payment Review is PENDING

- **Status**: OPEN (Requires confirmation by Backend & Product leads)
- **Context**: Telebirr payments are verified manually by an admin. There may be a lag of several hours (or overnight) between when a user submits their transaction reference and when an admin approves it. If the user posts a daily verse today while their payment is still `PENDING`, how is their streak calculated?
- **Options Considered**:
  1. **Optimistic Parallel Streak + Reconciliation**: Allow the user to post today. Today's post begins an "interim active" streak count. When the admin approves the pending payment, the previous streak count is retroactively merged (e.g., Previous 15 + Interim 2 = 17). If rejected, the previous streak is lost and the interim streak continues from 2.
  2. **Frozen State (Posting Blocked)**: Block verse posting until the admin reviews the pending payment.
  3. **Current Streak Stays 0 Until Approval**: Allow posting, record the verse in `verses` and `streak_days`, but keep the visible active `currentStreak` at 0 until approval restores the prior count plus intervening days.
- **Recommended Default**: **Option 1 (Optimistic Parallel Streak + Reconciliation)**. Never penalize user engagement; allow daily verses to be submitted continuously. On admin approval, calculate `newCurrentStreak = streakCountBeforeBreak + consecutiveDaysPostedSinceBreak`.
- **Team Final Choice**:
  - *Agreed Behavior*: `[PENDING TEAM SIGN-OFF]`
  - *Sign-off Date*: `[YYYY-MM-DD]`
  - *Approved By*: `[Names]`
