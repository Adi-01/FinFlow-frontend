const CLIENT_ID_STORAGE_KEY = "finflow_client_id";

/**
 * Returns a persistent UUID for the current browser tab session stored in sessionStorage.
 * If deleted or missing, self-heals by generating and persisting a new UUID.
 */
export function getClientId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    let clientId = sessionStorage.getItem(CLIENT_ID_STORAGE_KEY);
    if (!clientId || clientId.trim().length < 10) {
      clientId = crypto.randomUUID();
      sessionStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId);
    }
    return clientId;
  } catch {
    // In case storage access is restricted (e.g. sandboxed iframe or private mode storage error)
    return "";
  }
}

