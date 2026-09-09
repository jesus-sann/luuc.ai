"use client";

import { useEffect, useState, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Stable client ref — createClient() must not change on every render
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  useEffect(() => {
    let cancelled = false;

    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!cancelled) setUser(user);
      } catch {
        // Network failure — treat as unauthenticated so the UI doesn't spin
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
    // supabase is stable (ref), so this runs exactly once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    // Full-page navigation to the server-side signout route.
    // The server clears the auth cookies via Set-Cookie response headers and
    // redirects to /login — avoids the router.refresh() race condition that
    // caused the middleware to see a stale session cookie and loop back to /dashboard.
    window.location.href = "/auth/signout";
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
}
