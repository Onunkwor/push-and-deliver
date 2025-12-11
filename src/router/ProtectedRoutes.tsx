import { LoadingModal } from "@/components/shared/Loader";
import Unauthorized from "@/components/Unauthorized";
import { useCurrentUser } from "@/contexts/UserContext";
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin } = useCurrentUser();

  if (loading) {
    return <LoadingModal />;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // Check if user is admin - assuming we still want this check since it was here before.
  // If the user meant to remove this check for some roles, they would have said so,
  // but they said "make it more than easy to work with the adminType as needed".
  // The existing code checked `isAdmin`. The user data has `isAdmin: true`.
  // If a user is not admin, they get Unauthorized.
  if (!isAdmin) {
    return <Unauthorized />;
  }

  return <div>{children}</div>;
};

export default ProtectedRoutes;
