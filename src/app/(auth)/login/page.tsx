"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, UsersRound } from "lucide-react";

// `useSearchParams` opts the component out of static prerendering
// unless it sits under a Suspense boundary. We split the form into
// a child component so the outer page can prerender the chrome
// (background, card frame) while the form hydrates with the query
// string on the client.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const searchParams = useSearchParams();
  // Forwarded from `/join/<token>` when the visitor already has an
  // account. After a successful sign-in we send them to the join
  // page to accept rather than to /dashboard.
  const inviteToken = searchParams.get("invite");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log('[LOGIN] Attempting signInWithPassword for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('[LOGIN] Result → error:', error, '| session:', data?.session?.access_token ? 'present' : 'null');

    if (error) {
      console.error('[LOGIN] Auth error:', error.message, error.status);
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      console.error('[LOGIN] No session returned despite no error — email may not be confirmed');
      setError('Login failed: no session returned. Your email may not be confirmed — check your inbox.');
      setLoading(false);
      return;
    }

    console.log('[LOGIN] Session OK, navigating via window.location...');
    // Use window.location.href (hard navigation) to avoid Next.js middleware
    // cookie timing race — the browser will send all fresh cookies on a real
    // HTTP request rather than a client-side push which can race with
    // the cookie being committed.
    if (inviteToken) {
      window.location.href = `/join/${encodeURIComponent(inviteToken)}`;
    } else {
      window.location.href = '/dashboard';
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback${
      inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : ""
    }`;
    console.log('[LOGIN] Attempting signInWithOAuth for Google, redirecting to:', redirectTo);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error('[LOGIN] OAuth error:', error.message);
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            {inviteToken ? (
              <UsersRound className="h-6 w-6 text-primary" />
            ) : (
              <MessageSquare className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle className="text-xl text-white">
            {inviteToken ? "Sign in to accept" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {inviteToken
              ? "Sign in and we'll take you to the invitation."
              : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:border-primary focus-visible:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:border-primary focus-visible:ring-primary/20"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-10 w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500 font-medium">
                or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="flex h-10 w-full items-center justify-center gap-2 border-slate-850 bg-slate-950 text-slate-200 hover:bg-slate-900 hover:text-white disabled:opacity-50 transition-colors rounded-lg font-semibold"
          >
            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.29c1.92,-1.78 3.02,-4.4 3.02,-7.4C21.65,11.83 21.54,11.43 21.35,11.1z" fill="#4285F4" />
                <path d="M12,20.5c2.3,0 4.23,-0.76 5.64,-2.08l-3.29,-2.6c-0.91,0.61 -2.07,0.98 -3.29,0.98 -2.25,0 -4.16,-1.52 -4.84,-3.57H2.88v2.7C4.29,18.73 7.89,20.5 12,20.5z" fill="#34A853" />
                <path d="M7.16,13.23c-0.17,-0.52 -0.27,-1.07 -0.27,-1.64c0,-0.57 0.1,-1.12 0.27,-1.64V7.25H2.88C2.3,8.42 2,9.78 2,11.5c0,1.72 0.3,3.08 0.88,4.25l4.28,-3.27z" fill="#FBBC05" />
                <path d="M12,5.2c1.25,0 2.37,0.43 3.25,1.28l2.44,-2.44C16.22,2.63 14.29,1.7 12,1.7c-4.11,0 -7.71,1.77 -9.12,4.55l4.28,3.27C7.84,6.72 9.75,5.2 12,5.2z" fill="#EA4335" />
              </g>
            </svg>
            Sign in with Google
          </Button>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href={
                inviteToken
                  ? `/signup?invite=${encodeURIComponent(inviteToken)}`
                  : "/signup"
              }
              className="text-primary hover:text-primary/80"
            >
              Create account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
