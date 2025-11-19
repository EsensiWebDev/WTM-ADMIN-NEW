import { ApiResponse } from "@/types";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

const AUTH_API_BASE_URL =
  process.env.AUTH_API_BASE_URL ?? "http://54.255.206.242:4816/api";

type LoginResponse = ApiResponse<{
  token: string;
  user: RemoteUser;
}>;

type RemoteUser = {
  ID: number;
  username: string;
  role: string;
  permissions: unknown;
  photo_url: string | null;
  first_name: string | null;
  last_name: string | null;
  // TODO: Check this type error for now we include id, accessToken, refreshToken, accessTokenExpires
  id: string;
  name?: string | null;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number | null;
};

type AuthUser = RemoteUser & {
  id: string;
  name?: string | null;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number | null;
};

function decodeJwtExpiration(token: string | null | undefined) {
  if (!token) return null;

  try {
    const [, payloadPart] = token.split(".");
    const payload = JSON.parse(
      Buffer.from(payloadPart, "base64url").toString("utf8")
    ) as { exp?: number };

    if (!payload.exp) return null;
    return payload.exp * 1000;
  } catch (error) {
    console.error("Failed to decode JWT expiration", error);
    return null;
  }
}

function extractRefreshToken(setCookieHeader: string | null) {
  if (!setCookieHeader) return null;

  const match = setCookieHeader.match(/refresh_token=([^;]+)/);
  return match?.[1] ?? null;
}

export type ExtendedToken = JWT & {
  refreshToken?: string;
  accessTokenExpires?: number | null;
};

export async function refreshAccessToken(
  token: ExtendedToken
): Promise<ExtendedToken> {
  if (!token.refreshToken) {
    return {
      ...token,
      error: "MissingRefreshToken",
    };
  }

  try {
    const response = await fetch(`${AUTH_API_BASE_URL}/refresh-token`, {
      method: "GET",
      headers: {
        Cookie: `refresh_token=${token.refreshToken}`,
      },
      cache: "no-store",
    });

    const data: LoginResponse = await response.json();

    if (response.status === 401) {
      return {
        ...token,
        error: "RefreshTokenUnauthorized",
      };
    }

    if (!response.ok || data.status !== 200 || !data.data) {
      throw new Error(data.message || "Failed to refresh access token");
    }

    const newAccessToken = data.data.token;
    const maybeNewRefreshToken = extractRefreshToken(
      response.headers.get("set-cookie")
    );

    return {
      ...token,
      accessToken: newAccessToken,
      accessTokenExpires: decodeJwtExpiration(newAccessToken),
      user: data.data.user ?? token.user,
      refreshToken: maybeNewRefreshToken ?? token.refreshToken,
      error: undefined,
    };
  } catch (error) {
    console.error("RefreshAccessTokenError", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          throw new Error("Missing username or password");
        }

        const response = await fetch(`${AUTH_API_BASE_URL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
          }),
          cache: "no-store",
        });

        const data: LoginResponse = await response.json();

        if (!response.ok || data.status !== 200 || !data.data) {
          throw new Error(data.message || "Invalid credentials");
        }

        const isAgent = data.data.user.role.toLowerCase() === "agent";

        if (isAgent) {
          throw new Error("Invalid credentials");
        }

        const refreshToken = extractRefreshToken(
          response.headers.get("set-cookie")
        );

        if (!refreshToken) {
          throw new Error("Failed to retrieve refresh token");
        }

        const { token, user } = data.data;

        const authUser: AuthUser = {
          ...user,
          id: String(user.ID),
          name:
            [user.first_name, user.last_name]
              .filter(Boolean)
              .join(" ")
              .trim() || user.username,
          accessToken: token,
          refreshToken,
          accessTokenExpires: decodeJwtExpiration(token),
        };

        return authUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        const nextAccessToken = (session as Partial<AuthUser>).accessToken;
        const nextRefreshToken = (session as Partial<AuthUser>).refreshToken;
        const nextAccessTokenExpires =
          (session as Partial<AuthUser>).accessTokenExpires ??
          (typeof token.accessTokenExpires === "number"
            ? token.accessTokenExpires
            : null);

        return {
          ...token,
          accessToken: nextAccessToken ?? token.accessToken,
          refreshToken: nextRefreshToken ?? token.refreshToken,
          accessTokenExpires: nextAccessTokenExpires,
          user: (session as AuthUser) ?? token.user,
          error: undefined,
        } satisfies ExtendedToken;
      }

      if (user) {
        return {
          ...token,
          accessToken: (user as AuthUser).accessToken,
          refreshToken: (user as AuthUser).refreshToken,
          accessTokenExpires: (user as AuthUser).accessTokenExpires,
          user,
        };
      }

      if (
        token.accessTokenExpires &&
        typeof token.accessTokenExpires === "number" &&
        Date.now() < token.accessTokenExpires
      ) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user = token.user as AuthUser;
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      session.error = token.error as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export default authOptions;
