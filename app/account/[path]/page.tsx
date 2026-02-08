import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { AccountContent } from "./AccountContent";

export const dynamicParams = true;

export default async function AccountPage() {
  const { data: session } = await getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return (
    <main className="container p-4 md:p-6">
      <AccountContent user={session.user} />
    </main>
  );
}
