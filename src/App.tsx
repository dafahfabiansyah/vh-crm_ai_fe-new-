import { Routes, Route, Navigate, useParams } from "react-router";
import { ProtectedRoute, PublicRoute } from "@/components/route";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import Dashboard from "@/pages/Dashboard";
import AIAgentsPage from "./pages/Ai-agentPage";
import HumanAgentsPage from "./pages/HumanAgent";
import NotFoundPage from "@/pages/NotFoundPage";
import ErrorBoundary from "@/components/ErrorBoundary";
import ConnectedPlatformsPage from "./pages/ConnectPlatforms";
import ContactsPage from "./pages/ContactPage";
import BillingPage from "./pages/BillingPage";
import CreatePipelinePage from "./pages/CreatePipeline";
import AIAgentDetailPage from "./pages/AiDetailPage";
import WhatsAppQRPage from "./pages/WhatsAppQRPage";
import PipelinePage from "./pages/PipelinePage";
import ProductPage from "./pages/ProductPage";
import TicketPage from "./pages/TicketPage";
import FlowSettingsPage from "./pages/FlowSettingsPage";
import SettingsPage from "./pages/SettingsPage";
// import DashboardPage from "@/pages/Dashboard";

// Wrapper component for AIAgentDetailPage to handle params
function AIAgentDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  return <AIAgentDetailPage agentId={id || ""} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        {/* <Route path="/" element={<DashboardPage/>} /> */}
        {/* Public Auth routes - redirect to dashboard if already authenticated */}
        <Route
          path="/auth/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        {/* Protected Dashboard routes - require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-agents"
          element={
            <ProtectedRoute>
              <AIAgentsPage />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/ai-agents/:id"
          element={
            <ProtectedRoute>
              <AIAgentDetailWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/human-agents"
          element={
            <ProtectedRoute>
              <HumanAgentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/connected-platforms"
          element={
            <ProtectedRoute>
              <ConnectedPlatformsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <ContactsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <BillingPage />
            </ProtectedRoute>
          }
        />{" "}
        <Route
          path="/pipeline/create"
          element={
            <ProtectedRoute>
              <CreatePipelinePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pipeline"
          element={
            <ProtectedRoute>
              <PipelinePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <TicketPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flow"
          element={
            <ProtectedRoute>
              <FlowSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/whatsapp/connect"
          element={
            <ProtectedRoute>
              <WhatsAppQRPage />
            </ProtectedRoute>
          }
        />
        {/* Settings Page */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        {/* 404 Not Found Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
