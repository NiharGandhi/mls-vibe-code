"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { syncUserToDb } from "@/lib/auth/sync-user";
import Link from "next/link";

const DEFAULT_REDIRECT = "/dashboard";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    const { data, error: signInError } = await signIn.email({
      email: email.trim(),
      password,
      callbackURL: DEFAULT_REDIRECT,
    });
    setLoading(false);
    if (signInError) {
      const isUnverified =
        signInError.status === 403 ||
        /verif|email.*not.*verif/i.test(signInError.message ?? "");
      if (isUnverified) {
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(email.trim())}&from=signin`;
        return;
      }
      setError(signInError.message ?? "Sign in failed. Please try again.");
      return;
    }
    if (data?.user) {
      await syncUserToDb();
      window.location.href = DEFAULT_REDIRECT;
    }
  }

  async function handleMagicLink() {
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    setMagicLinkLoading(true);
    await signIn.magicLink({
      email: email.trim(),
      callbackURL: DEFAULT_REDIRECT,
      fetchOptions: {
        onRequest: () => {},
        onResponse: () => setMagicLinkLoading(false),
      },
    });
    setMagicLinkLoading(false);
    // Better Auth may show a success message; we don't set error on success
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Sign in with your email and password, or use a magic link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailPasswordSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              autoComplete="email"
              required
              disabled={loading || magicLinkLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              disabled={loading || magicLinkLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading || magicLinkLoading}>
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Sign in with Email & Password"
            )}
          </Button>
        </form>

        <div className="relative my-4">
          <span className="bg-card absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </span>
          <span className="bg-card relative flex justify-center text-xs uppercase text-muted-foreground">
            Or
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          disabled={loading || magicLinkLoading}
          onClick={handleMagicLink}
        >
          {magicLinkLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Send magic link to email"
          )}
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <p className="text-center text-sm text-muted-foreground w-full">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="font-medium text-primary underline underline-offset-2 hover:no-underline"
          >
            Sign up
          </Link>
        </p>
        <p className="text-center text-xs text-neutral-500">
          built with{" "}
          <Link
            href="https://better-auth.com"
            className="underline"
            target="_blank"
          >
            <span className="dark:text-white/70 cursor-pointer">
              better-auth.
            </span>
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
