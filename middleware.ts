import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

// Protect /dashboard AND all /api routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",     // VERY IMPORTANT
  ],
};
