
"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  
async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Login failed");
      return;
    }

    window.location.href = "/dashboard";
  } catch (error) {
    console.error("Login error:", error);
    alert("Unable to connect to the server. Please try again.");
  }
}


  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b12] px-6 py-12 text-white">
      <div className="w-full max-w-md">
        <a href="/" className="mb-10 block text-center text-3xl font-bold">
          <span className="text-violet-400">◆</span> Sandbox
        </a>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl">
          <h1 className="text-3xl font-bold">Welcome back</h1>

          <p className="mt-2 text-sm text-zinc-400">
            Log in to continue building your games.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none transition focus:border-violet-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none transition focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-violet-600 py-3 font-semibold transition hover:bg-violet-500"
            >
              Log In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-medium text-violet-400 hover:text-violet-300"
            >
              Sign up
            </a>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Your ideas. Your games. Powered by AI.
        </p>
      </div>
    </main>
  );
}
