"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function RegisterSync() {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetch("/api/register", { method: "POST" });
    }
  }, [user]);

  return null;
}
