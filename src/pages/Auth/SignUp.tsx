import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => (
  <div className="flex justify-center items-center w-full h-screen">
    <SignUp
      signInUrl="/sign-in"
      fallbackRedirectUrl="/analysis/morphological-vs-molecular"
    />
  </div>
);

export default SignUpPage;
