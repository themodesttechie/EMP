import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | ifBash",
  description: "Create an ifBash account",
};

export default function SignUp() {
  return <SignUpForm />;
}
