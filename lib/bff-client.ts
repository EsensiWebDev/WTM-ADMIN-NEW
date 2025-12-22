import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";

type SessionWithTokens = Session & {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number | null;
  error?: string;
  user?: unknown;
};

const API_BASE_URL =
  process.env.AUTH_API_BASE_URL ?? "http://54.255.206.242:4816/api";

type BffFetchOptions = RequestInit & {
  /**
   * Fallback response to return when the upstream API responds with a non-OK status.
   */
  onError?: (response: Response) => Promise<Response>;
};

/**
 * Server-side helper that attaches the current access token to outbound requests.
 * Automatically relies on NextAuth token refresh flow through getServerSession.
 */
export async function bffFetch(
  input: string,
  { onError, headers, ...init }: BffFetchOptions = {}
) {
  const session = (await getServerSession(
    authOptions
  )) as SessionWithTokens | null;

  if (!session || !session.accessToken) {
    return new Response(
      JSON.stringify({
        status: 401,
        message: "Unauthorized",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const url =
    input.startsWith("http://") || input.startsWith("https://")
      ? input
      : `${API_BASE_URL.replace(/\/$/, "")}/${input.replace(/^\//, "")}`;

  const normalizedHeaders = new Headers(headers);
  normalizedHeaders.set("Authorization", `Bearer ${session.accessToken}`);
  if (session.refreshToken) {
    normalizedHeaders.set("Cookie", `refresh_token=${session.refreshToken}`);
  } else {
    normalizedHeaders.delete("Cookie");
  }

  // Only set Content-Type to application/json if it's not already set
  // This allows FormData to work properly as the browser will set the correct Content-Type with boundary
  if (
    !normalizedHeaders.has("Content-Type") &&
    !(init?.body instanceof FormData)
  ) {
    normalizedHeaders.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: normalizedHeaders,
      cache: "no-store",
    });
  } catch (error) {
    // Handle network errors (connection refused, timeout, etc.)
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCause = error instanceof Error && "cause" in error ? error.cause : null;
    const causeCode = errorCause && typeof errorCause === "object" && "code" in errorCause 
      ? String(errorCause.code) 
      : "";
    
    const isNetworkError =
      error instanceof TypeError &&
      (errorMessage.includes("fetch failed") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("ENOTFOUND") ||
        errorMessage.includes("ETIMEDOUT") ||
        causeCode === "ECONNREFUSED" ||
        causeCode === "ENOTFOUND" ||
        causeCode === "ETIMEDOUT");

    if (isNetworkError) {
      return new Response(
        JSON.stringify({
          status: 503,
          message: "Service unavailable - Unable to connect to API server",
        }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Re-throw other errors
    throw error;
  }

  // If we get a 401, the token might be expired or invalid
  // Get a fresh session which will trigger NextAuth's JWT callback to refresh if needed
  if (response.status === 401) {
    const freshSession = (await getServerSession(
      authOptions
    )) as SessionWithTokens | null;

    // If we have a fresh session with a valid token, retry the request
    if (freshSession?.accessToken && !freshSession.error) {
      normalizedHeaders.set("Authorization", `Bearer ${freshSession.accessToken}`);
      
      if (freshSession.refreshToken) {
        normalizedHeaders.set(
          "Cookie",
          `refresh_token=${freshSession.refreshToken}`
        );
      } else {
        normalizedHeaders.delete("Cookie");
      }

      try {
        response = await fetch(url, {
          ...init,
          headers: normalizedHeaders,
          cache: "no-store",
        });
      } catch (error) {
        // Handle network errors on retry
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorCause = error instanceof Error && "cause" in error ? error.cause : null;
        const causeCode = errorCause && typeof errorCause === "object" && "code" in errorCause 
          ? String(errorCause.code) 
          : "";
        
        const isNetworkError =
          error instanceof TypeError &&
          (errorMessage.includes("fetch failed") ||
            errorMessage.includes("ECONNREFUSED") ||
            errorMessage.includes("ENOTFOUND") ||
            errorMessage.includes("ETIMEDOUT") ||
            causeCode === "ECONNREFUSED" ||
            causeCode === "ENOTFOUND" ||
            causeCode === "ETIMEDOUT");

        if (isNetworkError) {
          return new Response(
            JSON.stringify({
              status: 503,
              message: "Service unavailable - Unable to connect to API server",
            }),
            {
              status: 503,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }

        throw error;
      }
    } else if (freshSession?.error) {
      // Session has an error (e.g., refresh failed), return 401
      return new Response(
        JSON.stringify({
          status: 401,
          message: "Unauthorized - Session expired",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }

  if (!response.ok && onError) {
    return onError(response);
  }

  return response;
}
