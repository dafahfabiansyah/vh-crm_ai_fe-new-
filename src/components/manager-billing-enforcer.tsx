import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { AuthService } from "../services/authService";
import { useAppSelector } from "@/hooks/redux";
// import { getCurrentSubscription } from "../services/transactionService"; // No longer needed

const ManagerBillingEnforcer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get subscription from Redux store
  const { subscription } = useAppSelector((state) => state.auth);
  const hasActiveSubscription = !!subscription;

  useEffect(() => {
    const role = AuthService.getRoleFromToken();
    // Only redirect if manager and NOT subscribed
    if (role === "Manager" && !hasActiveSubscription && location.pathname !== "/billing") {
      navigate("/billing", { replace: true });
    }
  }, [location.pathname, navigate, hasActiveSubscription]);

  const role = AuthService.getRoleFromToken();
  if (role !== "Manager") return null;

  // Jika sudah berlangganan, jangan render apapun
  if (hasActiveSubscription) return null;

  // On /billing, do not render anything (modal handled in BillingPage)
  return null;
};

export default ManagerBillingEnforcer;