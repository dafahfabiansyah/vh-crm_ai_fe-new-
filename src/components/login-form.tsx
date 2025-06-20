"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { loginUser, clearError } from "@/store/authSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react"
import type { LoginFormData, FormErrors } from "@/types"

export default function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { isLoading, error: authError, isAuthenticated } = useAppSelector((state) => state.auth)
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  // Clear auth error when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])
  // Redirect to dashboard or intended page if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Check if there's an intended redirect path from ProtectedRoute
      const intendedPath = (location.state as any)?.from || "/dashboard";
      navigate(intendedPath, { replace: true });
    }
  }, [isAuthenticated, navigate, location])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    // Clear any existing errors
    setErrors({})
    dispatch(clearError())

    try {
      // Create the request object according to API specification
      const loginData = {
        email: formData.email,
        password: formData.password,
      }

      // Dispatch login action
      const result = await dispatch(loginUser(loginData))
      
      if (loginUser.fulfilled.match(result)) {
        // Login successful, user will be redirected by useEffect
        console.log("Login successful:", result.payload)
      } else {
        // Login failed, error will be shown from authError
        console.error("Login failed:", result.payload)
      }
    } catch (error) {
      console.error("Login error:", error)
      setErrors({ general: "An unexpected error occurred. Please try again." })
    }
  }
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email) {
      setErrors({ email: "Please enter your email address" })
      return
    }

    // Clear errors
    setErrors({})
    dispatch(clearError())

    try {
      // TODO: Implement forgot password API call
      // For now, just simulate the process
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Password reset link sent to your email!")
      setShowForgotPassword(false)
    } catch (error) {
      console.error("Password reset failed:", error)  
      setErrors({ general: "Failed to send reset email. Please try again." })
    }
  }

  const handleInputChange = (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  if (showForgotPassword) {
    return (
      <form onSubmit={handleForgotPassword} className="space-y-4">        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Reset Password</h3>
          <p className="text-sm text-muted-foreground">Enter your email address and we'll send you a reset link</p>
        </div>

        {(errors.general || authError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.general || authError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="reset-email" className="text-foreground">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange("email")}
              className={`pl-10 ${errors.email ? "border-destructive" : "border-border"}`}
              disabled={isLoading}
            />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForgotPassword(false)}
            disabled={isLoading}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </div>
      </form>
    )
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(errors.general || authError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general || authError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange("email")}
            className={`pl-10 ${errors.email ? "border-destructive" : "border-border"}`}
            disabled={isLoading}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
        </div>
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange("password")}
            className={`pl-10 pr-10 ${errors.password ? "border-destructive" : "border-border"}`}
            disabled={isLoading}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive">
            {errors.password}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="text-sm text-secondary hover:text-secondary/80 underline"
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
}
