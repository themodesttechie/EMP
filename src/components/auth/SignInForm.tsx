"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useActionState, useState } from "react";
import {
  signInAction,
  signInWithAzureAction,
  type AuthState,
} from "@/app/(full-width-pages)/(auth)/actions";
import type { TenantAuthPolicy } from "@/lib/auth-policy";

export default function SignInForm({ policy }: { policy: TenantAuthPolicy }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const errorParam = searchParams.get("error");
  const [state, formAction, pending] = useActionState<
    AuthState | undefined,
    FormData
  >(signInAction, undefined);

  const passwordEnabled = policy.allow_password && !policy.require_aad;
  const aadEnabled = policy.allow_aad;

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign in to {policy.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {policy.require_aad
                ? "Use your Microsoft work account to continue."
                : aadEnabled
                ? "Sign in with Microsoft, or use your email and password."
                : "Enter your email and password to sign in."}
            </p>
          </div>

          {aadEnabled && (
            <form action={signInWithAzureAction} className="mb-5">
              <input type="hidden" name="tenant_slug" value={policy.slug} />
              <input type="hidden" name="next" value={next} />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-3 w-full py-3 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                </svg>
                Sign in with Microsoft
              </button>
            </form>
          )}

          {passwordEnabled && aadEnabled && (
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Or
                </span>
              </div>
            </div>
          )}

          {passwordEnabled && (
            <form action={formAction}>
              <input type="hidden" name="next" value={next} />
              <input type="hidden" name="tenant_slug" value={policy.slug} />
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input name="email" placeholder="you@company.com" type="email" />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                {(state?.error || errorParam) && (
                  <div className="rounded-lg border border-error-500 bg-error-50 px-4 py-2.5 text-sm text-error-700 dark:bg-error-500/10 dark:text-error-400">
                    {state?.error || errorParam}
                  </div>
                )}
                <div>
                  <Button className="w-full" size="sm" disabled={pending}>
                    {pending ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {!passwordEnabled && errorParam && (
            <div className="rounded-lg border border-error-500 bg-error-50 px-4 py-2.5 text-sm text-error-700 dark:bg-error-500/10 dark:text-error-400">
              {errorParam}
            </div>
          )}

          {!passwordEnabled && (
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              {policy.name} only accepts Microsoft single sign-on. Contact your admin
              if you can&apos;t sign in.
            </p>
          )}

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Don&apos;t have an account?{" "}
              <Link
                href={`/signup?tenant=${encodeURIComponent(policy.slug)}`}
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
