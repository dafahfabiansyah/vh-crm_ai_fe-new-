import { useEffect, useState } from "react";
import { AuthService } from "@/services/authService";
import { getCurrentSubscription } from "@/services/transactionService";
import MainLayout from "@/main-layout"
import ChatDashboard from "@/components/chat-dashboard"
import ManagerDialog from "@/components/manager-dialog";
import ManagerBillingEnforcer from "@/components/manager-billing-enforcer";
// import ErrorDemo from "@/components/ErrorDemo"

export default function DashboardPage() {
  const [showManagerDialog, setShowManagerDialog] = useState(false);

  useEffect(() => {
    const role = AuthService.getRoleFromToken();
    if (role === "Manager") {
      getCurrentSubscription()
        .then((res) => {
          if (!res?.data || !res.data.package_name) {
            setShowManagerDialog(true);
          } else {
            setShowManagerDialog(false);
          }
        })
        .catch(() => {
          setShowManagerDialog(true);
        });
    }
  }, []);

  return (
    <MainLayout>
      {/* Aktifkan proteksi Manager ke Billing, bisa di-comment jika tidak diperlukan */}
      <ManagerBillingEnforcer />
      <div className="space-y-6">
        <ChatDashboard />
        {showManagerDialog && <ManagerDialog />}
        {/* Demo section untuk testing error boundary */}
        {/* <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Testing Area</h3>
          <ErrorDemo />
        </div> */}
      </div>
    </MainLayout>
  );
}
