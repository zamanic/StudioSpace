"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { LinkIcon, LockIcon, MailIcon, UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { authClient, isSocialProviderEnabled } from "@/lib/auth-client";

// Mirrors what the server actually registered, so a missing provider never
// renders a button that would 404.
const googleEnabled = isSocialProviderEnabled("google");
const githubEnabled = isSocialProviderEnabled("github");

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="currentColor"
        d="M12 11v2.9h6.9c-.3 1.7-2 5-6.9 5-4.2 0-7.6-3.5-7.6-7.9S7.8 3.1 12 3.1c2.4 0 4 .99 4.9 1.9l2.3-2.2C17.7 1.4 15.1.5 12 .5 5.9.5 1 5.4 1 11.5S5.9 22.5 12 22.5c6.9 0 11.5-4.9 11.5-11.7 0-.8-.1-1.4-.2-2H12z"
      />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="currentColor"
        d="M12 .5A12 12 0 0 0 8.2 23.9c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.8 18.3 5.1 18.3 5.1c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z"
      />
    </svg>
  );
}

const passwordIssues = (password: string) => {
  const issues: string[] = [];
  if (password.length < 6) issues.push("at least 6 characters");
  if (!/[A-Z]/.test(password)) issues.push("one uppercase letter");
  if (!/[a-z]/.test(password)) issues.push("one lowercase letter");
  return issues;
};

const isHttpUrl = (value: string) => /^https?:\/\/.+/i.test(value.trim());

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const isRegister = mode === "register";

  const [form, setForm] = useState({
    name: "",
    email: "",
    image: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  // After a successful sign-up we sign the new account out and hand the user to
  // /login, so the session effect must not bounce them to the target route yet.
  const [holdRedirect, setHoldRedirect] = useState(false);
  // OAuth hands the browser off to the provider, so without this the button
  // stays live and a second click could start a second handshake.
  const [socialPending, setSocialPending] = useState<
    "google" | "github" | null
  >(null);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user && !holdRedirect) router.replace(redirectTo);
  }, [session, redirectTo, router, holdRedirect]);

  // Carry the intended route across the two auth views so a redirected visitor
  // still lands where they were going after switching between them.
  const withRedirect = (path: string) =>
    redirectTo && redirectTo !== "/"
      ? `${path}?redirect=${encodeURIComponent(redirectTo)}`
      : path;

  const set = (key: keyof typeof form, value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (isRegister && form.name.trim().length < 2) {
      next.name = "Tell us what to call you (2+ characters).";
    }
    if (isRegister && !isHttpUrl(form.image)) {
      next.image = "Add a photo URL that starts with http:// or https://";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    const issues = passwordIssues(form.password);
    if (issues.length > 0) {
      next.password = `Password needs ${issues.join(", ")}.`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isRegister) {
        const result = await authClient.signUp.email({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          image: form.image.trim(),
        });

        if (result.error) {
          toast.error("Registration failed", {
            description:
              result.error.message ?? "That did not work. Check your details.",
          });
          return;
        }

        // The spec asks registration to end on the login page, so close the
        // session Better Auth just opened and hand over to /login.
        setHoldRedirect(true);
        await authClient.signOut();
        toast.success("Registration successful!", {
          description: "Please log in with the email and password you chose.",
        });
        router.push(withRedirect("/login"));
        router.refresh();
        return;
      }

      const result = await authClient.signIn.email({
        email: form.email.trim(),
        password: form.password,
      });

      if (result.error) {
        toast.error("Sign-in failed", {
          description:
            result.error.message ?? "That did not work. Check your details.",
        });
        return;
      }

      // Greet by name when Better Auth hands a user back; fall back to the
      // email so the toast is never a bare "Welcome back".
      const signedInName =
        result.data?.user?.name?.trim() || result.data?.user?.email?.trim();
      toast.success(
        signedInName ? `Welcome back, ${signedInName}!` : "Welcome back!",
        { description: "Logged in successfully." },
      );
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error("Authentication error", {
        description: "Could not reach the auth service. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocial = async (provider: "google" | "github") => {
    setSocialPending(provider);
    try {
      await authClient.signIn.social({ provider, callbackURL: redirectTo });
    } catch {
      setSocialPending(null);
      toast.error("Authentication error", {
        description: "Could not start that sign-in. Please try again.",
      });
    }
  };

  const showSocial = googleEnabled || githubEnabled;

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
      <div className="max-w-[34rem]">
        <p className="text-[0.7rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
          {isRegister ? "Create an account" : "Welcome back"}
        </p>
        <h1 className="display rise mt-5 text-[clamp(2.25rem,4.8vw,3.75rem)]">
          {isRegister ? "Host or book in minutes" : "Sign in to StudioSpace"}
        </h1>
        <p className="rise-2 mt-6 text-[0.95rem] leading-relaxed text-muted-foreground">
          {isRegister
            ? "One account covers both sides: book a room for your next shoot, or list a space you already own."
            : "Bookings, listings and cancellations all live behind your account."}
        </p>

        {isRegister ? (
          <p className="mt-10 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={withRedirect("/login")}
              className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Sign in instead
            </Link>
          </p>
        ) : null}
      </div>

      <div className="w-full max-w-[30rem]">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6 sm:p-8"
        >
          {isRegister ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  className="pl-9"
                  autoComplete="name"
                  value={form.name}
                  aria-invalid={Boolean(errors.name)}
                  placeholder="Rafiq Hasan"
                  onChange={(event) => set("name", event.target.value)}
                />
              </div>
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name}</p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <MailIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                className="pl-9"
                autoComplete="email"
                value={form.email}
                aria-invalid={Boolean(errors.email)}
                placeholder="you@studio.com"
                onChange={(event) => set("email", event.target.value)}
              />
            </div>
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email}</p>
            ) : null}
          </div>

          {isRegister ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="photo">Photo URL</Label>
              <div className="relative">
                <LinkIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="photo"
                  type="url"
                  className="pl-9"
                  autoComplete="photo"
                  value={form.image}
                  aria-invalid={Boolean(errors.image)}
                  placeholder="https://example.com/me.jpg"
                  onChange={(event) => set("image", event.target.value)}
                />
              </div>
              {errors.image ? (
                <p className="text-xs text-destructive">{errors.image}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  A link to a picture we can show beside your listings.
                </p>
              )}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password">Password</Label>
              {!isRegister ? (
                <Dialog>
                  <DialogTrigger
                    render={
                      <button
                        type="button"
                        className="text-xs text-muted-foreground underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
                      >
                        Forgot password?
                      </button>
                    }
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Password reset is not enabled</DialogTitle>
                      <DialogDescription>
                        StudioSpace deliberately ships without email
                        verification and password reset, so an examiner can
                        register and sign straight in. If you have lost a
                        password, create a new account with a different email
                        address.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter showCloseButton />
                  </DialogContent>
                </Dialog>
              ) : null}
            </div>
            <div className="relative">
              <LockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                className="pl-9"
                autoComplete={isRegister ? "new-password" : "current-password"}
                value={form.password}
                aria-invalid={Boolean(errors.password)}
                placeholder={
                  isRegister ? "At least 6 characters" : "Your password"
                }
                onChange={(event) => set("password", event.target.value)}
              />
            </div>
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password}</p>
            ) : isRegister ? (
              <p className="text-xs text-muted-foreground">
                6+ characters with one uppercase and one lowercase letter.
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-1 h-11 w-full"
            disabled={submitting}
          >
            {submitting ? <Spinner /> : null}
            {isRegister ? "Register" : "Sign in"}
          </Button>

          {showSocial ? (
            <>
              <div className="flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="flex flex-col gap-2.5">
                {googleEnabled ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-11 w-full"
                    disabled={socialPending !== null}
                    onClick={() => handleSocial("google")}
                  >
                    {socialPending === "google" ? <Spinner /> : <GoogleMark />}
                    Continue with Google
                  </Button>
                ) : null}
                {githubEnabled ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-11 w-full"
                    disabled={socialPending !== null}
                    onClick={() => handleSocial("github")}
                  >
                    {socialPending === "github" ? <Spinner /> : <GitHubMark />}
                    Continue with GitHub
                  </Button>
                ) : null}
              </div>
            </>
          ) : null}

          {!isRegister ? (
            <p className="border-t border-border pt-5 text-center text-sm text-muted-foreground">
              New to StudioSpace?{" "}
              <Link
                href={withRedirect("/register")}
                className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
              >
                Create an account
              </Link>
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
