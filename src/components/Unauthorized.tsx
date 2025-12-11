import { useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/sign-in";
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
