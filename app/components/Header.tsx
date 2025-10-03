// app/components/Header.tsx
'use client';
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

interface HeaderProps {
  className?: string;
}

export default function AppHeader({ className = '' }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className={`w-full flex justify-between items-center px-8 py-4 bg-black ${className} fixed top-0 left-0 z-50`}>
      <Link href="/" className="text-2xl font-extrabold text-violet-400 hover:text-violet-500 transition">
        NewsHub
      </Link>

      <nav className="flex items-center gap-4">
        {session ? (
          <>
            <Link href="/dashboard" className="px-5 py-2 rounded-lg border border-violet-500 text-violet-300 hover:bg-violet-600 hover:text-white transition-all shadow-md hover:shadow-violet-700/50">
              Dashboard
            </Link>
            <button onClick={() => signOut()} className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md hover:shadow-red-700/50 transition">
              Logout
            </button>
          </>
        ) : (
          <button onClick={() => signIn("google")} className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md hover:shadow-violet-700/50 transition">
            Login with Google
          </button>
        )}
      </nav>
    </header>
  );
}
