import "server-only";

import { cookies } from "next/headers";

const SESSION_TOKEN_COOKIE = "sessionToken";

/**
 * Set httpOnly Session Token Cookie (30 days)
 */
export async function setSessionCookie(sessionToken: string) {
  const cookieStore = await cookies();

  try {
    cookieStore.set(SESSION_TOKEN_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch (err) {
    // Silently ignore in Server Components where cookies cannot be mutated
    console.log("[Auth] Unable to set cookies in this context (likely Server Component).");
  }
}

/**
 * Get httpOnly Session Token Cookie
 */
export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_TOKEN_COOKIE)?.value;
}

/**
 * Remove httpOnly Session Token Cookie
 */
export async function removeSessionCookie() {
  const cookieStore = await cookies();
  try {
    cookieStore.delete(SESSION_TOKEN_COOKIE);
  } catch (err) {
    console.log("[Auth] Unable to delete cookies in this context (likely Server Component).");
  }
}
