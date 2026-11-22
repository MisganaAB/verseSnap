# VerseSnap API Contracts & Envelopes

This document serves as the frozen specification for frontend mock development, contract testing, and backend endpoint implementation.

---

## 1. Global JSON Envelopes

Every API response emitted by VerseSnap complies with one of two standard envelopes.

### 1.1 Success Envelope

```json
{
  "success": true,
  "message": "Human readable success message",
  "data": { ... }
}
```

- `success`: Always boolean `true`.
- `message`: Descriptive message string summarizing the operation.
- `data`: Payload object, array, or `null`.

### 1.2 Error Envelope

```json
{
  "success": false,
  "message": "Human readable error summary",
  "errors": [
    {
      "field": "optional.field.path",
      "message": "Validation or contextual failure detail"
    }
  ]
}
```

- `success`: Always boolean `false`.
- `message`: High-level error summary.
- `errors`: Array of error items. For schema/input validation, `field` indicates the parameter path; for business errors, `field` is omitted or null.

---

## 2. Planned Endpoint Inventory (Paths Only)

### Health
- `GET /api/v1/health`

### Authentication & Identity
- `POST /api/v1/auth/telegram`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Verses & Reflections
- `POST /api/v1/verses`
- `GET /api/v1/verses/today`
- `GET /api/v1/verses/history`

### Streak Management & Restoration
- `GET /api/v1/streaks/me`
- `GET /api/v1/streaks/me/status`
- `POST /api/v1/streaks/restore/free`
- `POST /api/v1/streaks/restore/pay`

### Admin Management
- `GET /api/v1/admin/payments/pending`
- `POST /api/v1/admin/payments/:id/approve`
- `POST /api/v1/admin/payments/:id/reject`

---

## 3. Frozen Contract: `GET /api/v1/streaks/me/status`

This contract is frozen so frontend and bot developers can create mocks immediately.

### 3.1 Variant A: Active Streak (No Break)

```json
{
  "success": true,
  "message": "Streak status retrieved successfully",
  "data": {
    "userId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "streakId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "currentStreak": 14,
    "longestStreak": 30,
    "status": "ACTIVE",
    "hasPostedToday": true,
    "lastPostedAt": "2026-11-23T06:30:00.000Z",
    "break": null
  }
}
```

### 3.2 Variant B: Broken Streak with Active Break Object

```json
{
  "success": true,
  "message": "Streak status retrieved successfully",
  "data": {
    "userId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "streakId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "currentStreak": 0,
    "longestStreak": 30,
    "status": "BROKEN",
    "hasPostedToday": false,
    "lastPostedAt": "2026-11-21T07:15:00.000Z",
    "break": {
      "id": "e8a34241-e129-42b7-a38f-5c21964fcf81",
      "missedDate": "2026-11-22",
      "streakCountBeforeBreak": 14,
      "status": "ELIGIBLE_FREE",
      "freeWindowExpiresAt": "2026-11-23T23:59:59.000Z",
      "paidWindowExpiresAt": "2026-11-30T23:59:59.000Z",
      "pendingPayment": null
    }
  }
}
```

### 3.3 Variant C: Broken Streak in Paid Recovery with Pending Payment

```json
{
  "success": true,
  "message": "Streak status retrieved successfully",
  "data": {
    "userId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "streakId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "currentStreak": 0,
    "longestStreak": 30,
    "status": "BROKEN",
    "hasPostedToday": false,
    "lastPostedAt": "2026-11-20T07:15:00.000Z",
    "break": {
      "id": "e8a34241-e129-42b7-a38f-5c21964fcf81",
      "missedDate": "2026-11-21",
      "streakCountBeforeBreak": 14,
      "status": "PENDING_VERIFICATION",
      "freeWindowExpiresAt": "2026-11-22T23:59:59.000Z",
      "paidWindowExpiresAt": "2026-11-29T23:59:59.000Z",
      "pendingPayment": {
        "id": "f5c24e6a-74d1-4cb3-9fa7-2bc1d89e5a12",
        "amount": "50.00",
        "currency": "ETB",
        "transactionReference": "TB20261123987654",
        "reviewStatus": "PENDING",
        "submittedAt": "2026-11-23T01:10:00.000Z"
      }
    }
  }
}
```
