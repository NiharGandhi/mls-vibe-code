"use client";

import { useCallback, useEffect, useState } from "react";
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
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";

type Props = { email: string; from: "signup" | "signin" };

export function VerifyEmailContent({ email: initialEmail, from }: Props) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (retryAfterSeconds == null || retryAfterSeconds <= 0) return;
    const t = setInterval(() => {
      setRetryAfterSeconds((s) => (s == null || s <= 1 ? null : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [retryAfterSeconds]);

  const handleResend = useCallback(async () => {
    const toSend = email.trim();
    if (!toSend) {
      setMessage({ type: "error", text: "Please enter your email address." });
      return;
    }
    setMessage(null);
    setRetryAfterSeconds(null);
    setLoading(true);
    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: toSend }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage({
          type: "success",
          text: "Verification email sent. Check your inbox (and spam folder).",
        });
        setRetryAfterSeconds(60);
      } else if (res.status === 429) {
        const sec = (data as { retryAfterSeconds?: number }).retryAfterSeconds ?? 60;
        setRetryAfterSeconds(sec);
        setMessage({
          type: "error",
          text: `Please wait ${sec} seconds before requesting another email.`,
        });
      } else {
        setMessage({
          type: "error",
          text: (data as { error?: string }).error ?? "Failed to send. Try again later.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Try again." });
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-center text-lg md:text-xl">
          Verify your email
        </CardTitle>
        <CardDescription className="text-center text-xs md:text-sm">
          {from === "signup"
            ? "We've sent a verification link to your email. Click the link to verify your account and get started."
            : "You need to verify your email before you can sign in. We can send you a new verification link."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="verify-email">Email address</Label>
          <Input
            id="verify-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        {message && (
          <p
            className={`text-sm ${
              message.type === "success"
                ? "text-green-600 dark:text-green-400"
                : "text-destructive"
            }`}
            role="alert"
          >
            {message.text}
          </p>
        )}
        <Button
          className="w-full gap-2"
          onClick={handleResend}
          disabled={loading || (retryAfterSeconds !== null && retryAfterSeconds > 0)}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : retryAfterSeconds != null && retryAfterSeconds > 0 ? (
            `Resend in ${retryAfterSeconds}s`
          ) : (
            "Resend verification email"
          )}
        </Button>
        {retryAfterSeconds != null && retryAfterSeconds > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Rate limit: one email per minute.
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <p className="text-center text-sm text-muted-foreground w-full">
          Already verified?{" "}
          <Link
            href="/auth/sign-in"
            className="font-medium text-primary underline underline-offset-2 hover:no-underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
