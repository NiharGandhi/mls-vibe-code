import { redirect } from "next/navigation";

export const dynamicParams = false;

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  if (path === "sign-in") redirect("/auth/sign-in");
  if (path === "sign-up") redirect("/auth/sign-up");
  redirect("/auth/sign-in");
}
