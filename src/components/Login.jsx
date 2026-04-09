import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../store/authSlice";
import { Button, Input, Logo } from "./index.js";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import authService from "../services/auth";

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const loginUser = async (data) => {
    setError("");
    setLoading(true);
    try {
      const session = await authService.login(data);
      if (session && session.data) {
        const userData = session.data.user;
        if (userData) {
          dispatch(login({ userData }));
          navigate("/");
        } else {
          setError("Login successful but user data not received. Please try again.");
        }
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center bg-paper py-12 px-4">
      <div className="w-full max-w-md bg-paper-white border-t-2 border-ink p-8 border border-rule">
        <h2 className="font-serif text-2xl font-bold text-ink mb-1">Sign In</h2>
        <p className="text-sm font-sans text-ink-faint mb-8">Welcome back</p>

        {error && (
          <div className="bg-paper-dark border border-rule text-ink px-4 py-3 mb-6 text-sm font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(loginUser)} className="space-y-2">
          <div>
            <Input
              label="Email"
              placeholder="your@email.com"
              type="email"
              {...register("email", {
                required: "Email is required",
                validate: {
                  matchPattern: (value) =>
                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                    "Please enter a valid email address",
                  noWhitespace: (value) => !value.includes(" ") || "Email cannot contain spaces",
                },
              })}
            />
            {errors.email && <p className="text-ink text-xs font-sans mt-1 mb-3">{errors.email.message}</p>}
          </div>
          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" },
                validate: {
                  noWhitespace: (value) => !/^\s|\s$/.test(value) || "Password cannot start or end with spaces",
                },
              })}
            />
            {errors.password && <p className="text-ink text-xs font-sans mt-1 mb-3">{errors.password.message}</p>}
          </div>
          <div className="pt-2">
            <Button type="submit" className="w-full justify-center" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm font-sans text-ink-faint">
          No account?{" "}
          <Link to="/signup" className="text-ink underline hover:text-ink-mid transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
