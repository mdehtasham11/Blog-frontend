import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../store/authSlice'
import { Button, Input, Logo } from './index.js'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import authService from '../services/auth'

function Signup() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const { register, handleSubmit, formState: { errors }, watch } = useForm()
    const password = watch("password")

    const create = async (data) => {
        setError("")
        setLoading(true)
        try {
            const session = await authService.createAccount(data)
            if (session && session.data) {
                const userData = session.data.user
                if (userData) {
                    dispatch(login({ userData }))
                    navigate("/")
                } else {
                    setError("Account created but user data not received. Please try logging in.")
                }
            } else {
                setError("Account creation failed. Please try again.")
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || "Account creation failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full min-h-[70vh] flex items-center justify-center bg-paper py-12 px-4">
            <div className="w-full max-w-md bg-paper-white border-t-2 border-ink p-8 border border-rule">
                <h2 className="font-serif text-2xl font-bold text-ink mb-1">Create Account</h2>
                <p className="text-sm font-sans text-ink-faint mb-8">Join the community</p>

                {error && (
                    <div className="bg-paper-dark border border-rule text-ink px-4 py-3 mb-6 text-sm font-sans">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(create)} className="space-y-2">
                    <div>
                        <Input
                            label="Full Name"
                            placeholder="Your full name"
                            {...register("name", {
                                required: "Full name is required",
                                minLength: { value: 2, message: "Name must be at least 2 characters" },
                                maxLength: { value: 50, message: "Name cannot exceed 50 characters" },
                                validate: {
                                    noNumbers: (value) => !/\d/.test(value) || "Name cannot contain numbers",
                                    noSpecialChars: (value) => /^[a-zA-Z\s]+$/.test(value) || "Name can only contain letters and spaces",
                                    notOnlySpaces: (value) => value.trim().length > 0 || "Name cannot be only spaces"
                                }
                            })}
                        />
                        {errors.name && <p className="text-ink text-xs font-sans mt-1 mb-3">{errors.name.message}</p>}
                    </div>
                    <div>
                        <Input
                            label="Email"
                            placeholder="your@email.com"
                            type="email"
                            {...register("email", {
                                required: "Email is required",
                                validate: {
                                    matchPattern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) || "Please enter a valid email address",
                                    noWhitespace: (value) => !value.includes(' ') || "Email cannot contain spaces"
                                }
                            })}
                        />
                        {errors.email && <p className="text-ink text-xs font-sans mt-1 mb-3">{errors.email.message}</p>}
                    </div>
                    <div>
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Min. 8 characters"
                            {...register("password", {
                                required: "Password is required",
                                minLength: { value: 8, message: "Password must be at least 8 characters" },
                                validate: {
                                    hasUpperCase: (value) => /[A-Z]/.test(value) || "Password must contain at least one uppercase letter",
                                    hasLowerCase: (value) => /[a-z]/.test(value) || "Password must contain at least one lowercase letter",
                                    hasNumber: (value) => /\d/.test(value) || "Password must contain at least one number",
                                    noWhitespace: (value) => !/^\s|\s$/.test(value) || "Password cannot start or end with spaces"
                                }
                            })}
                        />
                        {errors.password && <p className="text-ink text-xs font-sans mt-1 mb-3">{errors.password.message}</p>}
                    </div>
                    <div>
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Repeat password"
                            {...register("confirmPassword", {
                                required: "Please confirm your password",
                                validate: {
                                    matchPassword: (value) => value === password || "Passwords do not match"
                                }
                            })}
                        />
                        {errors.confirmPassword && <p className="text-ink text-xs font-sans mt-1 mb-3">{errors.confirmPassword.message}</p>}
                    </div>
                    <div className="pt-2">
                        <Button type="submit" className="w-full justify-center" disabled={loading}>
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </Button>
                    </div>
                </form>

                <p className="mt-6 text-center text-sm font-sans text-ink-faint">
                    Already have an account?{" "}
                    <Link to="/login" className="text-ink underline hover:text-ink-mid transition-colors">Sign in</Link>
                </p>
            </div>
        </div>
    )
}

export default Signup
