"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type UserWithAdmin = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  adminRole: string | null;
};

interface AdminUsersListProps {
  users: UserWithAdmin[];
}

const adminRoleOptions = [
  { value: "none", label: "None" },
  { value: "organizer", label: "Organizer" },
  { value: "judge", label: "Judge" },
  { value: "mentor", label: "Mentor" },
  { value: "super_admin", label: "Super Admin" },
] as const;

export function AdminUsersList({ users: initialUsers }: AdminUsersListProps) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleRoleChange(userId: string, newRole: string) {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/admin-role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: newRole === "none" ? null : newRole,
        }),
      });
      if (res.ok) router.refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  if (initialUsers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">No users yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 font-medium text-foreground">User</th>
            <th className="px-4 py-3 font-medium text-foreground">Email</th>
            <th className="px-4 py-3 font-medium text-foreground">Role</th>
            <th className="px-4 py-3 font-medium text-foreground">Admin role</th>
            <th className="px-4 py-3 font-medium text-foreground">Joined</th>
          </tr>
        </thead>
        <tbody>
          {initialUsers.map((u) => (
            <tr key={u.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <span className="font-medium text-foreground">{u.name}</span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
              <td className="px-4 py-3">
                <span className="capitalize text-muted-foreground">{u.role}</span>
              </td>
              <td className="px-4 py-3">
                <select
                  value={u.adminRole ?? "none"}
                  disabled={updatingId === u.id}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className={cn(
                    "rounded border border-input bg-background px-2 py-1 text-xs",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                    (u.adminRole ?? "none") !== "none" && "font-medium text-primary"
                  )}
                >
                  {adminRoleOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
