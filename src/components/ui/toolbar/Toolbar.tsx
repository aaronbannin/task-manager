"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";

export default function Toolbar() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="flex items-center justify-between bg-gray-800 p-4 text-white">
      <Link href="/" className="text-xl font-bold">
        Task Manager
      </Link>
      <div>
        {session ? (
          <Button onClick={handleLogout} variant="ghost" className="text-white">
            Logout
          </Button>
        ) : (
          <Button asChild variant="ghost" className="text-white">
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
