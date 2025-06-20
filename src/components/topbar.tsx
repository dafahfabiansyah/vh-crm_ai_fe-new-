"use client";

import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch } from "@/hooks/redux";
import { logout } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bell,
  HelpCircle,
  MessageCircle,
  ChevronDown,
  User,
  Settings,
  LogOut,
  CreditCard,
  Shield,
} from "lucide-react";
import type { TopbarProps } from "@/types";

export default function Topbar({
  user = {
    name: "User",
    email: "kapanpulang@gmail.com",
    plan: "Free",
  },
}: TopbarProps) {
  const [notifications] = useState(3); // Mock notification count
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    // Dispatch logout action to clear Redux state and localStorage
    dispatch(logout());
    // Redirect to login page
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="h-16 bg-background border-b border-border px-6 flex items-center justify-between">
      {/* Left Section - Status Alert */}
      <div className="flex items-center">
        <Alert className="border-green-200 bg-green-50 text-green-800 py-2 px-4 h-auto flex items-center">
          <Shield className="h-4 w-4 text-green-600 mr-2" />
          <AlertDescription className="text-sm font-medium">
            Anda sedang menggunakan paket standar
          </AlertDescription>
        </Alert>
      </div>

      {/* Center Section - Help Links */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Pusat Bantuan
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Bantuan via WA
        </Button>
      </div>

      {/* Right Section - Notifications & User Menu */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
                {notifications}
              </Badge>
            )}
          </Button>
        </div>

        {/* Online Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">Online</span>
          </div>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 py-1 h-auto"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {user.email}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0 bg-blue-100 text-blue-700 border-blue-200"
                  >
                    {user.plan}
                  </Badge>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
