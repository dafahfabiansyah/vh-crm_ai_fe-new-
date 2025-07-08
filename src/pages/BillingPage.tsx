"use client";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Shield,
  Users,
  Bot,
  Plus,
  TrendingUp,
  Calendar,
  CreditCard,
  FileText,
  Clock,
} from "lucide-react";
import MainLayout from "@/main-layout";

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("3months");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [isDiscountApplied, setIsDiscountApplied] = useState(false)
  const [discountedPrice, setDiscountedPrice] = useState<string | null>(null);
  const [originalPrice, setOriginalPrice] = useState<string | null>(null);

  // Mock pricing plans data
  const pricingPlans = [
    {
      id: "trial",
      name: "Free Trial",
      price: "IDR 0",
      period: "/ 14 days",
      icon: Users,
      popular: false,
      features: [
        { text: "5 MAU (Monthly Active Users)" },
        { text: "100 AI Responses" },
        { text: "Basic Support" },
        { text: "Email Integration" },
      ],
    },
    {
      id: "pro",
      name: "Pro Plan",
      price: "IDR 1,499,000",
      period: "/ month",
      icon: Shield,
      popular: false,
      features: [
        { text: "5 MAU (Monthly Active Users)" },
        { text: "100 AI Responses" },
        { text: "Basic Support" },
        { text: "Email Integration" },
      ],
    },
    {
      id: "business",
      name: "Business Plan",
      price: "IDR 3,609,050",
      period: "/ month",
      icon: Bot,
      popular: true,
     features: [
        { text: "5 MAU (Monthly Active Users)" },
        { text: "100 AI Responses" },
        { text: "Basic Support" },
        { text: "Email Integration" },
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "IDR 8,500,000",
      period: "/ month",
      icon: Users,
      popular: false,
      features: [
        { text: "5 MAU (Monthly Active Users)" },
        { text: "100 AI Responses" },
        { text: "Basic Support" },
        { text: "Email Integration" },
      ],
    },
  ];

  const handleUpgrade = (planId: string) => {
    const plan = pricingPlans.find((p) => p.id === planId);
    if (plan) {
      setSelectedPlan(planId);
      setSelectedPlanData(plan);
      setIsPaymentDialogOpen(true);
      setIsDiscountApplied(false);
      setDiscountedPrice(null);
      setOriginalPrice(null);
    }
  };

  const handlePayment = () => {
    console.log(`Processing payment for plan: ${selectedPlan}`);
    console.log(`Coupon code: ${couponCode}`);
    // Here you would typically integrate with your payment processor
    setIsPaymentDialogOpen(false);
    setCouponCode("");
  };

  const handleApplyCoupon = () => {
    // Simulasi apply coupon 100% (gratis)
    if (selectedPlanData && couponCode.trim() !== "") {
      // Ambil harga asli (angka saja)
      const priceStr = selectedPlanData.price.replace(/[^\d]/g, "");
      const priceNum = parseInt(priceStr, 10);
      if (!isNaN(priceNum)) {
        setOriginalPrice(selectedPlanData.price);
        setDiscountedPrice("IDR 0");
        setIsDiscountApplied(true);
        alert("Coupon applied successfully! Harga menjadi gratis.");
      } else {
        alert("Invalid plan price");
      }
    } else {
      alert("Invalid coupon code");
    }
  };


  // Mock data for dashboard cards
  const dashboardData = {
    packageDetails: {
      plan: "BUSINESS Plan",
      renewal: "Renewalt Automatically on 19 July 2025",
      status: "active",
    },
    monthlyUsers: {
      current: 1420,
      limit: 10000,
      additional: 0,
    },
    aiResponses: {
      used: 8168,
      limit: 25000,
      resetDate: "Reset Setup Tanggal 1",
    },
    additionalResponses: {
      count: -3,
      permanent: true,
    },
  };

  // Mock transaction data
  const transactions = [
    {
      id: 1,
      date: "2025-07-01",
      description: "Business Plan - Monthly Subscription",
      amount: "IDR 3,609,050",
      status: "paid",
      type: "subscription",
    },
    {
      id: 2,
      date: "2025-06-15",
      description: "Additional AI Responses - Top Up",
      amount: "IDR 500,000",
      status: "paid",
      type: "topup",
    },
    {
      id: 3,
      date: "2025-06-01",
      description: "Business Plan - Monthly Subscription",
      amount: "IDR 3,609,050",
      status: "paid",
      type: "subscription",
    },
    {
      id: 4,
      date: "2025-05-20",
      description: "Additional MAU - Top Up",
      amount: "IDR 750,000",
      status: "paid",
      type: "topup",
    },
    {
      id: 5,
      date: "2025-05-01",
      description: "Business Plan - Monthly Subscription",
      amount: "IDR 3,609,050",
      status: "pending",
      type: "subscription",
    },
  ];

  const periods = [
    { id: "monthly", label: "Monthly", discount: null },
    { id: "3months", label: "3 Months", discount: "5% Discount" },
    { id: "halfyearly", label: "Half-Yearly", discount: "10% Discount" },
    { id: "yearly", label: "Yearly", discount: "20% Discount" },
  ];

  return (
  <MainLayout>
      <div className="min-h-screen bg-background">
      <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Package Details Card */}
          <Card className="bg-gradient-to-br from-primary to-emerald-700  text-white border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-xs sm:text-sm font-medium text-cyan-100">
                    Package Details
                  </CardTitle>
                  <h2 className="text-lg sm:text-xl font-bold mt-1 truncate">
                    {dashboardData.packageDetails.plan}
                  </h2>
                </div>
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-200 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-100 mb-3">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">
                  {dashboardData.packageDetails.renewal}
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full sm:w-auto text-xs"
              >
                View Current Subscription
              </Button>
            </CardContent>
          </Card>

          {/* Monthly Active Users Card */}
          <Card className="bg-gradient-to-br from-primary to-emerald-700  text-white border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-xs sm:text-sm font-medium text-purple-100">
                    Monthly Active Users (Limit Tercapai)
                  </CardTitle>
                  <h2 className="text-lg sm:text-xl font-bold mt-1">
                    {dashboardData.monthlyUsers.current.toLocaleString()}
                    <span className="text-xs sm:text-sm font-normal text-purple-200 ml-1 sm:ml-2 block sm:inline">
                      /{dashboardData.monthlyUsers.limit.toLocaleString()} MAU
                    </span>
                  </h2>
                </div>
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-200 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs sm:text-sm text-purple-100 mb-3">
                Additional MAU: {dashboardData.monthlyUsers.additional}
              </div>
              <div className="flex gap-2 mb-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs"
                >
                  Top Up MAU
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-200">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Reset Setup Tanggal 1</span>
              </div>
            </CardContent>
          </Card>

          {/* AI Responses Card */}
          <Card className="bg-gradient-to-br from-primary to-emerald-700  text-white border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-xs sm:text-sm font-medium text-blue-100">
                    AI Responses
                  </CardTitle>
                  <h2 className="text-lg sm:text-xl font-bold mt-1">
                    {dashboardData.aiResponses.used.toLocaleString()} Used
                    <span className="text-xs sm:text-sm font-normal text-blue-200 ml-1 sm:ml-2 block sm:inline">
                      /{dashboardData.aiResponses.limit.toLocaleString()} AI
                      Responses Limit
                    </span>
                  </h2>
                </div>
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-blue-200 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-200 mb-3">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>{dashboardData.aiResponses.resetDate}</span>
              </div>
            </CardContent>
          </Card>

          {/* Additional AI Responses Card */}
          <Card className="bg-gradient-to-br from-primary to-emerald-700 text-white border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-xs sm:text-sm font-medium text-indigo-100">
                    Additional AI Responses
                  </CardTitle>
                  <h2 className="text-lg sm:text-xl font-bold mt-1">
                    {dashboardData.additionalResponses.count} Responses
                  </h2>
                </div>
                <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-200 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 mb-3 w-full sm:w-auto text-xs"
              >
                Top Up Responses
              </Button>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-indigo-200">
                <Check className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>AI Responses Permanent</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Period Selector */}
        <div className="flex justify-center px-2">
          <div className="flex bg-muted rounded-lg p-1 w-full max-w-2xl overflow-x-auto">
            {periods.map((period) => (
              <Button
                key={period.id}
                variant={selectedPeriod === period.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period.id)}
                className="flex flex-col items-center gap-1 h-auto py-2 px-2 sm:px-4 min-w-0 flex-1"
              >
                <span className="text-xs sm:text-sm font-medium truncate">
                  {period.label}
                </span>
                {period.discount && (
                  <span
                    className={
                      "text-xs truncate " +
                      (selectedPeriod === period.id ? "text-white" : "text-primary")
                    }
                  >
                    {period.discount}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {pricingPlans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 hover:shadow-md ${
                  plan.popular
                    ? "border-primary shadow-md scale-[1.02]"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-2 sm:px-3 py-1 text-xs">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-3 sm:pb-4">
                  <div className="flex justify-center mb-2">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                        plan.popular ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <IconComponent
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          plan.popular
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                  </div>

                  <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                    {plan.name}
                  </CardTitle>

                  <div className="mt-2">
                    <div className="text-xl sm:text-2xl font-bold text-foreground">
                      {plan.price}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {plan.period}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Quarterly Package
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-xs sm:text-sm font-medium text-foreground">
                      {plan.name} Features
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-4">
                  <div className="space-y-1 sm:space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Check className="h-2 w-2 sm:h-3 sm:w-3 text-blue-600" />
                        </div>
                        <span className="text-xs sm:text-sm text-foreground">
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-2 pt-3 sm:pt-4 px-3 sm:px-4 pb-3 sm:pb-4">
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    className={`w-full h-8 sm:h-9 text-xs sm:text-sm ${
                      plan.popular
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    }`}
                  >
                    {plan.id === "trial" ? "Start Free Trial" : "Upgrade Now"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Transaction History */}
        <div className="mt-6 sm:mt-8">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg font-semibold">
                    Transaction History
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Riwayat pembayaran dan transaksi Anda
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3 sm:gap-4"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          transaction.type === "subscription"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {transaction.type === "subscription" ? (
                          <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-foreground text-sm sm:text-base truncate">
                          {transaction.description}
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-0">
                      <div className="text-left sm:text-right">
                        <div className="font-semibold text-foreground text-sm sm:text-base">
                          {transaction.amount}
                        </div>
                        <Badge
                          variant={
                            transaction.status === "paid"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs mt-1"
                        >
                          {transaction.status === "paid" ? "Paid" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
       <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Complete Your Payment</DialogTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsPaymentDialogOpen(false)} className="h-6 w-6 p-0">
              {/* <X className="h-4 w-4" /> */}
            </Button>
          </div>
        </DialogHeader>
        {selectedPlanData && (
          <div className="space-y-6">
            {/* Plan Details */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">{selectedPlanData.name}</h3>
              <div className="space-y-1">
                {isDiscountApplied && originalPrice ? (
                  <>
                    <div className="text-lg font-medium text-muted-foreground line-through">
                      {originalPrice}
                    </div>
                    <div className="text-2xl font-bold text-foreground transition-opacity duration-300 opacity-100">
                      {discountedPrice}
                    </div>
                  </>
                ) : (
                  <div className="text-2xl font-bold text-foreground">{selectedPlanData.price}</div>
                )}
              </div>
              <div className="text-sm text-muted-foreground">IDR / mo - Monthly Package</div>
            </div>

            {/* Coupon Code Section */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan kode kupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={handleApplyCoupon} className="px-6 bg-transparent">
                  APPLY
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handlePayment} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                Pay Now
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </div>
  </MainLayout>
  );
}
