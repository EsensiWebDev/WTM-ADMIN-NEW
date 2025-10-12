import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user?: DefaultSession["user"] & {
      id: string;
      ID: number;
      username: string;
      role: string;
      permissions: unknown;
      photo_url: string | null;
      first_name: string | null;
      last_name: string | null;
    };
  }

  interface User {
    id: string;
    ID: number;
    username: string;
    role: string;
    permissions: unknown;
    photo_url: string | null;
    first_name: string | null;
    last_name: string | null;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number | null;
    user?: import("next-auth").User;
    error?: string;
  }
}
