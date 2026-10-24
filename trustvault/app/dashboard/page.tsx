
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [recentDocuments, setRecentDocuments] = useState(0);
  const [statsError, setStatsError] = useState("");

  const loadDocumentStats = useCallback(async (userId: string) => {
    setStatsError("");

    const { count: total, error: totalError } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (totalError) {
      setStatsError("Could not load document statistics.");
      return;
    }

    setTotalDocuments(total ?? 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recent, error: recentError } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", sevenDaysAgo.toISOString());

    if (recentError) {
      setStatsError("Could not load recent document statistics.");
      return;
    }

    setRecentDocuments(recent ?? 0);
  }, []);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error || !data.session) {
        router.replace("/login");
        return;
      }

      setEmail(data.session.user.email ?? "");
      await loadDocumentStats(data.session.user.id);

      if (active) {
        setLoading(false);
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      if (!session) {
        router.replace("/login");
        return;
      }

      setEmail(session.user.email ?? "");
      loadDocumentStats(session.user.id);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router, loadDocumentStats]);

  async function handleLogout() {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Logout failed. Please try again.");
      setLoggingOut(false);
      return;
    }

    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
          <p className="text-slate-300">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  const initial = email ? email.charAt(0).toUpperCase() : "U";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900/70 p-6 md:flex md:flex-col">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-cyan-400"
          >
            TrustVault
          </Link>

          <p className="mt-2 text-xs text-slate-500">
            YOUR SECURE DOCUMENT SPACE
          </p>

          <nav className="mt-10 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl bg-cyan-400/10 px-4 py-3 font-medium text-cyan-300"
            >
              <span>▦</span> Dashboard
            </Link>

            <Link
              href="/documents"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span>▤</span> My Documents
            </Link>

            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span>⌂</span> Home
            </Link>
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
            <div className="mb-2 text-xl">🛡️</div>
            <p className="font-semibold">Your privacy matters</p>
            <p className="mt-1 text-sm leading-5 text-slate-400">
              Keep your important documents secure and organized.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-5 py-5 sm:px-8">
            <div>
              <p className="text-sm text-slate-400">Workspace</p>
              <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 font-bold text-slate-950">
                {initial}
              </div>

              <div className="hidden max-w-48 sm:block">
                <p className="truncate text-sm font-medium">{email}</p>
                <p className="text-xs text-slate-400">Signed in</p>
              </div>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-xl border border-red-400/30 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:opacity-50 sm:px-4"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
            <section className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 p-6 sm:p-10">
              <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="relative max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Your secure workspace
                </p>

                <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
                  Welcome to TrustVault!
                </h2>

                <p className="mt-4 leading-7 text-slate-300">
                  Manage your important documents in one place.
                  Your personal document workspace starts here.
                </p>

                <Link
                  href="/documents"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
                >
                  View My Documents <span>→</span>
                </Link>
              </div>
            </section>

            <section>
              <div className="mb-5">
                <h2 className="text-xl font-bold">Overview</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Your document workspace at a glance.
                </p>
              </div>

              {statsError && (
                <p className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">
                  {statsError}
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-400/40">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      Total Documents
                    </p>
                    <span className="text-2xl">📁</span>
                  </div>
                  <p className="mt-5 text-3xl font-extrabold">
                    {totalDocuments}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Total documents in your account.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-400/40">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      Recent Documents
                    </p>
                    <span className="text-2xl">🕒</span>
                  </div>
                  <p className="mt-5 text-3xl font-extrabold">
                    {recentDocuments}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Documents uploaded in the last 7 days.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-400/40 sm:col-span-2 xl:col-span-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      Account Status
                    </p>
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <p className="mt-5 text-2xl font-extrabold text-emerald-400">
                    Signed In
                  </p>
                  <p className="mt-2 break-all text-xs text-slate-400">
                    {email}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold">Quick Actions</h2>
              <p className="mt-1 text-sm text-slate-400">
                Get to your workspace faster.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Link
                  href="/documents"
                  className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-400/50 hover:bg-slate-900/80"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-2xl">
                    📂
                  </div>
                  <h3 className="mt-4 text-lg font-bold group-hover:text-cyan-300">
                    My Documents
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Open your document management page and organize your files.
                  </p>
                  <p className="mt-4 font-semibold text-cyan-300">
                    Open Documents →
                  </p>
                </Link>

                <Link
                  href="/documents"
                  className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-400/50 hover:bg-slate-900/80"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-400/10 text-2xl">
                    ⬆️
                  </div>
                  <h3 className="mt-4 text-lg font-bold group-hover:text-cyan-300">
                    Upload Documents
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Upload and access your files securely.
                  </p>
                  <p className="mt-4 font-semibold text-cyan-300">
                    Go to Upload →
                  </p>
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-lg font-bold">Account Information</h2>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-400">Email Address</p>
                  <p className="mt-1 break-all font-medium">{email}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Authentication</p>
                  <p className="mt-1 font-medium text-emerald-400">
                    Supabase Auth
                  </p>
                </div>
              </div>
            </section>

            <footer className="border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
              © {new Date().getFullYear()} TrustVault. Your documents, your control.
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
