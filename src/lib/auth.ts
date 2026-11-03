import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

// Better Auth shares the same Atlas cluster as the Express API but keeps its
// own collections (user / session / account) inside the "studiospace" db.
const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("studiospace");

const google =
  process.env.BETTER_AUTH_GOOGLE_CLIENT_ID && process.env.BETTER_AUTH_GOOGLE_SECRET
    ? {
        clientId: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.BETTER_AUTH_GOOGLE_SECRET,
      }
    : undefined;

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  // No email verification and no forgot-password on purpose: the brief keeps
  // examiner testing to a plain email + password sign-up.
  emailAndPassword: { enabled: true },
  ...(google ? { socialProviders: { google } } : {}),
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
