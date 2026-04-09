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
