import Link from "next/link";
import { Trophy, Users, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PulsingLinesBackground } from "@/components/PulsingLinesBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LaptopSvg, ServerSvg, CodeSvg, DatabaseSvg } from "@/components/ITElementSvgs";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background: pulsing lines + IT element SVGs + soft gradients (fixed, behind content) */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <PulsingLinesBackground />
        {/* IT Elements as background art – laptop, server, code, database */}
        <div className="absolute left-[5%] top-[18%] w-32 text-muted-foreground opacity-[0.14] dark:opacity-[0.18] sm:w-40">
          <LaptopSvg className="size-full" />
        </div>
        <div className="absolute right-[8%] top-[12%] w-28 text-muted-foreground opacity-[0.12] dark:opacity-[0.16] sm:w-36">
          <ServerSvg className="size-full" />
        </div>
        <div className="absolute bottom-[22%] left-[10%] w-24 text-muted-foreground opacity-[0.13] dark:opacity-[0.17] sm:w-32">
          <CodeSvg className="size-full" />
        </div>
        <div className="absolute bottom-[18%] right-[12%] w-28 text-muted-foreground opacity-[0.11] dark:opacity-[0.15] sm:w-36">
          <DatabaseSvg className="size-full" />
        </div>
        <div className="absolute right-[25%] top-[45%] w-20 text-muted-foreground opacity-[0.08] dark:opacity-[0.12] sm:w-24">
          <CodeSvg className="size-full" />
        </div>
        <div className="absolute left-[15%] bottom-[35%] w-24 text-muted-foreground opacity-[0.09] dark:opacity-[0.13] sm:w-28">
          <ServerSvg className="size-full" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.65_0.18_55/0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.65_0.18_55/0.18),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent dark:from-orange-500/15" />
      </div>
      {/* Solid background behind the animated layer */}
      <div className="absolute inset-0 -z-10 bg-background" aria-hidden />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-8 md:px-12">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-orange-500 text-white">
            <Trophy className="size-4" />
          </span>
          Vibe-a-thon
          <span className="hidden text-xs font-normal text-muted-foreground sm:inline">
            by MLS · Machine Learning Society
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">Get started</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24 md:py-32">
        <section className="flex flex-col items-center text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-1.5 text-sm font-medium text-orange-700 dark:border-orange-400/20 dark:bg-orange-500/10 dark:text-orange-300">
              <Sparkles className="size-4" />
              Vibe-a-thon • Organised by MLS (Machine Learning Society)
            </div>
          </div>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Vibe-a-thon:
            <br />
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent dark:from-orange-400 dark:to-amber-400">
              one challenge, endless energy.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Vibe-a-thon is a single, high‑energy coding challenge hosted by the Machine Learning Society (MLS). 
            Form a team, ship your best ideas in a focused time window, and show the community what you can build.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
            <Button size="lg" className="gap-2 text-base" asChild>
              <Link href="/auth/sign-up">
                Register for Vibe-a-thon
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
            <h3 className="text-lg font-semibold text-foreground">The Challenge</h3>
            <p className="mt-2 text-muted-foreground">
              A single themed brief with clear problem statements and judging criteria. 
              You get one shot to ideate, build, and submit your best solution.
            </p>
          </div>
          <div className="group rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-orange-500/30 hover:shadow-lg dark:bg-card/30">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Users className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Team Experience</h3>
            <p className="mt-2 text-muted-foreground">
              Form a team with friends or classmates, or join an existing one. 
              Mix skills across frontend, backend, ML, and product to cover all angles.
            </p>
          </div>
          <div className="group rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-orange-500/30 hover:shadow-lg dark:bg-card/30 sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="size-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Judging & Prizes</h3>
            <p className="mt-2 text-muted-foreground">
              Projects are evaluated by MLS mentors and industry guests with a transparent rubric. 
              Top teams earn recognition, prizes, and bragging rights.
            </p>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-24 rounded-2xl border border-border/60 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-transparent p-8 text-center sm:p-12 md:mt-32">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Ready to join Vibe-a-thon?
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
            Create an account, register your team, and get ready for a focused sprint of building, learning, 
            and vibing with the MLS community.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/auth/sign-up">
                Register now
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/sign-in">Already have an account?</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-24 border-t border-border/60 px-6 py-8 sm:px-8 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold text-foreground hover:opacity-80 transition-opacity"
              >
                <Trophy className="size-5" />
                Vibe-a-thon
              </Link>
              <p className="text-sm text-muted-foreground text-center sm:text-left">
                A single, high-energy coding challenge by MLS (Machine Learning Society).
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <div className="flex gap-6 text-sm text-muted-foreground">
                <Link href="/auth/sign-in" className="hover:text-foreground transition-colors">
                  Sign in
                </Link>
                <Link href="/auth/sign-up" className="hover:text-foreground transition-colors">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/60 text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Vibe-a-thon · Machine Learning Society (MLS).</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
