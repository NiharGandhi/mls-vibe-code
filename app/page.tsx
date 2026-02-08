import Link from "next/link";
import { Trophy, Users, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background gradient mesh */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.65_0.18_55/0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.65_0.18_55/0.2),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-orange-500/5 via-transparent to-transparent dark:from-orange-500/10" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-orange-400/10 blur-3xl dark:bg-orange-500/10" />
        <div className="absolute bottom-1/4 -left-32 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-500/10" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-8 md:px-12">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-orange-500 text-white">
            <Trophy className="size-4" />
          </span>
          MLS Challenges
        </Link>
        <nav className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">Get started</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24 md:py-32">
        <section className="flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-1.5 text-sm font-medium text-orange-700 dark:border-orange-400/20 dark:bg-orange-500/10 dark:text-orange-300">
            <Sparkles className="size-4" />
            Compete. Collaborate. Win.
          </div>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Join challenges.
            <br />
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent dark:from-orange-400 dark:to-amber-400">
              Form teams.
            </span>
            <br />
            Show what you can do.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            MLS Challenges brings together talented individuals to compete in
            coding challenges. Create or join teams, tackle real problems, and
            level up your skills.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
            <Button size="lg" className="gap-2 text-base" asChild>
              <Link href="/auth/sign-up">
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="mt-24 grid gap-6 sm:grid-cols-2 lg:mt-32 lg:grid-cols-3">
          <div className="group rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-orange-500/30 hover:shadow-lg dark:bg-card/30">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Trophy className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Challenges</h3>
            <p className="mt-2 text-muted-foreground">
              Browse live and upcoming challenges. Register, submit, and track
              your progress.
            </p>
          </div>
          <div className="group rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-orange-500/30 hover:shadow-lg dark:bg-card/30">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Users className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Teams</h3>
            <p className="mt-2 text-muted-foreground">
              Form teams, invite members, and collaborate. Request to join or
              create your own.
            </p>
          </div>
          <div className="group rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-orange-500/30 hover:shadow-lg dark:bg-card/30 sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Compete</h3>
            <p className="mt-2 text-muted-foreground">
              Put your skills to the test. Get feedback, notifications, and stay
              ahead.
            </p>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-24 rounded-2xl border border-border/60 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-transparent p-8 text-center sm:p-12 md:mt-32">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Ready to get started?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Create an account and join your first challenge today.
          </p>
          <Button size="lg" className="mt-6 gap-2" asChild>
            <Link href="/auth/sign-up">
              Create account
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-border/60 px-6 py-8 sm:px-8 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link
            href="/"
            className="flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground"
          >
            <Trophy className="size-4" />
            MLS Challenges
          </Link>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/auth/sign-in" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href="/auth/sign-up" className="hover:text-foreground">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
