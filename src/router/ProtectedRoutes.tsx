import { LoadingModal } from "@/components/shared/Loader";
import { useAuth } from "@clerk/clerk-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  if (!isLoaded) {
    return <LoadingModal />;
  }
  if (!isSignedIn) {
    navigate("/sign-in", { replace: true });
  }
  return <div>{children}</div>;
};

export default ProtectedRoutes;
