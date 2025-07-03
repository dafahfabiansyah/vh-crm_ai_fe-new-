import MainLayout from "@/main-layout"
import ChatDashboard from "@/components/chat-dashboard"
// import ErrorDemo from "@/components/ErrorDemo"

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <ChatDashboard />
        
        {/* Demo section untuk testing error boundary */}
        {/* <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Testing Area</h3>
          <ErrorDemo />
        </div> */}
      </div>
    </MainLayout>
  )
}
