"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  updateUser,
  changePassword,
  listSessions,
  revokeSession,
  revokeOtherSessions,
  deleteUser,
} from "@/lib/auth-client";
import { updateAppProfile } from "@/lib/auth/sync-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRESET_AVATAR_URLS } from "@/lib/avatar-presets";
import { Loader2, Monitor, Trash2, UserCircle, Shield, User, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

type User = { id: string; name?: string; email?: string };
type Profile = {
  name?: string;
  email?: string;
  imageUrl?: string | null;
  yearOfStudy?: string;
  majorOfStudy?: string;
  dob?: string;
};

type SettingsTab = "profile" | "security" | "account";

export function SettingsContent({
  user,
  initialProfile,
}: {
  user: User;
  initialProfile?: Profile;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [name, setName] = useState(initialProfile?.name ?? user.name ?? "");
  const [yearOfStudy, setYearOfStudy] = useState(initialProfile?.yearOfStudy ?? "");
  const [majorOfStudy, setMajorOfStudy] = useState(initialProfile?.majorOfStudy ?? "");
  const [dob, setDob] = useState(initialProfile?.dob ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(initialProfile?.imageUrl ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [savingPreset, setSavingPreset] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sessions, setSessions] = useState<Array<{ token: string; userAgent?: string; expiresAt?: Date }>>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    const { data } = await listSessions();
    setSessions(
      Array.isArray(data)
        ? data.map((s) => ({
            token: s.token,
            userAgent: s.userAgent ?? undefined,
            expiresAt: s.expiresAt,
          }))
        : []
    );
    setSessionsLoading(false);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setProfileSaving(true);
    try {
      await updateUser({ name: name.trim() || undefined });
      const result = await updateAppProfile({
        yearOfStudy: yearOfStudy.trim() || undefined,
        majorOfStudy: majorOfStudy.trim() || undefined,
        dob: dob.trim() || undefined,
      });
      if (!result.ok) {
        setProfileError(result.error ?? "Failed to update profile");
        return;
      }
      setProfileSuccess(true);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/account/avatar", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAvatarError(data.error ?? "Upload failed.");
        return;
      }
      setImageUrl(data.imageUrl ?? null);
      await queryClient.invalidateQueries({ queryKey: ["account-profile"] });
      router.refresh();
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleSelectPresetAvatar = async (url: string) => {
    setAvatarError(null);
    setSavingPreset(url);
    try {
      const result = await updateAppProfile({ imageUrl: url });
      if (!result.ok) {
        setAvatarError(result.error ?? "Failed to update avatar.");
        return;
      }
      setImageUrl(url);
      await queryClient.invalidateQueries({ queryKey: ["account-profile"] });
      router.refresh();
    } finally {
      setSavingPreset(null);
    }
  };

  const handleRevokeSession = async (token: string) => {
    setRevokingToken(token);
    await revokeSession({ token });
    setSessions((prev) => prev.filter((s) => s.token !== token));
    setRevokingToken(null);
  };

  const handleRevokeOtherSessions = async () => {
    setSessionsLoading(true);
    await revokeOtherSessions();
    await loadSessions();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    setPasswordLoading(true);
    const { error } = await changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setPasswordLoading(false);
    if (error) {
      setPasswordError(error.message ?? "Failed to change password");
      return;
    }
    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirm !== "DELETE") {
      setDeleteError('Type "DELETE" to confirm');
      return;
    }
    setDeleteError(null);
    setDeleteLoading(true);
    const { error } = await deleteUser({
      password: deletePassword,
      callbackURL: "/",
    });
    setDeleteLoading(false);
    if (error) {
      setDeleteError(error.message ?? "Failed to delete account");
      return;
    }
    router.push("/");
    router.refresh();
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "account", label: "Account", icon: UserCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === "profile" && (
        <div className="space-y-8">
          {/* Profile picture – centered, clear hierarchy */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted ring-4 ring-muted/50">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Profile" className="size-full object-cover" />
                  ) : (
                    <User className="size-14 text-muted-foreground" />
                  )}
                  {avatarUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/90">
                      <Loader2 className="size-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-col items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={avatarUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="size-4 mr-2" />
                    {avatarUploading ? "Uploading…" : "Upload photo"}
                  </Button>
                  <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or GIF · Max 3MB</p>
                </div>
              </div>
              {avatarError && (
                <p className="mt-3 text-center text-sm text-destructive">{avatarError}</p>
              )}
              <div className="mt-8 border-t border-border pt-6">
                <p className="mb-3 text-center text-sm font-medium text-foreground">
                  Or choose an avatar
                </p>
                <div className="grid grid-cols-5 gap-3 sm:grid-cols-6 md:grid-cols-8">
                  {PRESET_AVATAR_URLS.map((url) => {
                    const isSelected = imageUrl === url;
                    const isSaving = savingPreset === url;
                    return (
                      <button
                        key={url}
                        type="button"
                        onClick={() => handleSelectPresetAvatar(url)}
                        disabled={!!savingPreset}
                        className={cn(
                          "relative flex aspect-square w-full overflow-hidden rounded-full border-2 transition-all",
                          isSelected
                            ? "border-primary ring-2 ring-primary/40"
                            : "border-border hover:border-muted-foreground/60 hover:scale-105",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        )}
                      >
                        <img src={url} alt="" className="size-full object-cover" />
                        {isSaving && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80">
                            <Loader2 className="size-5 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile details – 2-col grid, compact */}
          <Card>
            <CardHeader>
              <CardTitle>Profile details</CardTitle>
              <CardDescription>
                Your name and info. Changes are saved when you click Save.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileSubmit}>
              <CardContent className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={profileSaving}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={user.email ?? ""}
                      disabled
                      className="h-10 bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="yearOfStudy">Year of study</Label>
                    <Select
                      value={yearOfStudy}
                      onValueChange={setYearOfStudy}
                      disabled={profileSaving}
                    >
                      <SelectTrigger id="yearOfStudy" className="h-10 w-full">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st">1st year</SelectItem>
                        <SelectItem value="2nd">2nd year</SelectItem>
                        <SelectItem value="3rd">3rd year</SelectItem>
                        <SelectItem value="4th">4th year</SelectItem>
                        <SelectItem value="5th+">5th year or more</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="majorOfStudy">Major / course</Label>
                    <Input
                      id="majorOfStudy"
                      value={majorOfStudy}
                      onChange={(e) => setMajorOfStudy(e.target.value)}
                      placeholder="e.g. CIT, CSEC"
                      disabled={profileSaving}
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="max-w-xs space-y-2">
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    disabled={profileSaving}
                    className="h-10"
                  />
                </div>
                {profileError && (
                  <p className="text-sm text-destructive">{profileError}</p>
                )}
                {profileSuccess && (
                  <p className="text-sm text-green-600 dark:text-green-400">Profile updated.</p>
                )}
              </CardContent>
              <CardFooter className="border-t border-border pt-6">
                <Button type="submit" disabled={profileSaving}>
                  {profileSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Save profile"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* Security tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>Devices where you are signed in. Revoke any you don’t recognize.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
              {!sessions.length && !sessionsLoading && (
                <p className="text-sm text-muted-foreground">No other sessions found.</p>
              )}
              {sessionsLoading && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Loading…
                </p>
              )}
              {sessions.length > 0 && (
                <ul className="space-y-3">
                  {sessions.map((s) => (
                    <li
                      key={s.token}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <Monitor className="size-4 text-muted-foreground" />
                        {s.userAgent ?? "Unknown device"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(s.token)}
                        disabled={revokingToken === s.token}
                      >
                        {revokingToken === s.token ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "Revoke"
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              {sessions.length > 1 && (
                <Button variant="outline" size="sm" onClick={handleRevokeOtherSessions} disabled={sessionsLoading}>
                  Revoke all other sessions
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>Use a strong password. Other sessions will be signed out.</CardDescription>
            </CardHeader>
            <form onSubmit={handleChangePassword}>
              <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={passwordLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                disabled={passwordLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={passwordLoading}
              />
            </div>
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-sm text-green-600 dark:text-green-400">Password updated.</p>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={passwordLoading} className="mt-2">
                  {passwordLoading ? <Loader2 className="size-4 animate-spin" /> : "Change password"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {activeTab === "account" && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Delete account</CardTitle>
            <CardDescription>
              Permanently delete your account and all data. This cannot be undone.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleDeleteAccount}>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Type <strong>DELETE</strong> below and enter your password to confirm.
              </p>
              <div className="grid gap-2">
                <Label htmlFor="deleteConfirm">Type DELETE</Label>
                <Input
                  id="deleteConfirm"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  disabled={deleteLoading}
                  className="font-mono"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deletePassword">Your password</Label>
                <Input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  disabled={deleteLoading}
                />
              </div>
              {deleteError && (
                <p className="text-sm text-destructive">{deleteError}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                variant="destructive"
                disabled={deleteLoading || deleteConfirm !== "DELETE"}
                className="mt-2"
              >
                {deleteLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="size-4" /> Delete account
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
