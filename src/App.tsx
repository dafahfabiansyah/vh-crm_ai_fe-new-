import { Routes, Route, Navigate, useParams } from "react-router";
import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/redux";
import { syncWithCookies } from "@/store/authSlice";
import { ProtectedRoute, PublicRoute } from "@/components/route";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import Dashboard from "@/pages/Dashboard";
import AIAgentsPage from "./pages/AiAgentPage";
import HumanAgentsPage from "./pages/HumanAgent";
import NotFoundPage from "@/pages/NotFoundPage";
import ErrorBoundary from "@/components/error-boundary";
import ConnectedPlatformsPage from "./pages/ConnectPlatforms";
import ContactsPage from "./pages/ContactPage";
import BillingPage from "./pages/BillingPage";
import CreatePipelinePage from "./pages/CreatePipeline";
import AIAgentDetailPage from "./pages/AiDetailPage";
import WhatsAppQRPage from "./pages/WhatsAppQRPage";
import PipelinePage from "./pages/PipelinePage";
import ProductPage from "./pages/ProductPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import TicketPage from "./pages/TicketPage";
import FlowSettingsPage from "./pages/FlowSettingsPage";
import SettingsPage from "./pages/SettingsPage";
import ShippingIntegrationPage from "./pages/ShippingIntegrationPage";
import ApiIntegrationPage from "./pages/ApiIntegrationPage";
import CreateApiIntegrationPage from "./pages/CreateApiIntegrationPage";
import CustomIntegrationDetail from "./pages/CustomIntegrationDetail";
import EditCustomIntegration from "./pages/EditCustomIntegration";
import CreateWebchatPage from "./pages/CreateWebchatPage";
// import WebchatPage from "./pages/WebchatPage";
import { ToastProvider } from "@/contexts/ToastContext";
import { ToastContainer } from "@/components/ui/toast-container";
import { ProfilePage } from "./pages/ProfilePage";
// import CreateApiIntegrationPage from "./pages/CreateApiIntegrationPage";

import "./app.css"
import CSATPage from "./pages/CSATPage";

// Wrapper component for AIAgentDetailPage to handle params
function AIAgentDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  return <AIAgentDetailPage agentId={id || ""} />;
}

export default function App() {
  const dispatch = useAppDispatch();

  // Initialize auth from cookies when app loads
  useEffect(() => {
    // console.log("🚀 App initializing - syncing with cookies...");
    dispatch(syncWithCookies());
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Routes>
          {/* Redirect unauthenticated users to login */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          
          {/* Public Auth routes - redirect to dashboard if already authenticated */}
          <Route path="/auth" element={<PublicRoute />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
          
        {/* Protected routes - require authentication */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ai-agents" element={<AIAgentsPage />} />
          <Route path="ai-agents/:id" element={<AIAgentDetailWrapper />} />
          <Route path="integration/shipping" element={<ShippingIntegrationPage />} />
          {/* integration to API */}
          <Route path="integration/api">
            <Route index element={<ApiIntegrationPage />} />
            <Route path="create" element={<CreateApiIntegrationPage />} />
            <Route path=":id" element={<CustomIntegrationDetail />} />
            <Route path=":id/edit" element={<EditCustomIntegration />} />
          </Route>
          <Route path="human-agents" element={<HumanAgentsPage />} />
          <Route path="connected-platforms" element={<ConnectedPlatformsPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="pipeline/create" element={<CreatePipelinePage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="products" element={<ProductPage />} />
          <Route path="products/:id" element={<ProductDetailsPage />} />
          <Route path="tickets" element={<TicketPage />} />
          <Route path="flow" element={<FlowSettingsPage />} />
          {/* connecting platforms */}
          <Route path="connect">
            <Route path="whatsapp" element={<WhatsAppQRPage />} />
            <Route path="instagram" element={<WhatsAppQRPage />} />
            <Route path="webchat" element={<CreateWebchatPage />} />
          </Route>
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="csat" element={<CSATPage />} />
        </Route>
        {/* 404 Not Found Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer />
    </ToastProvider>
    </ErrorBoundary>
  );
}
