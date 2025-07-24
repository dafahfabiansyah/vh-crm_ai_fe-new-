import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { AuthService } from "../services/authService";
import { getCurrentSubscription } from "../services/transactionService";

const ManagerBillingEnforcer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState<boolean>(false);

  useEffect(() => {
    getCurrentSubscription()
      .then((res) => {
        console.log('Subscription response:', res.data);
        if (res?.data && res.data.package_name) {
          setHasActiveSubscription(true);
        } else {
          setHasActiveSubscription(false);
        }
        setSubscriptionChecked(true);
      })
      .catch(() => {
        setHasActiveSubscription(false);
        setSubscriptionChecked(true);
      });
  }, []);

  useEffect(() => {
    const role = AuthService.getRoleFromToken();
    // Only redirect if manager, subscription check is done, and NOT subscribed
    if (role === "Manager" && subscriptionChecked && !hasActiveSubscription && location.pathname !== "/billing") {
      navigate("/billing", { replace: true });
    }
  }, [location.pathname, navigate, hasActiveSubscription, subscriptionChecked]);

  const role = AuthService.getRoleFromToken();
  if (role !== "Manager") return null;

  // Jika sudah berlangganan, jangan render apapun
  if (hasActiveSubscription) return null;

  // On /billing, do not render anything (modal handled in BillingPage)
  return null;
};

export default ManagerBillingEnforcer; 