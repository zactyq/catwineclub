"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      className={className}
      onClick={async () => {
        await authClient.signOut();
        router.refresh();
      }}
    >
      Sign Out
    </button>
  );
}
