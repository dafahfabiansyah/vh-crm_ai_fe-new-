import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  Calendar,
  Edit3,
  MessageSquare,
  Activity,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Building2 } from "lucide-react";
import MainLayout from "@/main-layout";
import { AuthService } from "@/services/authService";
import { useEffect } from "react";

export function ProfilePage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isManager] = React.useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [userRole, setUserRole] = React.useState<string | null>(null);

  // Get user role from token
  useEffect(() => {
    setUserRole(AuthService.getRoleFromToken());
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Rest of the component remains the same... */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1 flex flex-col space-y-6">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center ">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src="/professional-profile.png" />
                      <AvatarFallback className="bg-green-100 text-green-700 text-2xl font-semibold">
                        BB
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">Bobbeh</CardTitle>
                  <p className="text-gray-600">Customer Support Agent</p>
                  {/* {isManager && (
                  <p className="text-sm text-blue-600 font-medium">Manager</p>
                )} */}
                  {/* <div className="flex justify-center mt-3">
                  <Badge className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div> */}
                </CardHeader>
                <CardContent className="space-y-4">
                  <Dialog
                    open={isSettingsOpen}
                    onOpenChange={setIsSettingsOpen}
                  >
                    <DialogTrigger asChild>
                      {userRole === "Manager" && (
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Profile & Settings</DialogTitle>
                        <DialogDescription>
                          Manage your profile information, account settings, and
                          preferences.
                        </DialogDescription>
                      </DialogHeader>

                      <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="profile">Profile</TabsTrigger>
                          <TabsTrigger value="security">Security</TabsTrigger>
                          {/* <TabsTrigger value="account">Account</TabsTrigger> */}
                          {/* {isManager && <TabsTrigger value="business">Business</TabsTrigger>} */}
                        </TabsList>

                        {/* Profile Tab - New */}
                        <TabsContent value="profile" className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                Profile Information
                              </CardTitle>
                              <p className="text-sm text-gray-600">
                                Update your profile picture and basic
                                information.
                              </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* <div className="flex items-center space-x-4">
                              <Avatar className="w-20 h-20">
                                <AvatarImage src="/professional-profile.png" />
                                <AvatarFallback className="bg-green-100 text-green-700 text-xl font-semibold">
                                  BB
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-2">
                                <Button variant="outline" size="sm">
                                  Change Photo
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                  Remove Photo
                                </Button>
                              </div>
                            </div> */}

                              <div className="space-y-2">
                                <Label
                                  htmlFor="username"
                                  className="text-foreground"
                                >
                                  Username
                                </Label>
                                <Input
                                  id="username"
                                  type="text"
                                  placeholder="Pilih username Anda"
                                  defaultValue="Bobbeh"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="email"
                                  className="text-foreground"
                                >
                                  Email
                                </Label>
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder="Masukan Email anda"
                                  defaultValue="bobbeh@company.com"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="businessName"
                                  className="text-foreground"
                                >
                                  Business Name
                                </Label>
                                <Input
                                  id="businessName"
                                  type="text"
                                  placeholder="Masukan Nama Bisnis Anda"
                                  defaultValue="Tech Solutions Inc."
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="phoneNumber"
                                  className="text-foreground"
                                >
                                  Phone Number
                                </Label>
                                <Input
                                  id="phoneNumber"
                                  type="tel"
                                  placeholder="Masukan Nomor Telepon Anda"
                                  defaultValue="+62 851 1974 6973"
                                />
                              </div>

                              <Button className="w-full bg-green-600 hover:bg-green-700">
                                Update Profile
                              </Button>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security" className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                Change Password
                              </CardTitle>
                              <p className="text-sm text-gray-600">
                                Update your password to keep your account
                                secure.
                              </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="current-password">
                                  Current Password
                                </Label>
                                <div className="relative">
                                  <Input
                                    id="current-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter current password"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="new-password">
                                  New Password
                                </Label>
                                <div className="relative">
                                  <Input
                                    id="new-password"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() =>
                                      setShowNewPassword(!showNewPassword)
                                    }
                                  >
                                    {showNewPassword ? (
                                      <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="confirm-password">
                                  Confirm New Password
                                </Label>
                                <div className="relative">
                                  <Input
                                    id="confirm-password"
                                    type={
                                      showConfirmPassword ? "text" : "password"
                                    }
                                    placeholder="Confirm new password"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() =>
                                      setShowConfirmPassword(
                                        !showConfirmPassword
                                      )
                                    }
                                  >
                                    {showConfirmPassword ? (
                                      <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-sm text-yellow-800">
                                  <strong>Password Requirements:</strong>
                                </p>
                                <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                                  <li>• At least 8 characters long</li>
                                  <li>
                                    • Contains uppercase and lowercase letters
                                  </li>
                                  <li>• Contains at least one number</li>
                                  <li>
                                    • Contains at least one special character
                                  </li>
                                </ul>
                              </div>

                              <Button className="w-full bg-green-600 hover:bg-green-700">
                                Update Password
                              </Button>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">bobbeh@company.com</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">+62 800 000 000</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">Joined March 2023</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Building2 className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">bobsworkshop</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Assigned Cases</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      4
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Resolved Today</span>
                    <Badge variant="secondary">12</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Satisfaction Rate</span>
                    <span className="text-sm font-medium text-green-600">
                      98.5%
                    </span>
                  </div>
                  {isManager && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Team Members</span>
                      <span className="text-sm font-medium text-blue-600">
                        12
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Activity & Details */}
            <div className="lg:col-span-2 flex flex-col space-y-6">
              {/* Recent Activity */}
              <Card className="flex-1 min-h-[300px]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Resolved case for Mike Davis
                        </p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Assigned new case from Jhon doe
                        </p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Updated case status for Jane Smith
                        </p>
                        <p className="text-xs text-gray-500">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Completed training module
                        </p>
                        <p className="text-xs text-gray-500">4 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Agent in Your Department */}
              <Card className="flex-1 min-h-[300px]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                    Human Agent in Your Business
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1  overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                            JD
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">John Doe</p>
                          <p className="text-xs text-gray-500">
                            Lorem ipsum dolor sit amet...
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-600 hover:bg-green-700 text-xs">
                        active
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                            JS
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">Jane Smith</p>
                          <p className="text-xs text-gray-500">
                            Consectetur adipiscing elit...
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-600 hover:bg-green-700 text-xs">
                        active
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-sm">
                            MD
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">Mike Davis</p>
                          <p className="text-xs text-gray-500">
                            Sed do eiusmod tempor...
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-600 hover:bg-green-700 text-xs">
                        active
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-orange-100 text-orange-700 text-sm">
                            SJ
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">Sarah Johnson</p>
                          <p className="text-xs text-gray-500">
                            Incididunt ut labore et dolore...
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-600 hover:bg-green-700 text-xs">
                        active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
