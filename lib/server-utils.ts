import "server-only";

import { headers } from "next/headers";

/**
 * Determines if the current request is a Next.js App Router soft navigation (RSC payload request).
 * This can be used to skip expensive server-side fetches (like React Query prefetching)
 * when the client already has the data cached or will fetch it itself.
 */
export async function isSoftNavigation(): Promise<boolean> {
  try {
    const headersList = await headers();

    // 1. `rsc: 1` is Next.js standard for RSC payload requests
    // 2. `x-is-soft-navigation` is sometimes injected by custom middleware
    // 3. `sec-fetch-dest: empty` is sent by browsers for fetch/XHR calls
    return (
      headersList.get("rsc") === "1" ||
      headersList.get("x-is-soft-navigation") === "1" ||
      headersList.get("sec-fetch-dest") === "empty"
    );
  } catch (error) {
    return false;
  }
}
