import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

// Better Auth shares the same Atlas cluster as the Express API but keeps its
// own collections (user / session / account) inside the "studiospace" db.
// The fallback URI only exists so importing this module during a build without
// a .env cannot throw inside the MongoClient constructor.
const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.BETTER_AUTH_DB_URL ||
  "mongodb://127.0.0.1:27017/studiospace";

const client = new MongoClient(MONGODB_URI);
const db = client.db("studiospace");

// A provider is only registered when BOTH halves of its credential pair are
// present, so a half-filled .env cannot crash the auth route.
const googleCredentials =
  process.env.BETTER_AUTH_GOOGLE_CLIENT_ID && process.env.BETTER_AUTH_GOOGLE_SECRET
    ? {
        clientId: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.BETTER_AUTH_GOOGLE_SECRET,
      }
    : null;

const githubCredentials =
  process.env.BETTER_AUTH_GITHUB_CLIENT_ID && process.env.BETTER_AUTH_GITHUB_SECRET
    ? {
        clientId: process.env.BETTER_AUTH_GITHUB_CLIENT_ID,
        clientSecret: process.env.BETTER_AUTH_GITHUB_SECRET,
      }
    : null;

const socialProviders = {
  ...(googleCredentials ? { google: googleCredentials } : {}),
  ...(githubCredentials ? { github: githubCredentials } : {}),
};

export const auth = betterAuth({
  // The OAuth callback Google/GitHub are told to return to is derived from this
  // value (BETTER_AUTH_URL/api/auth/callback/<provider>), so it must match the
  // redirect URI registered in each provider's console exactly.
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: mongodbAdapter(db, { client }),
  // No email verification and no forgot-password on purpose: the brief keeps
  // examiner testing to a plain email + password sign-up.
  emailAndPassword: { enabled: true },
  ...(googleCredentials || githubCredentials ? { socialProviders } : {}),
  // Because this app never verifies email addresses, a local account can never
  // become "verified" - so without requireLocalEmailVerified: false, signing in
  // with Google/GitHub using an email that already has a password account is
  // rejected with account_not_linked. trustedProviders marks both providers as
  // trustworthy enough to link to that existing account.
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
      requireLocalEmailVerified: false,
    },
  },
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : ["http://localhost:3000"],
  // The jwt plugin publishes the JWKS that the Express server fetches to
  // verify every protected request.
  plugins: [jwt()],
  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
      maxAge: 7 * 24 * 60 * 60,
    },
  },
});
