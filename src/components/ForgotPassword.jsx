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
