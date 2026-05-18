"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/admin/leads");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-[#00E5FF]">
            SWN AI
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">Admin Portal</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]"
              placeholder="admin@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 border border-red-500/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-[#00E5FF] px-6 py-3 font-semibold text-black transition-all hover:bg-[#00E5FF]/90 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
