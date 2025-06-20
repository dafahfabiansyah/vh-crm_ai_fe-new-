import { Routes, Route, Navigate } from "react-router";
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

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        
        {/* Auth routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        
        {/* Dashboard route */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ai-agents" element={<AIAgentsPage />} />
        <Route path="/human-agents" element={<HumanAgentsPage />} />

        <Route path="/connected-platforms" element={<ConnectedPlatformsPage/>} />
        <Route path="/contacts" element={<ContactsPage/>} />
        <Route path="/billing" element={<BillingPage/>} />
        <Route path="/pipeline/create" element={<CreatePipelinePage/>} />
        <Route path="/contacts" element={<Navigate to="/dashboard" replace />} />
        <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 Not Found Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
