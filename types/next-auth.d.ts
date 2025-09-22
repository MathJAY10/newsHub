// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;      // ✅ now TS knows id is always string
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}
