import { redirect } from "next/navigation";

/** Profile is now part of Settings. Redirect to Settings (Profile tab). */
export default function ProfilePage() {
  redirect("/account/settings");
}
