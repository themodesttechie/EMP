"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useActionState, useState } from "react";
import {
  signUpAction,
  signInWithAzureAction,
  type AuthState,
} from "@/app/(full-width-pages)/(auth)/actions";
import type { TenantAuthPolicy } from "@/lib/auth-policy";

export default function SignUpForm({ policy }: { policy: TenantAuthPolicy }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [state, formAction, pending] = useActionState<
    AuthState | undefined,
    FormData
  >(signUpAction, undefined);

  const passwordEnabled = policy.allow_password && !policy.require_aad;
  const aadEnabled = policy.allow_aad;

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
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
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {policy.require_aad
                ? `${policy.name} provisions accounts via Microsoft single sign-on. Continue with Microsoft below.`
                : aadEnabled
                ? "Sign up with Microsoft, or fill in the form to create an account."
                : "Enter your details to create an account."}
            </p>
          </div>

          {aadEnabled && (
            <form action={signInWithAzureAction} className="mb-5">
              <input type="hidden" name="tenant_slug" value={policy.slug} />
              <input type="hidden" name="next" value="/" />
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
                Continue with Microsoft
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
              <div className="space-y-5">
                <div>
                  <Label>
                    Full Name<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="full_name"
                    name="full_name"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <Label>
                    Workspace<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="tenant_slug"
                    name="tenant_slug"
                    placeholder={policy.slug}
                    defaultValue={policy.slug}
                    hint="Your organisation's unique slug. New workspaces auto-create on first signup."
                  />
                </div>
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      placeholder="Min. 8 characters"
                      type={showPassword ? "text" : "password"}
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
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    By creating an account you agree to the{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Terms and Conditions,
                    </span>{" "}
                    and our{" "}
                    <span className="text-gray-800 dark:text-white">
                      Privacy Policy
                    </span>
                  </p>
                </div>
                {state?.error && (
                  <div className="rounded-lg border border-error-500 bg-error-50 px-4 py-2.5 text-sm text-error-700 dark:bg-error-500/10 dark:text-error-400">
                    {state.error}
                  </div>
                )}
                {state?.ok && (
                  <div className="rounded-lg border border-success-500 bg-success-50 px-4 py-2.5 text-sm text-success-700 dark:bg-success-500/10 dark:text-success-400">
                    Check your email to verify your account, then sign in.
                  </div>
                )}
                <div>
                  <button
                    type="submit"
                    disabled={pending || !isChecked}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {pending ? "Creating account..." : "Sign Up"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {!passwordEnabled && (
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Password sign-up is disabled for {policy.name}. Use Microsoft single sign-on
              above, or contact your administrator to be invited.
            </p>
          )}

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Already have an account?{" "}
              <Link
                href={`/signin?tenant=${encodeURIComponent(policy.slug)}`}
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
