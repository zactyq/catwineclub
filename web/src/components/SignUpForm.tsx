"use client";

import { useActionState } from "react";
import { signUpForEventAction, type SignupState } from "@/app/events/actions";

export default function SignUpForm({
  eventId,
  spotsRemaining,
}: {
  eventId: number;
  spotsRemaining: number;
}) {
  const boundAction = signUpForEventAction.bind(null, eventId);
  const [state, formAction, pending] = useActionState<SignupState, FormData>(
    boundAction,
    {}
  );

  if (state.success) {
    return <p className="text-caption font-medium text-grass-green">You&apos;re in! 🎉</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-caption text-body-brown">
        Plus-ones
        <input
          name="plusOnes"
          type="number"
          min={0}
          max={Math.max(0, spotsRemaining - 1)}
          defaultValue={0}
          className="w-16 rounded-cards border border-stone-border bg-cream-canvas px-2 py-1.5 text-caption text-heading-charcoal outline-none focus:border-ink-black"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-buttons bg-ink-black px-3.5 py-2 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Signing up…" : "Sign Up"}
      </button>
      {state.error && <p className="text-micro text-alert-red">{state.error}</p>}
    </form>
  );
}
