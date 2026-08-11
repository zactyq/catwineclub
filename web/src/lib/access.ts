import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isApprovedMember } from "@/lib/data/applications";

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export function isAdminEmail(email: string): boolean {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export type Viewer =
  | { status: "signed-out" }
  | { status: "member"; email: string; isAdmin: boolean; isApproved: boolean };

/** Resolves the current session into the roles the app cares about. */
export async function getViewer(): Promise<Viewer> {
  const user = await getCurrentUser();
  if (!user?.email) return { status: "signed-out" };
  const isApproved = await isApprovedMember(user.email);
  return {
    status: "member",
    email: user.email,
    isAdmin: isAdminEmail(user.email),
    isApproved,
  };
}
