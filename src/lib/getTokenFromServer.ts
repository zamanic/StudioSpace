import { headers } from "next/headers";
import { auth } from "./auth";

/** Same token as getTokenFromClient, but for server components. */
export const getTokenFromServer = async () => {
  const jwtToken = await auth.api.getToken({ headers: await headers() });
  return jwtToken?.token;
};
