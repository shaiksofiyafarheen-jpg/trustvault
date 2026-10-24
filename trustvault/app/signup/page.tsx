
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsError(false);

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (!name) {
      setMessage("Please enter your full name.");
      setIsError(true);
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      setIsError(true);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        setMessage(error.message);
        setIsError(true);
        return;
      }

      if (data.user && data.user.identities?.length === 0) {
        setMessage(
          "This email may already be registered. Try logging in."
        );
        setIsError(true);
        return;
      }

      if (data.session) {
        router.replace("/dashboard");
        return;
      }

      setMessage(
        "Signup successful! Check your email for the confirmation link. After confirming your email, please log in."
      );
      setIsError(false);
    } catch {
      setMessage("Something went wrong. Please try again.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-cyan-400/20 bg-slate-900 p-8">
        <Link
          href="/"
          className="text-xl font-bold text-cyan-400"
        >
          TrustVault
        </Link>

        <h1 className="mt-8 text-center text-3xl font-bold">
          Create Account
        </h1>

        <p className="mt-2 text-center text-gray-400">
          Join TrustVault today
        </p>

        <form onSubmit={handleSignup} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              autoComplete="name"
              required
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block">
              Password
            </label>

            <div className="flex rounded-xl border border-white/10 bg-slate-950">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
                className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 text-cyan-400"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-400 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {message && (
            <p
              role="status"
              aria-live="polite"
              className={`break-words text-sm ${
                isError ? "text-red-400" : "text-cyan-300"
              }`}
            >
              {message}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-cyan-400 hover:underline"
          >
            Login
          </Link>
        </p>

        <Link
          href="/"
          className="mt-5 block text-center text-sm text-gray-400"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
