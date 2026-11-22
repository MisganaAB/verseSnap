# VerseSnap Architecture Overview

VerseSnap is a single unified platform designed with **two front doors** (React Web App and Telegram Bot) served by **one central Express backend** and **one PostgreSQL database**.

---

## 1. System Topology

```
             ┌────────────────────────┐      ┌────────────────────────┐
             │     React Web App      │      │      Telegram Bot      │
             │   (React 18 + Vite)    │      │ (Telegram Webhook/Bot) │
             └───────────┬────────────┘      └───────────┬────────────┘
                         │                               │
                         │ HTTP / JSON (fetch)           │ HTTP / JSON (Webhook)
                         │                               │
                         ▼                               ▼
             ┌────────────────────────────────────────────────────────┐
             │                VerseSnap Express Backend               │
             │           Node.js 22 LTS (CommonJS, Express 5)         │
             │                                                        │
             │  ┌──────────────────────────────────────────────────┐  │
             │  │ Middleware: RequestID, Helmet, CORS, ErrorHandler │  │
             │  └────────────────────────┬─────────────────────────┘  │
             │                           │                            │
             │  ┌────────────────────────▼─────────────────────────┐  │
             │  │         API Routes (/api/v1/*, /health)          │  │
             │  └────────────────────────┬─────────────────────────┘  │
             │                           │                            │
             │  ┌────────────────────────▼─────────────────────────┐  │
             │  │            Service Layer (Business Logic)        │  │
             │  └────────────────────────┬─────────────────────────┘  │
             │                           │                            │
             │  ┌────────────────────────▼─────────────────────────┐  │
             │  │           Prisma ORM 6 (Data Access Layer)       │  │
             │  └────────────────────────┬─────────────────────────┘  │
             └───────────────────────────┼────────────────────────────┘
                                         │
                                         ▼
             ┌────────────────────────────────────────────────────────┐
             │                 PostgreSQL 16 Database                 │
             │   (Users, Auth, Verses, Streaks, Days, Breaks, Pay)    │
             └────────────────────────────────────────────────────────┘
```

---

## 2. The Three Non-Negotiable Rules

1. **All Business Logic Lives in Services**
   - Controllers and Route handlers only accept requests, validate input schemas using Zod, pass validated parameters to service functions, and return the standard JSON envelope.
   - Frontend components and Telegram webhook handlers contain zero domain logic (such as streak calculation, break evaluation, or payment validation).

2. **One Backend for All Clients**
   - The React Web App and the Telegram Bot interact with the exact same Express endpoints and business services.
   - Authentication strategies may originate from different providers (e.g. Telegram Login Widget vs email/session), but they link into the same `User` and `AuthAccount` architecture.

3. **The Database is the Source of Truth for Streaks**
   - Streak counters, break states, eligibility countdowns, and historical days are calculated from and persisted directly within the database.
   - Client clocks or local device storage are never trusted for date boundaries; all date evaluations use UTC stored in PostgreSQL `timestamptz(6)` and user-configured IANA timezones (e.g. `Africa/Addis_Ababa`) for localized calendar day grouping.

---

## 3. Data Model at a Glance

The domain model is structured into four core subsystems:

```
[Identity & Settings]
  User 1──* AuthAccount (Telegram, Google, Email)
  User 1──1 UserSettings (Timezone, Daily Reminders)
  User 1──* Session (Tokens & Devices)

[Content & Social]
  User 1──* Verse (Reference, Text, Reflection, Visibility)

[Streak Engine]
  User 1──1 Streak (Current streak, Longest streak, Status)
  Streak 1──* StreakDay (Daily record, linked to Verse, Status)
  Streak 1──* StreakBreak (Missed day tracking, Free/Paid windows)

[Financial & Administrative]
  StreakBreak 1──* StreakRestorationPayment (Telebirr tx ref, Amount, Admin review)
  User 1──* Notification (System, Reminder, Restoration status)
```
