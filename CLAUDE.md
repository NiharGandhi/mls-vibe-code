# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint

# Database (Drizzle + Neon PostgreSQL)
npm run db:generate  # Generate migrations from schema changes
npm run db:migrate   # Run migrations
npm run db:push      # Push schema directly (dev shortcut)
npm run db:studio    # Open Drizzle Studio GUI
```

## Environment Variables

Required: `DATABASE_URL`, `BETTER_AUTH_BASE_URL` or `NEXT_PUBLIC_APP_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`.

Optional: `SMTP_FROM` (defaults to SMTP_USER), `APP_NAME` (defaults to "Vibe It").

**Email in production:** If email doesn’t work, check host logs for `[Email]` messages. Ensure `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASSWORD` are set in the production environment. Some hosts block outbound SMTP; try port 465 (TLS) or use a transactional provider (SendGrid, Resend, etc.) with their SMTP or API.

## Architecture

**Platform**: A challenge/hackathon management app where teams register for challenges, submit work, and get scored by admins.

**Stack**: Next.js 16 (App Router, RSC) + TypeScript + Tailwind CSS 4 (OKLch color system) + shadcn/ui (New York style) + Drizzle ORM + Neon PostgreSQL + Better Auth + TanStack React Query.

### Auth (Better Auth)

- Two user tables: Better Auth's `user` table (in `db/auth-schema.ts`) and the app's `users` table (in `db/schema.ts`). They stay synced via `lib/auth/sync-user.ts` — `upsertUserOnSignUp()` runs on signup, `syncUserToDb()` runs on signin.
- Auth config lives in `lib/auth.ts` (server) and `lib/auth-client.ts` (client).
- Session helper: `lib/auth/server.ts` exports `getSession()`.
- Auth API route: `app/api/auth/[...all]/route.ts` handles all Better Auth endpoints.
- Supports email/password + magic link (via Better Auth plugin). Email verification required.

### Database

- Schema split: `db/auth-schema.ts` (Better Auth tables) and `db/schema.ts` (domain tables).
- DB client: `db/index.ts` creates Neon HTTP client + Drizzle instance.
- Core entities: `users`, `teams`, `teamMembers`, `teamInvites`, `teamJoinRequests`, `challenges`, `submissions`, `notifications`, `conversations`, `messages`, `adminUsers`, `challengeRoles`, `settings`.
- Join tables use composite primary keys (e.g., `teamId + userId`).
- Soft deletes via `removedAt` timestamp on team members.

### API Routes

Pattern: `app/api/<resource>/route.ts` with `force-dynamic`, session check (401 if missing), try-catch, JSON responses.

- `app/api/team/` — Team CRUD
- `app/api/challenges/` — Challenge join/leave
- `app/api/admin/` — Admin operations (challenges, users, teams, submissions, notifications)
- `app/api/notifications/` — User notification endpoints
- `app/api/join-request/` — Team join request responses

### Domain Logic (lib/)

Business logic is in `lib/` files, not in API routes:
- `lib/team.ts` — Team operations, membership, join requests
- `lib/challenge.ts` — Challenge queries and joins
- `lib/notifications.ts` — Notification creation and broadcasting
- `lib/admin.ts` — Role checking (super_admin, organizer, judge, mentor) and permission helpers (`canManageChallenges()`, `canManageUsers()`, etc.)
- `lib/admin-submissions.ts`, `lib/admin-teams.ts` — Admin-specific operations
- `lib/email.ts` — Nodemailer SMTP transport, verification/welcome emails
- `lib/rate-limit.ts` — In-memory rate limiting for verification resends (60s window)

### Frontend

- Root layout (`app/layout.tsx`) wraps with `Providers` (React Query) + `SidebarLayout`.
- `app/providers.tsx` — QueryClient with 60s staleTime.
- `components/ui/` — shadcn components. `components/` root has app-level components (AppSidebar, UserMenu, ProfileCard, NotificationCard, Background, MarkdownContent).
- Path alias: `@/*` maps to project root.
- `lib/utils.ts` exports `cn()` (clsx + tailwind-merge).

### Admin Authorization

Two levels: global roles in `adminUsers` table and per-challenge roles in `challengeRoles` table. Permission helpers in `lib/admin.ts`.
