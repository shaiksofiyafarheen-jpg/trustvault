
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        router.replace("/login");
        return;
      }

      setEmail(data.session.user.email ?? "");
      setLoading(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      } else {
        setEmail(session.user.email ?? "");
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Logout కాలేదు. మళ్లీ ప్రయత్నించు.");
      return;
    }

    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Dashboard loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <header className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-cyan-400">
          TrustVault
        </h1>

        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-500 px-4 py-2 font-semibold hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      <section className="max-w-5xl mx-auto mt-12">
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-cyan-400 text-sm">YOUR DASHBOARD</p>

          <h2 className="mt-3 text-3xl font-bold">
            Welcome to TrustVault!
          </h2>

          <p className="mt-4 text-slate-300">
            నువ్వు విజయవంతంగా Login అయ్యావు.
          </p>

          <div className="mt-6 rounded-xl bg-slate-800 p-4">
            <p className="text-sm text-slate-400">Login చేసిన Email</p>
            <p className="mt-1 break-all font-medium">{email}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
