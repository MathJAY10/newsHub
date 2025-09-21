"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header>
      {session ? (
        <>
          <Link href="/dashboard">Dashboard</Link>
          <button onClick={() => signOut()}>Logout</button>
        </>
      ) : (
        <button onClick={() => signIn("google")}>Login with Google</button>
      )}
    </header>
  );
}
