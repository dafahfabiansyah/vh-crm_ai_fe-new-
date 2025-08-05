"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { loginUser, clearError } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks";

// TypeScript declarations for Cloudflare Turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        callback?: (token: string) => void;
        'error-callback'?: (error: any) => void;
        'expired-callback'?: () => void;
      }) => string;
      remove: (element: HTMLElement) => void;
      reset: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { success } = useToast();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(undefined);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const turnstileWidgetRef = useRef<HTMLDivElement | null>(null);

  const turnstileSitekey = import.meta.env.VITE_TURNSTILE_SITEKEY || '';

  // Validate that turnstileSitekey is a string
  if (typeof turnstileSitekey !== 'string' || !turnstileSitekey) {
    console.error('Turnstile sitekey is missing or invalid:', turnstileSitekey);
  }

  useEffect(() => {
    let mounted = true;
    
    const loadAndRenderTurnstile = async () => {
      // Force remove semua script turnstile yang ada
      document.querySelectorAll('script[src*="turnstile"]').forEach(s => s.remove());
      
      // Clear window properties
      // @ts-ignore
      delete window.turnstile;
      // @ts-ignore
      delete window.onTurnstileLoad;
      
      return new Promise<void>((resolve) => {
        const script = document.createElement("script");
        script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?t=${Date.now()}`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          console.log("Fresh Turnstile script loaded");
          
          // Polling sampai turnstile API ready
          const checkTurnstile = () => {
            // @ts-ignore
            if (window.turnstile && turnstileWidgetRef.current && mounted) {
              try {
                // Clear existing content
                turnstileWidgetRef.current.innerHTML = '';
                
                // Render widget
                // @ts-ignore
                const widgetId = window.turnstile.render(turnstileWidgetRef.current, {
                  sitekey: turnstileSitekey,
                  callback: (token: string) => {
                    console.log("Turnstile success:", token);
                    if (mounted) setTurnstileToken(token);
                  },
                  'error-callback': (error: any) => {
                    console.error("Turnstile error:", error);
                    if (mounted) setErrors({ general: "CAPTCHA verification failed. Please try again." });
                  },
                  'expired-callback': () => {
                    console.log("Turnstile expired");
                    if (mounted) setTurnstileToken(undefined);
                  }
                });
                
                console.log("Turnstile widget rendered with ID:", widgetId);
                resolve();
              } catch (error) {
                console.error("Failed to render Turnstile:", error);
                setTimeout(checkTurnstile, 100);
              }
            } else {
              setTimeout(checkTurnstile, 100);
            }
          };
          
          checkTurnstile();
        };
        
        script.onerror = (error) => {
          console.error("Failed to load Turnstile script:", error);
          resolve();
        };
        
        document.head.appendChild(script);
      });
    };

    if (turnstileSitekey && turnstileWidgetRef.current) {
      loadAndRenderTurnstile();
    }

    return () => {
      mounted = false;
      // Cleanup on unmount
      // @ts-ignore
      if (window.turnstile && turnstileWidgetRef.current) {
        try {
          // @ts-ignore
          window.turnstile.remove(turnstileWidgetRef.current);
        } catch (error) {
          console.log("Cleanup error:", error);
        }
      }
    };
  }, [turnstileSitekey, turnstileKey]);

  // Optional: Reset Turnstile widget after logout
  useEffect(() => {
    // Listen for logout event (if you have a global logout event or Redux state)
    // Example: if (!isAuthenticated) setTurnstileKey((prev) => prev + 1);
    // You can implement this based on your app's logout logic
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (turnstileSitekey && !turnstileToken) {
      setErrors({ general: "Please complete the CAPTCHA challenge." });
      return;
    }

    // Clear any existing errors
    setErrors({});
    dispatch(clearError());

    try {
      const result = await dispatch(loginUser({
        email: formData.email,
        password: formData.password,
        turnstile_token: turnstileToken, // snake_case agar cocok dengan backend
      })).unwrap();

      // Login successful
      console.log("Login successful:", result);

      // Redirect to dashboard
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      setErrors({ general: error.message || "Login failed. Please try again." });
      // Reset Turnstile widget on login error
      setTurnstileKey((prev) => prev + 1);
      // setTurnstileToken(null);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      setErrors({ email: "Please enter your email address" });
      return;
    }

    // Clear errors
    setErrors({});
    
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate successful password reset
      success("Password reset link sent to your email!");
      setShowForgotPassword(false);
    } catch (error) {
      console.error("Password reset failed:", error);
      setErrors({ general: "Failed to send reset email. Please try again." });
    }
  };

  const handleInputChange =
    (field: keyof LoginFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  if (showForgotPassword) {
    return (
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Reset Password
          </h3>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a reset link
          </p>
        </div>
        {errors.general && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.general}</AlertDescription>
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
              className={`pl-10 ${
                errors.email ? "border-destructive" : "border-border"
              }`}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
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
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(errors.general || error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general || error}</AlertDescription>
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
            className={`pl-10 pr-10 ${
              errors.password ? "border-destructive" : "border-border"
            }`}
            disabled={isLoading}
            aria-describedby={errors.password ? "password-error" : undefined}
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
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive">
            {errors.password}
          </p>
        )}
      </div>

      {/* <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="text-sm text-secondary-foreground hover:text-foreground/80 underline"
        >
          Forgot password?
        </button>
      </div> */}

      {turnstileSitekey && (
        <div className="my-4 flex justify-center">
          <div
            key={turnstileKey}
            ref={turnstileWidgetRef}
            style={{ minHeight: '65px' }}
          ></div>
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
