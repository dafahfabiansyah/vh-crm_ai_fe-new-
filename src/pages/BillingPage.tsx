"use client";;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, MessageCircle, Shield } from "lucide-react";
import MainLayout from "@/main-layout";
import { pricingPlans } from "@/app/mock/data";



export default function BillingPage() {
//   const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [, setSelectedPlan] = useState<string | null>(null);

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    // Handle upgrade logic here
    console.log(`Upgrading to plan: ${planId}`);
  };
  const handleContactSupport = () => {
    // Handle contact support logic here
    console.log("Opening support chat...");
  };

  return (
    <MainLayout>
      <div className="p-3 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-xl font-bold text-foreground mb-1">
            Choose Your Plan
          </h1>
          <p className="text-xs text-muted-foreground max-w-xl mx-auto">
            Pilih paket yang sesuai dengan kebutuhan bisnis Anda. Mulai dengan
            trial gratis atau langsung berlangganan untuk akses penuh.
          </p>
        </div>{" "}
        {/* Current Plan Status */}
        <div className="mb-3">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">
                      Current Plan: Free
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Anda sedang menggunakan paket gratis dengan fitur terbatas
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-0.5">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>{" "}
        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-3 mb-4">
          {pricingPlans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 hover:shadow-md ${
                  plan.popular
                    ? "border-primary shadow-md scale-[1.01]"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        plan.popular ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <IconComponent
                        className={`h-4 w-4 ${
                          plan.popular
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-center mb-1">
                    <Badge
                      variant="outline"
                      className={`${plan.badgeColor} text-xs px-2 py-0.5`}
                    >
                      {plan.badge}
                    </Badge>
                  </div>

                  <CardTitle className="text-base font-bold text-foreground">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground leading-tight">
                    {plan.description}
                  </CardDescription>

                  <div className="mt-1">
                    <div className="text-xl font-bold text-foreground">
                      {plan.price}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {plan.period}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-1 px-4">
                  <div className="space-y-0.5">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full flex items-center justify-center ${
                            feature.included
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          <Check className="h-2 w-2" />
                        </div>
                        <span
                          className={`text-xs leading-tight ${
                            feature.included
                              ? "text-foreground"
                              : "text-muted-foreground line-through"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-1.5 pt-2 px-4 pb-3">
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    className={`w-full h-8 text-xs ${
                      plan.popular
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    }`}
                  >
                    {plan.id === "trial" ? "Start Free Trial" : "Upgrade Now"}
                  </Button>{" "}
                  <Button
                    variant="outline"
                    onClick={handleContactSupport}
                    className="w-full text-primary border-primary hover:bg-primary/10 h-7 text-xs"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Mau tanya dulu? kesini aja
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
