import { Routes, Route, Navigate } from "react-router";
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
// import DashboardPage from "@/pages/Dashboard";

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
        />
        <Route 
          path="/pipeline/create" 
          element={
            <ProtectedRoute>
              <CreatePipelinePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Legacy redirects */}
        <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 Not Found Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
