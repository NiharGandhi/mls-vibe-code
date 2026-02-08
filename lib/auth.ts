import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, users as appUsers } from "@/db";
import { user, session, account, verification } from "@/db/auth-schema";
import { eq } from "drizzle-orm";
import { sendVerificationEmail, sendWelcomeEmail, sendEmail } from "@/lib/email";

// Fallback only for build/dev when env is unset; production must set BETTER_AUTH_SECRET.
const authSecret =
  process.env.BETTER_AUTH_SECRET || "dev-build-secret-not-for-production";

// Only allow sign-up from this email domain (e.g. "rit.edu" → only @rit.edu).
const allowedEmailDomain =
  process.env.ALLOWED_EMAIL_DOMAIN ?? "rit.edu";
const allowedDomainSuffix = allowedEmailDomain.startsWith("@")
  ? allowedEmailDomain
  : `@${allowedEmailDomain}`;

export const auth = betterAuth({
  secret: authSecret,
  baseURL: process.env.BETTER_AUTH_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  user: {
    deleteUser: {
      enabled: true,
      async afterDelete(u) {
        await db.delete(appUsers).where(eq(appUsers.id, u.id));
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user: u, url }) => {
      await sendVerificationEmail(u.email, url, u.name);
    },
    afterEmailVerification: async (u) => {
      await sendWelcomeEmail(u.email, u.name);
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const email = ctx.body?.email;
      const isSignUp = ctx.path === "/sign-up/email";
      const isMagicLink = ctx.path === "/sign-in/magic-link";
      if (!isSignUp && !isMagicLink) return;
      if (!email || typeof email !== "string") return;
      const normalized = email.trim().toLowerCase();
      if (!normalized.endsWith(allowedDomainSuffix.toLowerCase())) {
        throw new APIError("BAD_REQUEST", {
          message: `Only ${allowedDomainSuffix} email addresses can sign up.`,
        });
      }
    }),
  },
  plugins: [
    magicLink({
      async sendMagicLink(data) {
        await sendEmail({
          to: data.email,
          subject: "Sign in to your account",
          text: `Click the link below to sign in:\n\n${data.url}\n\nIf you didn't request this, you can ignore this email.`,
          html: `<p>Click the link below to sign in:</p><p><a href="${data.url}">Sign in</a></p><p>If you didn't request this, you can ignore this email.</p>`,
        });
      },
    }),
    nextCookies(),
  ],
});
