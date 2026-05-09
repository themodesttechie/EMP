"use client";
import { signOutAction } from "@/app/(full-width-pages)/(auth)/actions";
import { LogOut } from "lucide-react";
import { useTransition } from "react";

interface SignOutButtonProps {
  className?: string;
  showIcon?: boolean;
  label?: string;
}

export default function SignOutButton({
  className = "",
  showIcon = true,
  label = "Sign Out",
}: SignOutButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => signOutAction())}
      className={
        className ||
        "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 disabled:opacity-50"
      }
    >
      {showIcon && <LogOut size={16} />}
      {pending ? "Signing out..." : label}
    </button>
  );
}
