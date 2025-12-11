import React from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/contexts/UserContext";
import { LoadingModal } from "@/components/shared/Loader";

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return <LoadingModal />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
