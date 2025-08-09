"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import {
  Check,
  Shield,
  Users,
  Bot,
  Plus,
  Calendar,
  Clock,
  Star,
  Zap,
  Infinity,
  Crown,
  MessageSquare,
  UserCheck,
  Brain,
} from "lucide-react";
import MainLayout from "@/main-layout";
import { getSubscriptionPlans } from "@/services/subscriptionService";
import { createTransaction, getUsageTracking, getCurrentSubscription, getTransactionHistory } from "@/services/transactionService";
import ManagerBillingEnforcer from "@/components/manager-billing-enforcer";
import { useToast } from "@/hooks";

export default function BillingPage() {
  const [, setSelectedPlan] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("monthly");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [, setDiscountedPrice] = useState<string | null>(null);
  const [, setOriginalPrice] = useState<string | null>(null);
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isProcessingDialogOpen, setIsProcessingDialogOpen] = useState(false);
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);
  const [topUpType, setTopUpType] = useState<null | "mau" | "responses">(null);
  const { success, error: showError } = useToast();
  const [usageTracking, setUsageTracking] = useState<any>(null);
  const [, setLoadingUsage] = useState(true);
  const [, setUsageError] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [, setLoadingSubscription] = useState(true);
  const [, setSubscriptionError] = useState<string | null>(null);
  const [, setTransactions] = useState<any[]>([]);
  const [, setLoadingTransactions] = useState(true);
  const [, setTransactionsError] = useState<string | null>(null);

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

  const handlePayment = async () => {
    if (!selectedPlanData?.id) {
      showError("No plan selected");
      return;
    }
    try {
      setIsPaymentDialogOpen(false);
      setIsProcessingDialogOpen(true);
      await createTransaction({
        id_subscription: selectedPlanData.id,
        voucher: couponCode.trim() !== "" ? couponCode : undefined,
      });
      setCouponCode("");
      setTimeout(() => {
        setIsProcessingDialogOpen(false);
        success("Transaksi berhasil! Silakan cek status pembayaran Anda.");
      }, 1200);
    } catch (err) {
      setIsProcessingDialogOpen(false);
      showError("Gagal melakukan transaksi. Silakan coba lagi.");
    }
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
        success("Coupon applied successfully! Harga menjadi gratis.");
      } else {
        showError("Invalid plan price");
      }
    } else {
      showError("Invalid coupon code");
    }
  };

  // Mock data for dashboard cards
  const periods = [
    { id: "monthly", label: "Monthly", discount: null },
    { id: "3months", label: "3 Months", discount: "5% Discount" },
    { id: "halfyearly", label: "Half-Yearly", discount: "10% Discount" },
    { id: "yearly", label: "Yearly", discount: "20% Discount" },
  ];

  useEffect(() => {
    setLoadingPlans(true);
    getSubscriptionPlans()
      .then((data) => {
        setPricingPlans(data);
        setLoadingPlans(false);
      })
      .catch((err) => {
        console.log(err);
        setFetchError("Failed to fetch plans");
        setLoadingPlans(false);
      });
  }, []);

  useEffect(() => {
    setLoadingUsage(true);
    getUsageTracking()
      .then((res) => {
        setUsageTracking(res.data);
        setLoadingUsage(false);
      })
      .catch((err) => {
        console.log(err);
        setUsageError("Gagal mengambil data usage");
        setLoadingUsage(false);
      });
  }, []);

  useEffect(() => {
    setLoadingSubscription(true);
    getCurrentSubscription()
      .then((res) => {
        setCurrentSubscription(res.data);
        setLoadingSubscription(false);
      })
      .catch((err) => {
        console.log(err);
        setSubscriptionError("Gagal mengambil data subscription");
        setLoadingSubscription(false);
      });
  }, []);

  useEffect(() => {
    setLoadingTransactions(true);
    getTransactionHistory()
      .then((res) => {
        setTransactions(res.data);
        setLoadingTransactions(false);
      })
      .catch((err) => {
        console.log(err);
        setTransactionsError("Gagal mengambil data transaksi");
        setLoadingTransactions(false);
      });
  }, []);

  // Helper untuk format bulan
  function formatUsageMonth(dateStr: string) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("id-ID", { month: "long", year: "numeric" });
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }

  // Ganti dashboardData dengan data dari usageTracking jika ada
  const dashboardData = {
    packageDetails: {
      plan: currentSubscription?.package_name || "-",
      renewal:
        currentSubscription?.start_date && currentSubscription?.end_date
          ? `${formatDate(currentSubscription.start_date)} - ${formatDate(currentSubscription.end_date)}`
          : "-",
      status: "active",
      limit_token: currentSubscription?.limit_token ?? 0,
      limit_mau: currentSubscription?.limit_mau ?? 0,
    },
    monthlyUsers: {
      current: usageTracking?.current_mau ?? 0,
      limit: currentSubscription?.limit_mau ?? 0,
      additional: usageTracking?.additional_mau ?? 0,
      usageMonth: usageTracking?.usage_month ? formatUsageMonth(usageTracking.usage_month) : "-",
    },
    aiResponses: {
      used: usageTracking?.current_ai_response ?? 0,
      limit: currentSubscription?.limit_token ?? 0,
      resetDate: usageTracking?.usage_month ? formatUsageMonth(usageTracking.usage_month) : "-",
    },
    additionalResponses: {
      count: usageTracking?.additional_ai_response ?? 0,
      permanent: true,
    },
  };

  return (
    <MainLayout>
      {/* Aktifkan proteksi Manager ke Billing, bisa di-comment jika tidak diperlukan */}
      <ManagerBillingEnforcer />
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
                  // disabled
                  size="sm"
                  onClick={() => {location.href = "/profile"}}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full sm:w-auto text-xs"
                >
                  View History Transaction
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
                {/* <div className="text-xs sm:text-sm text-purple-100 mb-3">
                  Additional MAU: {dashboardData.monthlyUsers.additional}
                </div> */}
                <div className="flex gap-2 mb-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs"
                    onClick={() => {
                      setTopUpType("mau");
                      setIsTopUpDialogOpen(true);
                    }}
                  >
                    Top Up MAU
                  </Button>
                </div>
                {/* <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-200">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>Reset Setup Tanggal 1</span>
                </div> */}
              </CardContent>
            </Card>

            {/* AI Responses Card */}
            <Card className="bg-gradient-to-br from-primary to-emerald-700  text-white border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-xs sm:text-sm font-medium text-blue-100">
                      Token Tumbuhin
                    </CardTitle>
                    <h2 className="text-lg sm:text-xl font-bold mt-1">
                      {dashboardData.aiResponses.used.toLocaleString()} Used
                      <span className="text-xs sm:text-sm font-normal text-blue-200 ml-1 sm:ml-2 block sm:inline">
                        /{dashboardData.aiResponses.limit.toLocaleString()} {''}
                        Token Tumbuhin
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
                      Tumbuhin Additional Responses
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
                  onClick={() => {
                    setTopUpType("responses");
                    setIsTopUpDialogOpen(true);
                  }}
                >
                  Top Up Responses
                </Button>
                {/* <div className="flex items-center gap-2 text-xs sm:text-sm text-indigo-200">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>AI Responses Permanent</span>
                </div> */}
              </CardContent>
            </Card>
          </div>

          {/* Pricing Period Selector */}
          <div className="flex justify-center px-2">
            <div className="flex bg-muted rounded-lg p-1 w-full max-w-2xl overflow-x-auto">
              {periods.map((period) => (
                // <Button
                //   key={period.id}
                //   variant={selectedPeriod === period.id ? "default" : "ghost"}
                //   size="sm"
                //   onClick={() => setSelectedPeriod(period.id)}
                //   className="flex flex-col items-center gap-1 h-auto py-2 px-2 sm:px-4 min-w-0 flex-1"
                // >
                <Button
                  key={period.id}
                  variant={selectedPeriod === period.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() =>
                    period.id === "monthly" && setSelectedPeriod(period.id)
                  }
                  disabled={period.id !== "monthly"}
                  className="flex flex-col items-center gap-1 h-auto py-2 px-2 sm:px-4 min-w-0 flex-1"
                >
                  <span className="text-xs sm:text-sm font-medium truncate">
                    {period.label}
                  </span>
                  {period.discount && (
                    <span
                      className={
                        "text-xs truncate " +
                        (selectedPeriod === period.id
                          ? "text-white"
                          : "text-primary")
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
            {loadingPlans ? (
              <div className="col-span-4 text-center py-10">
                Loading plans...
              </div>
            ) : fetchError ? (
              <div className="col-span-4 text-center text-red-500 py-10">
                {fetchError}
              </div>
            ) : pricingPlans.length === 0 ? (
              <div className="col-span-4 text-center py-10">
                No plans available
              </div>
            ) : (
              pricingPlans.map((plan: any) => {
                // Pick an icon based on plan name or fallback
                let IconComponent = Users;
                if (plan.name?.toLowerCase().includes("pro"))
                  IconComponent = Shield;
                if (plan.name?.toLowerCase().includes("business"))
                  IconComponent = Crown;
                if (plan.name?.toLowerCase().includes("enterprise"))
                  IconComponent = Star;
                if (plan.name?.toLowerCase().includes("unlimited"))
                  IconComponent = Infinity;


                return (
                  <Card
                    key={plan.id}
                    className="relative transition-all duration-500 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col bg-white border border-border hover:border-primary/50 overflow-hidden group"
                  >
                    {/* Current Plan Badge */}
                    {currentSubscription?.package_name === plan.name && (
                      <div className="absolute top-3 left-3 z-10">
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Current
                        </div>
                      </div>
                    )}

                    <CardHeader className="text-center pb-3 sm:pb-4 relative">
                      <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center bg-muted shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
                        </div>
                      </div>

                      <CardTitle className="text-lg sm:text-xl font-bold text-foreground mb-2">
                        {plan.name}
                      </CardTitle>

                      <div className="mb-3">
                        {/* Show price for selected period or default to monthly */}
                        <div className="text-2xl sm:text-3xl font-bold text-foreground">
                          {(() => {
                            const billing = plan.billing?.find((b: any) => {
                              if (selectedPeriod === "monthly") return b.billing_period === 1;
                              if (selectedPeriod === "3months") return b.billing_period === 3;
                              if (selectedPeriod === "halfyearly") return b.billing_period === 6;
                              if (selectedPeriod === "yearly") return b.billing_period === 12;
                              return b.billing_period === 1;
                            });
                            if (billing) {
                              return `IDR ${billing.calculated_amount.toLocaleString()}`;
                            }
                            return `IDR ${plan.base_price?.toLocaleString?.() ?? "-"}`;
                          })()}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                          {(() => {
                            const billing = plan.billing?.find((b: any) => {
                              if (selectedPeriod === "monthly") return b.billing_period === 1;
                              if (selectedPeriod === "3months") return b.billing_period === 3;
                              if (selectedPeriod === "halfyearly") return b.billing_period === 6;
                              if (selectedPeriod === "yearly") return b.billing_period === 12;
                              return b.billing_period === 1;
                            });
                            if (billing) {
                              if (billing.billing_period === 1) return "/ month";
                              if (billing.billing_period === 3) return "/ 3 months";
                              if (billing.billing_period === 6) return "/ 6 months";
                              if (billing.billing_period === 12) return "/ year";
                            }
                            return "/ month";
                          })()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 italic">
                          {plan.description}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="px-4 sm:px-6 flex-1 relative pb-56">
                      {/* Features */}
                      <div className="space-y-3 mb-4">
                        <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-amber-500" />
                          Core Features
                        </div>
                        <div className="space-y-2">
                          {plan.features?.map((feature: { id: string; name: string }, featureIndex: number) => (
                            <div key={feature.id || featureIndex} className="flex items-center gap-3 group/feature">
                              <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 group-hover/feature:scale-110 transition-transform duration-200">
                                <Check className="h-3 w-3 text-blue-600 font-bold" />
                              </div>
                              <span className="text-sm text-foreground font-medium">
                                {feature.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Limits with engaging presentation - Absolute positioned */}
                      {plan.limits && (
                        <div className="absolute bottom-0 left-4 right-4 sm:left-6 sm:right-6">
                          <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Brain className="h-4 w-4 text-indigo-500" />
                            Usage Limits
                          </div>
                          <div className="grid gap-3">
                            {/* MAU Limit */}
                            <div className="bg-muted/50 rounded-lg p-3 border border-border">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <UserCheck className="h-4 w-4 text-blue-500" />
                                  <span className="text-xs font-medium text-muted-foreground">Monthly Active Users</span>
                                </div>
                                <div className={`text-lg font-bold ${plan.limits.mau === -1 ? 'text-indigo-600' : 'text-foreground'}`}>
                                  {plan.limits.mau === -1 ? (
                                    <div className="flex items-center gap-1">
                                      <Infinity className="h-4 w-4" />
                                      <span className="text-sm">Unlimited</span>
                                    </div>
                                  ) : (
                                    <span>{plan.limits.mau.toLocaleString()}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Human Agents Limit */}
                            <div className="bg-muted/50 rounded-lg p-3 border border-border">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-green-500" />
                                  <span className="text-xs font-medium text-muted-foreground">Human Agents</span>
                                </div>
                                <div className={`text-lg font-bold ${plan.limits.human_agent === -1 ? 'text-indigo-600' : 'text-foreground'}`}>
                                  {plan.limits.human_agent === -1 ? (
                                    <div className="flex items-center gap-1">
                                      <Infinity className="h-4 w-4" />
                                      <span className="text-sm">Unlimited</span>
                                    </div>
                                  ) : (
                                    <span>{plan.limits.human_agent}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* AI Response Limit */}
                            <div className="bg-muted/50 rounded-lg p-3 border border-border">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-purple-500" />
                                  <span className="text-xs font-medium text-muted-foreground">Token Tumbuhin</span>
                                </div>
                                <div className={`text-lg font-bold ${plan.limits.ai_response === -1 ? 'text-indigo-600' : 'text-foreground'}`}>
                                  {plan.limits.ai_response === -1 ? (
                                    <div className="flex items-center gap-1">
                                      <Infinity className="h-4 w-4" />
                                      <span className="text-sm">Unlimited</span>
                                    </div>
                                  ) : (
                                    <span>{plan.limits.ai_response.toLocaleString()}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4">
                      {currentSubscription?.package_name === plan.name ? (
                        <Button
                          disabled
                          className="w-full h-11 text-sm font-semibold bg-green-500 text-white cursor-not-allowed rounded-xl shadow-lg"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleUpgrade(plan.id)}
                          className={`w-full h-11 text-sm font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                            
                              'bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white'
                          }`}
                        >
                          Upgrade Now
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>

          {/* Transaction History
          <TransactionHistory
            transactions={transactions}
          /> */}
        </div>

        {/* Payment Dialog */}
        <Dialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-semibold">
                  Complete Your Payment
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPaymentDialogOpen(false)}
                  className="h-6 w-6 p-0"
                ></Button>
              </div>
            </DialogHeader>
            {selectedPlanData && (
              <div className="space-y-6">
                {/* Plan Details */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">
                    {selectedPlanData.name}
                  </h3>
                  <div className="space-y-1">
                    {isDiscountApplied &&
                    selectedPlanData.base_price !== undefined ? (
                      <>
                        <div className="text-lg font-medium text-muted-foreground line-through">
                          {`IDR ${selectedPlanData.base_price.toLocaleString()}`}
                        </div>
                        <div className="text-2xl font-bold text-foreground transition-opacity duration-300 opacity-100">
                          IDR 0
                        </div>
                      </>
                    ) : (
                      <div className="text-2xl font-bold text-foreground">
                        {selectedPlanData.base_price !== undefined
                          ? `IDR ${selectedPlanData.base_price.toLocaleString()}`
                          : "-"}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {(() => {
                      if (selectedPeriod === "monthly") return "/ month";
                      if (selectedPeriod === "3months") return "/ 3 months";
                      if (selectedPeriod === "halfyearly") return "/ 6 months";
                      if (selectedPeriod === "yearly") return "/ year";
                      return "/ month";
                    })()}{" "}
                    - {selectedPlanData.name} Package
                  </div>
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
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      className="px-6 bg-transparent"
                    >
                      APPLY
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsPaymentDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePayment}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Pay Now
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Processing Dialog - Cannot be dismissed */}
        <Dialog open={isProcessingDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-center">
                Akun anda sedang kami siapkan, anda bisa menutup halaman ini
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-center">
              {/* Optional: Spinner or info */}
            </div>
          </DialogContent>
        </Dialog>

        {/* Top Up Dialog */}
        <Dialog
          open={isTopUpDialogOpen}
          onOpenChange={(open) => {
            setIsTopUpDialogOpen(open);
            if (!open) setTopUpType(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {topUpType === "mau"
                  ? "Top Up Monthly Active Users (MAU)"
                  : topUpType === "responses"
                  ? "Top Up AI Responses"
                  : ""}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {topUpType === "mau" && (
                <div>
                  <p className="text-foreground mb-2">
                    Masukkan jumlah MAU tambahan yang ingin Anda beli.
                  </p>
                  <Input placeholder="Jumlah MAU" type="number" min={1000} step={1000}  />
                </div>
              )}
              {topUpType === "responses" && (
                <div>
                  <p className="text-foreground mb-2">
                    Masukkan jumlah AI Responses tambahan yang ingin Anda beli.
                  </p>
                  <Input placeholder="Jumlah Responses" type="number" min={5000} step={5000}  />
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsTopUpDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Top Up Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
