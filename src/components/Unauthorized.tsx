import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/sign-in");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
        Access Denied
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        You are not authorized to use this application. Please get permission
        from a super admin to be granted access.
      </p>
      <Button variant="destructive" onClick={handleLogout}>
        Log out
      </Button>
    </div>
  );
}
