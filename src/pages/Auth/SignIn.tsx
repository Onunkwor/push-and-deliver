import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => (
  <div className="flex justify-center items-center w-full h-screen">
    <SignIn signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
  </div>
);

export default SignInPage;
