# Forgot Password Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a forgot-password flow that emails a 15-minute reset link via Resend, with a backend token stored as a SHA-256 hash in MongoDB.

**Architecture:** User submits email → backend generates a random token, stores its SHA-256 hash + 15-min expiry in the User document, sends reset link via Resend → user clicks link → frontend reads token from URL → backend verifies hash, resets password, clears token fields.

**Tech Stack:** Node.js/Express backend, MongoDB/Mongoose, Resend email SDK, React frontend, React Router v6, Redux (existing auth state)

---

## File Map

### Backend (`E:/react/Blog Website/Blog-Backend/`)
| File | Change |
|------|--------|
| `src/models/user/index.js` | Add `resetPasswordToken` and `resetPasswordExpiry` fields |
| `src/controller/user/index.js` | Add `forgotPassword` and `resetPassword` exports |
| `src/routes/user.routes.js` | Add 2 new public routes |
| `src/services/email.js` | **Create** — Resend email service |
| `package.json` | Add `resend` dependency |

### Frontend (`E:/react/Blog Website/BlogWebsite/`)
| File | Change |
|------|--------|
| `src/services/auth.js` | Add `forgotPassword` and `resetPassword` methods |
| `src/components/ForgotPassword.jsx` | **Create** — forgot password form page |
| `src/components/ResetPassword.jsx` | **Create** — reset password form page |
| `src/components/index.js` | Export `ForgotPassword` and `ResetPassword` |
| `src/components/Login.jsx` | Add "Forgot password?" link |
| `src/main.jsx` | Add `/forgot-password` and `/reset-password` routes |

---

## Task 1: Install Resend and add email service (Backend)

**Files:**
- Modify: `E:/react/Blog Website/Blog-Backend/package.json`
- Create: `E:/react/Blog Website/Blog-Backend/src/services/email.js`

- [ ] **Step 1: Install resend package**

```bash
cd "E:/react/Blog Website/Blog-Backend"
npm install resend
```

Expected output: `added 1 package`

- [ ] **Step 2: Create email service**

Create `src/services/email.js`:

```js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetUrl = `https://blog-frontend-drab-five.vercel.app/reset-password?token=${resetToken}`;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: toEmail,
    subject: "Reset your password",
    html: `
      <p>You requested a password reset for your Islam & Science blog account.</p>
      <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:4px;">Reset Password</a>
      <p>If you did not request this, ignore this email — your password will not change.</p>
      <p>Link: ${resetUrl}</p>
    `,
  });

  if (error) {
    throw new Error(`Failed to send reset email: ${error.message}`);
  }
};

module.exports = { sendPasswordResetEmail };
```

- [ ] **Step 3: Verify file saved correctly**

```bash
cat "E:/react/Blog Website/Blog-Backend/src/services/email.js"
```

Expected: file content printed with no errors.

- [ ] **Step 4: Commit**

```bash
cd "E:/react/Blog Website/Blog-Backend"
git add src/services/email.js package.json package-lock.json
git commit -m "feat: add Resend email service for password reset"
```

---

## Task 2: Update User model with reset token fields (Backend)

**Files:**
- Modify: `E:/react/Blog Website/Blog-Backend/src/models/user/index.js`

- [ ] **Step 1: Add reset token fields to userSchema**

In `src/models/user/index.js`, add these two fields inside the `userSchema` definition, after the `refreshToken` field (line ~55):

```js
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
```

The `refreshToken` block looks like this — add the two new fields directly after it:

```js
    refreshToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
```

- [ ] **Step 2: Verify the model still loads**

```bash
cd "E:/react/Blog Website/Blog-Backend"
node -e "const User = require('./src/models/user/index'); console.log('User model OK');"
```

Expected: `User model OK`

- [ ] **Step 3: Commit**

```bash
git add src/models/user/index.js
git commit -m "feat: add resetPasswordToken and resetPasswordExpiry to User model"
```

---

## Task 3: Add forgotPassword and resetPassword controllers (Backend)

**Files:**
- Modify: `E:/react/Blog Website/Blog-Backend/src/controller/user/index.js`

- [ ] **Step 1: Add crypto import at the top of the controller**

At the very top of `src/controller/user/index.js`, add:

```js
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../../services/email");
```

- [ ] **Step 2: Add forgotPassword controller**

Append this function at the bottom of `src/controller/user/index.js`, before the last line (`exports.getAdminStats = ...` block ends, so add after the closing of that function):

```js
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Always return generic response to prevent email enumeration
  const genericResponse = () =>
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "If that email exists, a reset link has been sent."
        )
      );

  if (!email) return genericResponse();

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return genericResponse();

  // Generate raw token and its SHA-256 hash
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user.email, rawToken);
  } catch (err) {
    // Clear token if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to send reset email. Try again."));
  }

  return genericResponse();
});
```

- [ ] **Step 3: Add resetPassword controller**

Append this function directly after `forgotPassword`:

```js
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Token and new password are required."));
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Password must be at least 8 characters."));
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid or expired reset token."));
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password reset successfully."));
});
```

- [ ] **Step 4: Verify controller loads without errors**

```bash
cd "E:/react/Blog Website/Blog-Backend"
node -e "const ctrl = require('./src/controller/user/index'); console.log(Object.keys(ctrl));"
```

Expected output includes: `forgotPassword`, `resetPassword`

- [ ] **Step 5: Commit**

```bash
git add src/controller/user/index.js
git commit -m "feat: add forgotPassword and resetPassword controllers"
```

---

## Task 4: Add new routes (Backend)

**Files:**
- Modify: `E:/react/Blog Website/Blog-Backend/src/routes/user.routes.js`

- [ ] **Step 1: Import new controllers**

In `src/routes/user.routes.js`, update the destructured imports from the controller to include the two new functions:

```js
const {
    handleUserRegister,
    loginUser,
    logoutUser,
    getCurrentUser,
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    getAdminStats,
    forgotPassword,
    resetPassword
} = require("../controller/user/index");
```

- [ ] **Step 2: Add the two new public routes**

After the `router.route("/login").post(loginUser);` line, add:

```js
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
```

- [ ] **Step 3: Verify routes file loads**

```bash
cd "E:/react/Blog Website/Blog-Backend"
node -e "const r = require('./src/routes/user.routes'); console.log('Routes OK');"
```

Expected: `Routes OK`

- [ ] **Step 4: Add env vars to backend .env for local testing**

Add to `E:/react/Blog Website/Blog-Backend/.env`:

```
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
```

Get your API key from https://resend.com → API Keys → Create API Key (free account).

- [ ] **Step 5: Manually test forgot-password endpoint locally**

Start the backend:
```bash
npm run dev
```

In a new terminal, send a test request:
```bash
curl -X POST http://localhost:5000/api/v1/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-registered-email@example.com"}'
```

Expected response:
```json
{"statusCode":200,"data":null,"message":"If that email exists, a reset link has been sent.","success":true}
```

Check your inbox for the reset email.

- [ ] **Step 6: Commit**

```bash
git add src/routes/user.routes.js .env
git commit -m "feat: add forgot-password and reset-password routes"
```

- [ ] **Step 7: Add env vars to Vercel backend project**

In Vercel → `islam-science` (backend) project → Settings → Environment Variables, add:
- `RESEND_API_KEY` = your Resend API key
- `RESEND_FROM_EMAIL` = `onboarding@resend.dev`

Then redeploy the backend.

---

## Task 5: Add auth service methods (Frontend)

**Files:**
- Modify: `E:/react/Blog Website/BlogWebsite/src/services/auth.js`

- [ ] **Step 1: Add forgotPassword and resetPassword methods**

In `src/services/auth.js`, add these two methods inside the `AuthService` class, after the `logout()` method:

```js
  async forgotPassword(email) {
    try {
      const response = await this.api.post("/forgot-password", { email });
      return response.data;
    } catch (error) {
      console.log("AuthService :: forgotPassword :: error", error);
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const response = await this.api.post("/reset-password", {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.log("AuthService :: resetPassword :: error", error);
      throw error;
    }
  }
```

- [ ] **Step 2: Commit**

```bash
cd "E:/react/Blog Website/BlogWebsite"
git add src/services/auth.js
git commit -m "feat: add forgotPassword and resetPassword to AuthService"
```

---

## Task 6: Create ForgotPassword page (Frontend)

**Files:**
- Create: `E:/react/Blog Website/BlogWebsite/src/components/ForgotPassword.jsx`

- [ ] **Step 1: Create ForgotPassword.jsx**

```jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import authService from "../services/auth";
import Input from "./input";
import Button from "./Button";

function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
    } catch (error) {
      // Swallow error — always show generic message
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="border border-ink/10 p-8">
          <h1 className="font-serif text-2xl text-ink mb-2">Forgot Password</h1>
          <p className="font-sans text-sm text-ink/60 mb-6">
            Enter your email and we'll send you a reset link.
          </p>

          {submitted ? (
            <div className="space-y-4">
              <p className="font-sans text-sm text-ink bg-ink/5 border border-ink/10 p-4">
                If that email exists, a reset link has been sent. Check your inbox.
              </p>
              <Link
                to="/login"
                className="block text-center font-sans text-sm text-ink underline underline-offset-2"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-ink text-xs font-sans mt-1">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <Link
                to="/login"
                className="block text-center font-sans text-sm text-ink/60 underline underline-offset-2"
              >
                Back to login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
```

- [ ] **Step 2: Commit**

```bash
cd "E:/react/Blog Website/BlogWebsite"
git add src/components/ForgotPassword.jsx
git commit -m "feat: add ForgotPassword page"
```

---

## Task 7: Create ResetPassword page (Frontend)

**Files:**
- Create: `E:/react/Blog Website/BlogWebsite/src/components/ResetPassword.jsx`

- [ ] **Step 1: Create ResetPassword.jsx**

```jsx
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import authService from "../services/auth";
import Input from "./input";
import Button from "./Button";

function ResetPassword() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const newPassword = watch("newPassword");

  const onSubmit = async (data) => {
    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.resetPassword(token, data.newPassword);
      navigate("/login", { state: { message: "Password reset successfully. Please log in." } });
    } catch (err) {
      setError(
        err?.response?.data?.message || "Invalid or expired reset token."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="w-full max-w-md border border-ink/10 p-8 text-center space-y-4">
          <p className="font-sans text-sm text-ink">Invalid reset link.</p>
          <Link to="/forgot-password" className="font-sans text-sm text-ink underline underline-offset-2">
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="border border-ink/10 p-8">
          <h1 className="font-serif text-2xl text-ink mb-2">Reset Password</h1>
          <p className="font-sans text-sm text-ink/60 mb-6">
            Enter your new password below.
          </p>

          {error && (
            <div className="mb-4 p-3 border border-ink/20 bg-ink/5">
              <p className="font-sans text-sm text-ink">{error}</p>
              <Link to="/forgot-password" className="font-sans text-xs text-ink underline underline-offset-2">
                Request a new reset link
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                label="New Password"
                type="password"
                placeholder="Min 8 characters"
                {...register("newPassword", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" },
                  validate: {
                    hasUpperCase: (v) => /[A-Z]/.test(v) || "Must contain at least one uppercase letter",
                    hasNumber: (v) => /\d/.test(v) || "Must contain at least one number",
                    noWhitespace: (v) => !/^\s|\s$/.test(v) || "Cannot start or end with spaces",
                  },
                })}
              />
              {errors.newPassword && (
                <p className="text-ink text-xs font-sans mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: {
                    matchPassword: (v) => v === newPassword || "Passwords do not match",
                  },
                })}
              />
              {errors.confirmPassword && (
                <p className="text-ink text-xs font-sans mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
```

- [ ] **Step 2: Commit**

```bash
cd "E:/react/Blog Website/BlogWebsite"
git add src/components/ResetPassword.jsx
git commit -m "feat: add ResetPassword page"
```

---

## Task 8: Export new components and update Login (Frontend)

**Files:**
- Modify: `E:/react/Blog Website/BlogWebsite/src/components/index.js`
- Modify: `E:/react/Blog Website/BlogWebsite/src/components/Login.jsx`

- [ ] **Step 1: Check current index.js exports**

```bash
cat "E:/react/Blog Website/BlogWebsite/src/components/index.js"
```

- [ ] **Step 2: Add exports for ForgotPassword and ResetPassword**

Add these two lines to `src/components/index.js`:

```js
export { default as ForgotPassword } from "./ForgotPassword";
export { default as ResetPassword } from "./ResetPassword";
```

- [ ] **Step 3: Add "Forgot password?" link to Login.jsx**

In `src/components/Login.jsx`, find the password field block and add the link directly after the password error message. The link goes between the password field and the submit button:

```jsx
{errors.password && <p className="text-ink text-xs font-sans mt-1 mb-3">{errors.password.message}</p>}

<div className="text-right mb-4">
  <Link to="/forgot-password" className="font-sans text-xs text-ink/60 underline underline-offset-2">
    Forgot password?
  </Link>
</div>
```

Make sure `Link` is imported from `react-router-dom` at the top of Login.jsx. If it's not already imported, add it:

```js
import { Link, useNavigate } from "react-router-dom";
```

- [ ] **Step 4: Commit**

```bash
cd "E:/react/Blog Website/BlogWebsite"
git add src/components/index.js src/components/Login.jsx
git commit -m "feat: export forgot/reset password components, add forgot password link to login"
```

---

## Task 9: Add routes to React Router (Frontend)

**Files:**
- Modify: `E:/react/Blog Website/BlogWebsite/src/main.jsx`

- [ ] **Step 1: Import new pages**

At the top of `src/main.jsx`, add to the existing named imports from `./components/index.js`:

```js
import { AuthLayout, Login, Signup, ForgotPassword, ResetPassword } from "./components/index.js";
```

- [ ] **Step 2: Add routes to the router**

In the `children` array of the router, add these two routes after the `/signup` route:

```jsx
{
  path: "/forgot-password",
  element: (
    <AuthLayout authentication={false}>
      <ForgotPassword />
    </AuthLayout>
  ),
},
{
  path: "/reset-password",
  element: (
    <AuthLayout authentication={false}>
      <ResetPassword />
    </AuthLayout>
  ),
},
```

- [ ] **Step 3: Start dev server and verify routes work**

```bash
cd "E:/react/Blog Website/BlogWebsite"
npm run dev
```

Open browser:
- `http://localhost:3000/forgot-password` → should show the forgot password form
- `http://localhost:3000/reset-password?token=test` → should show the reset password form
- `http://localhost:3000/login` → should show "Forgot password?" link below the password field

- [ ] **Step 4: Commit**

```bash
git add src/main.jsx
git commit -m "feat: add forgot-password and reset-password routes to router"
```

---

## Task 10: Deploy and end-to-end test

- [ ] **Step 1: Push backend to GitHub**

```bash
cd "E:/react/Blog Website/Blog-Backend"
git push origin main
```

Vercel will auto-deploy. Wait ~1 minute.

- [ ] **Step 2: Push frontend to GitHub**

```bash
cd "E:/react/Blog Website/BlogWebsite"
git push origin main
```

Vercel will auto-deploy. Wait ~1 minute.

- [ ] **Step 3: End-to-end test**

1. Visit `https://blog-frontend-drab-five.vercel.app/login`
2. Click "Forgot password?" — should navigate to `/forgot-password`
3. Enter a registered email address → click "Send Reset Link"
4. Should see: *"If that email exists, a reset link has been sent."*
5. Check email inbox for reset link
6. Click the link → should open `/reset-password?token=...`
7. Enter new password + confirm → click "Reset Password"
8. Should redirect to `/login` 
9. Log in with the new password — should succeed

- [ ] **Step 4: Test expired token**

Wait 15 minutes and try to use the same reset link again. Should show: *"Invalid or expired reset token."*
