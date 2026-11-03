import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [jwtClient()],
});

export const { signIn, signUp, signOut, updateUser, useSession } = authClient;

/**
 * Which social providers are actually registered on the server. Mirrored via
 * NEXT_PUBLIC_* flags so the auth forms never render a button for a provider
 * the server did not configure - that click would land on a 404.
 */
export type SocialProvider = "google" | "github";

export function isSocialProviderEnabled(provider: SocialProvider): boolean {
  if (provider === "google") {
    return process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";
  }
  return process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true";
}

export function getEnabledSocialProviders(): SocialProvider[] {
  return (["google", "github"] as const).filter(isSocialProviderEnabled);
}
