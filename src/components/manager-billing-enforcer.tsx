import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { AuthService } from "../services/authService";

const ManagerBillingEnforcer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const role = AuthService.getRoleFromToken();
    if (role === "Manager" && location.pathname !== "/billing") {
      navigate("/billing", { replace: true });
    }
  }, [location.pathname, navigate]);

  const role = AuthService.getRoleFromToken();
  if (role !== "Manager") return null;

  // On /billing, do not render anything (modal handled in BillingPage)
  return null;
};

export default ManagerBillingEnforcer; 