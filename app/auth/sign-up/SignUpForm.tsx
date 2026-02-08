"use client";

import { signUp } from "@/lib/auth-client";
import { upsertUserOnSignUp } from "@/lib/auth/sync-user";
import Link from "next/link";
import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const VERIFY_EMAIL_PATH = "/auth/verify-email";

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = (formData.get("email") as string)?.trim();
    const name = (formData.get("name") as string)?.trim();
    const password = formData.get("password") as string;
    const yearOfStudy = (formData.get("yearOfStudy") as string)?.trim() || undefined;
    const majorOfStudy = (formData.get("majorOfStudy") as string)?.trim() || undefined;
    const dob = (formData.get("dob") as string)?.trim() || undefined;

    if (!email || !name || !password) {
      setError("Please fill in name, email, and password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    const { data, error: signUpError } = await signUp.email({
      email,
      name,
      password,
      callbackURL: "/dashboard",
    });

    if (signUpError) {
      setIsLoading(false);
      setError(signUpError.message ?? "Sign up failed. Please try again.");
      return;
    }

    if (data?.user) {
      await upsertUserOnSignUp({
        userId: data.user.id,
        name,
        email,
        yearOfStudy,
        majorOfStudy,
        dob,
      });
      setIsLoading(false);
      window.location.href = `${VERIFY_EMAIL_PATH}?email=${encodeURIComponent(email)}&from=signup`;
      return;
    }

    setIsLoading(false);
    setSuccessMessage("Account created. Check your email to verify, or sign in to request a new link.");
    form.reset();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Create an account</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your details below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              disabled={isLoading}
              placeholder="Your name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isLoading}
              placeholder="you@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              disabled={isLoading}
              placeholder="At least 8 characters"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="yearOfStudy">Year of study</Label>
            <Select name="yearOfStudy" disabled={isLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Year of study</SelectLabel>
                  <SelectItem value="1st">1st year</SelectItem>
                  <SelectItem value="2nd">2nd year</SelectItem>
                  <SelectItem value="3rd">3rd year</SelectItem>
                  <SelectItem value="4th">4th year</SelectItem>
                  <SelectItem value="5th+">5th year or more</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="majorOfStudy">Major / course</Label>
            <Input
              id="majorOfStudy"
              name="majorOfStudy"
              type="text"
              disabled={isLoading}
              placeholder="e.g. CIT, CSEC, Computer Science"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dob">Date of birth</Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              disabled={isLoading}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="text-sm text-green-600 dark:text-green-400" role="status">
              {successMessage}
            </p>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-center text-sm text-muted-foreground w-full">
          Already have an account?{" "}
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
