"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { registerUser, clearError } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Building,
  Phone,
} from "lucide-react";
import type { RegisterFormData, FormErrors, PasswordStrength } from "@/types";

export default function RegisterForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error: authError, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    phoneNumber: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Clear auth error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const checkPasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("At least 8 characters");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One uppercase letter");
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One lowercase letter");
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("One number");
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One special character");
    }

    return { score, feedback };
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    } // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Business name validation (optional)
    if (formData.businessName && formData.businessName.length < 2) {
      newErrors.businessName = "Business name must be at least 2 characters";
    }

    // Phone number validation (optional)
    if (
      formData.phoneNumber &&
      !/^[\+]?[1-9][\d]{0,15}$/.test(
        formData.phoneNumber.replace(/[\s\-\(\)]/g, "")
      )
    ) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const strength = checkPasswordStrength(formData.password);
      if (strength.score < 3) {
        newErrors.password = "Password is too weak";
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms acceptance validation
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Clear any existing errors
    setErrors({});
    dispatch(clearError());

    try {
      // Create the request object according to API specification
      const registerData = {
        email: formData.email,
        password: formData.password,
        name: formData.username,
        business_name: formData.businessName || "",
        phone_number: formData.phoneNumber || "",
      };

      // Dispatch register action
      const result = await dispatch(registerUser(registerData));
      
      if (registerUser.fulfilled.match(result)) {
        // Registration successful, user will be redirected by useEffect
        console.log("Registration successful:", result.payload);
      } else {
        // Registration failed, error will be shown from authError
        console.error("Registration failed:", result.payload);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ general: "An unexpected error occurred. Please try again." });
    }
  };

  const handleInputChange =
    (field: keyof RegisterFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "acceptTerms"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const passwordStrength = checkPasswordStrength(formData.password);
  const strengthColors = [
    "bg-destructive",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(errors.general || authError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general || authError}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-foreground">
          Username
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="username"
            type="text"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleInputChange("username")}
            className={`pl-10 ${
              errors.username ? "border-destructive" : "border-border"
            }`}
            disabled={isLoading}
            aria-describedby={errors.username ? "username-error" : undefined}
          />
        </div>
        {errors.username && (
          <p id="username-error" className="text-sm text-destructive">
            {errors.username}
          </p>
        )}
      </div>{" "}
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
            className={`pl-10 ${
              errors.email ? "border-destructive" : "border-border"
            }`}
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
        <Label htmlFor="businessName" className="text-foreground">
          Business Name
        </Label>
        <div className="relative">
          <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="businessName"
            type="text"
            placeholder="Enter your business name"
            value={formData.businessName}
            onChange={handleInputChange("businessName")}
            className={`pl-10 ${
              errors.businessName ? "border-destructive" : "border-border"
            }`}
            disabled={isLoading}
            aria-describedby={
              errors.businessName ? "business-name-error" : undefined
            }
          />
        </div>
        {errors.businessName && (
          <p id="business-name-error" className="text-sm text-destructive">
            {errors.businessName}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phoneNumber" className="text-foreground">
          Phone Number
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phoneNumber}
            onChange={handleInputChange("phoneNumber")}
            className={`pl-10 ${
              errors.phoneNumber ? "border-destructive" : "border-border"
            }`}
            disabled={isLoading}
            aria-describedby={
              errors.phoneNumber ? "phone-number-error" : undefined
            }
          />
        </div>
        {errors.phoneNumber && (
          <p id="phone-number-error" className="text-sm text-destructive">
            {errors.phoneNumber}
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
            placeholder="Create a password"
            value={formData.password}
            onChange={handleInputChange("password")}
            className={`pl-10 pr-10 ${
              errors.password ? "border-destructive" : "border-border"
            }`}
            disabled={isLoading}
            aria-describedby={
              errors.password ? "password-error" : "password-strength"
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {formData.password && (
          <div id="password-strength" className="space-y-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded ${
                    i < passwordStrength.score
                      ? strengthColors[passwordStrength.score - 1]
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Strength:{" "}
                {strengthLabels[passwordStrength.score - 1] || "Very Weak"}
              </span>
              {passwordStrength.feedback.length > 0 && (
                <span className="text-muted-foreground">
                  Missing: {passwordStrength.feedback.join(", ")}
                </span>
              )}
            </div>
          </div>
        )}

        {errors.password && (
          <p id="password-error" className="text-sm text-destructive">
            {errors.password}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-foreground">
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange("confirmPassword")}
            className={`pl-10 pr-10 ${
              errors.confirmPassword ? "border-destructive" : "border-border"
            }`}
            disabled={isLoading}
            aria-describedby={
              errors.confirmPassword ? "confirm-password-error" : undefined
            }
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          {formData.confirmPassword &&
            formData.password === formData.confirmPassword && (
              <CheckCircle className="absolute right-10 top-3 h-4 w-4 text-green-500" />
            )}
        </div>
        {errors.confirmPassword && (
          <p id="confirm-password-error" className="text-sm text-destructive">
            {errors.confirmPassword}
          </p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={formData.acceptTerms}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              acceptTerms: checked as boolean,
            }))
          }
          disabled={isLoading}
          aria-describedby={errors.acceptTerms ? "terms-error" : undefined}
        />
        <Label
          htmlFor="terms"
          className="text-sm text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I accept the{" "}
          <button
            type="button"
            className="text-secondary hover:text-secondary/80 underline"
          >
            Terms and Conditions
          </button>{" "}
          and{" "}
          <button
            type="button"
            className="text-secondary hover:text-secondary/80 underline"
          >
            Privacy Policy
          </button>
        </Label>
      </div>
      {errors.acceptTerms && (
        <p id="terms-error" className="text-sm text-destructive">
          {errors.acceptTerms}
        </p>
      )}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
