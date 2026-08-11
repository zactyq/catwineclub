import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isApprovedMember } from "@/lib/data/applications";
import { isAdminInRoster } from "@/lib/data/admins";

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

/**
 * Emails in ADMIN_EMAILS are permanent admins that can't be removed via the
 * UI — a safety net so the club can't accidentally lock itself out.
 */
export function isAdminEmail(email: string): boolean {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

/** Combines the permanent env allowlist with admins added via /admin. */
export async function isAdmin(email: string): Promise<boolean> {
  if (isAdminEmail(email)) return true;
  return isAdminInRoster(email);
}

export type Viewer =
  | { status: "signed-out" }
  | { status: "member"; email: string; isAdmin: boolean; isApproved: boolean };

/** Resolves the current session into the roles the app cares about. */
export async function getViewer(): Promise<Viewer> {
  const user = await getCurrentUser();
  if (!user?.email) return { status: "signed-out" };
  const [isApproved, isAdminResult] = await Promise.all([
    isApprovedMember(user.email),
    isAdmin(user.email),
  ]);
  return {
    status: "member",
    email: user.email,
    isAdmin: isAdminResult,
    isApproved,
  };
}
