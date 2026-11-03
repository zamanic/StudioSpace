import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Sign in",
  description: "Sign in to book a studio or manage your listings on StudioSpace.",
};

function AuthFallback() {
  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
      <div className="flex flex-col gap-5">
        <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
        <div className="h-12 w-full max-w-[16ch] animate-pulse rounded bg-muted" />
        <div className="h-4 w-full max-w-[40ch] animate-pulse rounded bg-muted" />
      </div>
      <div className="h-80 w-full max-w-[30rem] animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24">
      <Suspense fallback={<AuthFallback />}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
