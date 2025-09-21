// middleware.ts  (must stay in project root)
import authMiddleware from "./middleware/authMiddleware";

export default authMiddleware;

export const config = {
  matcher: ["/dashboard"], // protect only /dashboard and subpaths
};
