"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("sending");
        setError(null);
        const { error } = await authClient.signIn.magicLink({
          email,
          callbackURL: window.location.origin + "/",
        });
        if (error) {
          setStatus("error");
          setError(error.message ?? "Something went wrong. Try again.");
          return;
        }
        setStatus("sent");
      }}
    >
      {status === "sent" ? (
        <p className="rounded-cards bg-white p-6 text-body text-body-brown shadow-subtle">
          Check <span className="font-medium text-heading-charcoal">{email}</span> for a
          sign-in link. It expires in 10 minutes.
        </p>
      ) : (
        <>
          <label className="flex flex-col gap-2 text-left">
            <span className="text-caption font-medium text-heading-charcoal">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-cards border border-stone-border bg-white px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
            />
          </label>
          {error && <p className="text-caption text-alert-red">{error}</p>}
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-buttons bg-ink-black px-3.5 py-2.5 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Send Sign-In Link"}
          </button>
        </>
      )}
    </form>
  );
}
