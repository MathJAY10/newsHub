import "./globals.css";          // <--- VERY IMPORTANT
import { ClerkProvider } from "@clerk/nextjs";
import RegisterSync from "./register-sync";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <RegisterSync />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
