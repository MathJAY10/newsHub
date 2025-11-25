// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

// Only protect /dashboard
export const config = {
  matcher: ["/dashboard/:path*"],
};
