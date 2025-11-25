// app/dashboard/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardPageClient from "./DashboardPageClient";

export default async function DashboardRoot() {
  const user = await currentUser();

  if (!user) {
    // server-side redirect to Clerk sign-in page with return URL
    redirect("/sign-in?redirect_url=/dashboard");
  }

  // user is authenticated — render client dashboard
  return <DashboardPageClient />;
}
