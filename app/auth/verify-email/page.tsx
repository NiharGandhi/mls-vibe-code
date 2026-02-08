import { VerifyEmailContent } from "./VerifyEmailContent";

export const metadata = {
  title: "Verify your email",
  description: "Verify your email address to continue",
};

type SearchParams = Promise<{ email?: string; from?: string }>;

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email.trim() : "";
  const from = params.from === "signup" ? "signup" : "signin";

  return (
    <VerifyEmailContent email={email} from={from} />
  );
}
