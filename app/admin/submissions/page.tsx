import { getSession } from "@/lib/auth/server";
import { getAdminRole, canJudgeSubmissions } from "@/lib/admin";
import { getAllSubmissionsForAdmin } from "@/lib/admin-submissions";
import { redirect } from "next/navigation";
import { AdminSubmissionsList } from "./AdminSubmissionsList";

export default async function AdminSubmissionsPage() {
  const { data: session } = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const role = await getAdminRole(session.user.id);
  if (!role || !canJudgeSubmissions(role)) redirect("/admin");

  const submissions = await getAllSubmissionsForAdmin();

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Submissions
        </h1>
        <p className="mt-1 text-muted-foreground">
          Review submissions and update status, score, and feedback
        </p>
      </header>

      <AdminSubmissionsList submissions={submissions} />
    </div>
  );
}
