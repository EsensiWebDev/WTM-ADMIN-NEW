import {
  authOptions,
  refreshAccessToken,
  type ExtendedToken,
} from "@/lib/auth";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";

type SessionWithTokens = Session & {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number | null;
  error?: string;
  user?: unknown;
};

type RefreshAttemptResult =
  | { kind: "success" }
  | { kind: "unauthorized" }
  | { kind: "skipped" }
  | { kind: "failed" };

const API_BASE_URL =
  process.env.AUTH_API_BASE_URL ?? "http://54.255.206.242:4816/api";

async function attemptTokenRefresh(
  session: SessionWithTokens
): Promise<RefreshAttemptResult> {
  if (!session?.refreshToken) {
    return { kind: "skipped" };
  }
  const refreshTokenInput: ExtendedToken = {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    accessTokenExpires: session.accessTokenExpires,
    user: session.user,
  };

  const refreshedToken = await refreshAccessToken(refreshTokenInput);

  if (refreshedToken.error === "RefreshTokenUnauthorized") {
    return { kind: "unauthorized" };
  }

  if (refreshedToken.error) {
    return { kind: "failed" };
  }

  session.accessToken = refreshedToken.accessToken;
  session.refreshToken = refreshedToken.refreshToken;
  session.accessTokenExpires = refreshedToken.accessTokenExpires ?? null;
  if (refreshedToken.user) {
    session.user = refreshedToken.user as typeof session.user;
  }
  session.error = undefined;

  return { kind: "success" };
}

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

  let response = await fetch(url, {
    ...init,
    headers: normalizedHeaders,
    cache: "no-store",
  });

  if (response.status === 500 || response.status === 401) {
    const refreshResult = await attemptTokenRefresh(session);

    if (refreshResult.kind === "success" && session.accessToken) {
      normalizedHeaders.set("Authorization", `Bearer ${session.accessToken}`);

      if (session.refreshToken) {
        normalizedHeaders.set(
          "Cookie",
          `refresh_token=${session.refreshToken}`
        );
      }

      response = await fetch(url, {
        ...init,
        headers: normalizedHeaders,
        cache: "no-store",
      });
    } else if (refreshResult.kind === "unauthorized") {
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
  }

  if (!response.ok && onError) {
    return onError(response);
  }

  return response;
}
