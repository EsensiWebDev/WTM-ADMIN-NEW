import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

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
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
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
  normalizedHeaders.set("Cookie", `refresh_token=${session.refreshToken}`);
  normalizedHeaders.set("Content-Type", "application/json");

  const response = await fetch(url, {
    ...init,
    headers: normalizedHeaders,
    cache: "no-store",
  });

  if (!response.ok && onError) {
    return onError(response);
  }

  return response;
}
