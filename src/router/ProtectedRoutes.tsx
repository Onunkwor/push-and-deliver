import { LoadingModal } from "@/components/shared/Loader";
import Unauthorized from "@/components/Unauthorized";
import { useCurrentUser } from "@/contexts/UserContext";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin } = useCurrentUser();
  const location = useLocation();

  if (loading) {
    return <LoadingModal />;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!isAdmin) {
    return <Unauthorized />;
  }

  // Define allowed routes for verifiers
  const verifierAllowedRoutes = ["/riders"];

  if (user.adminType === "verifier") {
    // If verifier is trying to access an allowed route, let them through
    if (verifierAllowedRoutes.includes(location.pathname)) {
      return <div>{children}</div>;
    }
    // Otherwise, redirect to riders page
    return <Navigate to="/riders" replace />;
  }

  return <div>{children}</div>;
};

export default ProtectedRoutes;
