import React from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { LoadingModal } from "@/components/shared/Loader";
import { useCurrentUser } from "@/contexts/UserContext";
import Unauthorized from "@/components/Unauthorized";

const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user, loading: userLoading, isAdmin } = useCurrentUser();
  const navigate = useNavigate();

  if (!isLoaded || userLoading) {
    return <LoadingModal />;
  }

  if (!isSignedIn) {
    navigate("/sign-in", { replace: true });
    return null;
  }

  // Check if user is admin
  if (user && !isAdmin) {
    return <Unauthorized />;
  }

  return <div>{children}</div>;
};

export default ProtectedRoutes;
