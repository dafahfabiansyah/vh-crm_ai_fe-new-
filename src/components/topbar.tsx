"use client";

import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch } from "@/hooks/redux";
import { logout } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import type { TopbarProps } from "@/types";

// Mock notification data
const mockNotifications = [
  {
    id: "1",
    title: "WhatsApp Message Received",
    message: "New message from customer +628123456789",
    type: "info" as const,
    timestamp: "2 minutes ago",
    isRead: false,
  },
  {
    id: "2",
    title: "AI Agent Response",
    message: "AI Agent successfully handled customer inquiry",
    type: "success" as const,
    timestamp: "5 minutes ago",
    isRead: false,
  },
  {
    id: "3",
    title: "System Alert",
    message: "WhatsApp connection status updated",
    type: "warning" as const,
    timestamp: "10 minutes ago",
    isRead: false,
  },
  {
    id: "4",
    title: "New Customer Registration",
    message: "A new customer has registered on your platform",
    type: "info" as const,
    timestamp: "15 minutes ago",
    isRead: true,
  },
  {
    id: "5",
    title: "Agent Assignment",
    message: "Human agent assigned to conversation #12345",
    type: "success" as const,
    timestamp: "30 minutes ago",
    isRead: true,
  },
];

export default function Topbar({
  user = {
    name: "User",
    email: "kapanpulang@gmail.com",
    plan: "Free",
  },
}: TopbarProps) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [helpForm, setHelpForm] = useState({
    title: "",
    description: "",
    priority: "",
    tags: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate unread notifications count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    // Dispatch logout action to clear Redux state and localStorage
    dispatch(logout());
    // Redirect to login page
    navigate("/auth/login", { replace: true });
  };

  const handleNotificationClick = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleHelpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Help ticket submitted:", helpForm);

      // Reset form and close modal
      setHelpForm({
        title: "",
        description: "",
        priority: "",
        tags: [],
      });
      setIsHelpModalOpen(false);

      // Show success message (you can replace with a toast notification)
      alert("Pengaduan berhasil dikirim!");
    } catch (error) {
      console.error("Error submitting help ticket:", error);
      alert("Gagal mengirim pengaduan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setHelpForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTagToggle = (tag: string) => {
    setHelpForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  return (
    <div className="h-16 bg-background border-b border-border px-6 flex items-center justify-between">
      {/* Left Section - Status Alert */}
      <div className="flex items-center">
        <Alert className="border-green-200 bg-green-50 text-green-800 py-2 px-4 h-auto">
          <div className="flex items-center">
            <Shield className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
            <AlertDescription className="text-sm font-medium">
              Anda sedang menggunakan paket standar
            </AlertDescription>
          </div>
        </Alert>
      </div>

      {/* Center Section - Help Links */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          onClick={() => setIsHelpModalOpen(true)}
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs h-auto p-1"
                >
                  Mark all as read
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`p-3 cursor-pointer ${
                      !notification.isRead
                        ? "bg-blue-50 border-l-4 border-l-primary"
                        : ""
                    }`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground truncate">
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {notification.timestamp}
                            </span>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center justify-center">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View all notifications
                  </Button>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

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
            </DropdownMenuItem>{" "}
            <DropdownMenuSeparator />
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

      {/* Help Modal */}
      <Dialog open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-blue-600">Pusat Bantuan</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600 mb-6">
            Silakan isi judul dan deskripsi pengaduan Anda
          </p>

          <form onSubmit={handleHelpSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Masalah Utama *</Label>
              <Input
                id="title"
                placeholder="Masalah Utama *"
                value={helpForm.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Deskripsi masalah *</Label>
              <Textarea
                id="description"
                placeholder="Deskripsi masalah *"
                value={helpForm.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Prioritas</Label>
                <Select
                  value={helpForm.priority}
                  onValueChange={(value) =>
                    handleInputChange("priority", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Prioritas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">
                    {helpForm.tags.length} Selected
                  </div>
                  <div className="space-y-1">
                    {["AI Agent", "Chat", "Connect Platform"].map((tag) => (
                      <label
                        key={tag}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={helpForm.tags.includes(
                            tag.toLowerCase().replace(" ", "-")
                          )}
                          onChange={() =>
                            handleTagToggle(tag.toLowerCase().replace(" ", "-"))
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsHelpModalOpen(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting || !helpForm.title || !helpForm.description
                }
                className="flex-1"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Pengaduan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
