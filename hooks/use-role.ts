"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export type UserRole = "student" | "teacher" | null;

export function useRole(): { role: UserRole; displayName: string | null; isLoading: boolean } {
  const [role, setRole] = useState<UserRole>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata;
      setRole((meta?.role as UserRole) || null);
      setDisplayName(meta?.display_name || null);
      setIsLoading(false);
    });
  }, []);

  return { role, displayName, isLoading };
}
