# Forgot Password Feature — Design Spec

**Date:** 2026-04-09  
**Project:** Islam & Science Blog (Frontend + Backend)

---

## Overview

Add a forgot password flow that allows users to reset their password via a time-limited email link. The email is sent using Resend. The reset token is stored as a SHA-256 hash in MongoDB and expires after 15 minutes.

---

## Architecture

```
User clicks "Forgot Password"
  → Frontend: ForgotPassword page → POST /api/v1/users/forgot-password
  → Backend: generates token, hashes it, saves to User doc, sends email via Resend
  → User clicks link in email
  → Frontend: ResetPassword page (reads token from URL) → POST /api/v1/users/reset-password
  → Backend: verifies token hash, checks expiry, updates password, clears token
```

---

## Backend

### User Model Changes
Add two fields to `src/models/user/index.js`:
```js
resetPasswordToken: { type: String },
resetPasswordExpiry: { type: Date }
```

### New Controller Functions (`src/controller/user/index.js`)

**`forgotPassword`**
- Accept `email` from request body
- Find user by email
- If not found: return generic success response (do not reveal if email exists)
- Generate a cryptographically random 32-byte token (`crypto.randomBytes(32).toString('hex')`)
- Hash the token with SHA-256 (`crypto.createHash('sha256').update(token).digest('hex')`)
- Save hash + expiry (`Date.now() + 15 * 60 * 1000`) to User document
- Send email via Resend with reset link: `https://blog-frontend-drab-five.vercel.app/reset-password?token=<raw-token>`
- Return generic success message regardless of outcome

**`resetPassword`**
- Accept `token` and `newPassword` from request body
- Hash the incoming token with SHA-256
- Find user where `resetPasswordToken === hash` AND `resetPasswordExpiry > Date.now()`
- If not found: return 400 "Invalid or expired reset token"
- Update `password` to `newPassword` (pre-save hook handles hashing)
- Clear `resetPasswordToken` and `resetPasswordExpiry` fields
- Return 200 success

### New Routes (`src/routes/user.routes.js`)
```
POST /api/v1/users/forgot-password   → forgotPassword  (public, no auth)
POST /api/v1/users/reset-password    → resetPassword   (public, no auth)
```

### Dependencies
- Install `resend` npm package in backend
- No other new dependencies

### New Environment Variables (add to Vercel backend project)
| Name | Value |
|------|-------|
| `RESEND_API_KEY` | Your Resend API key from resend.com |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` (Resend default) or your verified domain |

---

## Frontend

### New Pages

**`src/components/ForgotPassword.jsx`**
- Single email input field
- On submit: `POST /api/v1/users/forgot-password`
- Always shows generic success message after submit: *"If that email exists, a reset link has been sent"*
- Link back to `/login`
- Styled with ink/paper design system matching Login page

**`src/components/ResetPassword.jsx`**
- Reads `token` from URL query params (`?token=...`)
- Two fields: New Password + Confirm Password
- Validation: min 8 chars, at least one uppercase, one number, no leading/trailing spaces (matches Signup rules)
- On submit: `POST /api/v1/users/reset-password` with `{ token, newPassword }`
- On success: redirect to `/login` with success message
- On error (expired/invalid token): show error with link back to `/forgot-password`
- Styled with ink/paper design system

### Login Page Change (`src/components/Login.jsx`)
- Add *"Forgot password?"* link below the password field
- Navigates to `/forgot-password`

### New Auth Service Methods (`src/services/auth.js`)
```js
forgotPassword(email)   // POST /users/forgot-password
resetPassword(token, newPassword)  // POST /users/reset-password
```

### New React Router Routes
```
/forgot-password  → <ForgotPassword />
/reset-password   → <ResetPassword />
```

---

## Security Considerations

- Raw token is only sent via email, never stored in DB — only its SHA-256 hash is stored
- Generic response on forgot-password prevents email enumeration attacks
- Token is single-use — cleared immediately after successful password reset
- Token expires after 15 minutes
- New password is hashed by the existing bcrypt pre-save hook

---

## Out of Scope

- Rate limiting on forgot-password endpoint
- Account lockout after multiple failed reset attempts
- Email verification on signup
