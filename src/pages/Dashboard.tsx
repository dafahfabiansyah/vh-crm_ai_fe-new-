import MainLayout from "@/main-layout"
import ChatDashboard from "@/components/chat-dashboard"
import ManagerDialog from "@/components/manager-dialog";
import ManagerBillingEnforcer from "@/components/manager-billing-enforcer";
// import ErrorDemo from "@/components/ErrorDemo"

export default function DashboardPage() {
  return (
    <MainLayout>
      {/* Aktifkan proteksi Manager ke Billing, bisa di-comment jika tidak diperlukan */}
      <ManagerBillingEnforcer />
      <div className="space-y-6">
        <ChatDashboard />
        <ManagerDialog />

        {/* Demo section untuk testing error boundary */}
        {/* <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Testing Area</h3>
          <ErrorDemo />
        </div> */}
      </div>
    </MainLayout>
  )
}
