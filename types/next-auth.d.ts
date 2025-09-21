// /types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // add id
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
  }
}
