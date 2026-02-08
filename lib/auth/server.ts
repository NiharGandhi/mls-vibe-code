import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Get the current session. Use in server components, route handlers, and server actions.
 * Returns { data: session } to match previous API; session is null when not authenticated.
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return { data: session };
}

export { auth };
