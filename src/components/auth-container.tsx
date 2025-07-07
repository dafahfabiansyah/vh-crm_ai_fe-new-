"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LoginForm from "./login-form"
import RegisterForm from "./register-form"

export default function AuthContainer() {
  const [activeTab, setActiveTab] = useState("login")

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-border/50">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-foreground">Welcome</CardTitle>
        <CardDescription className="text-muted-foreground">Sign in to your account or create a new one</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="space-y-4">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register" className="space-y-4">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
