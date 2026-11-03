import { authClient } from "./auth-client";

/**
 * Client components cannot read the session cookie as a token directly, so
 * they ask Better Auth for the signed JWT and send it as
 * `Authorization: Bearer <token>` to the Express API.
 */
export const getTokenFromClient = async () => {
  const { data } = await authClient.token();
  return data?.token;
};
