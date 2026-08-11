"use client";

import { useActionState } from "react";
import { claimWineAction, type ClaimState } from "@/app/group-buy/actions";

export default function ClaimForm({
  wineId,
  quantityRemaining,
}: {
  wineId: number;
  quantityRemaining: number;
}) {
  const boundAction = claimWineAction.bind(null, wineId);
  const [state, formAction, pending] = useActionState<ClaimState, FormData>(
    boundAction,
    {}
  );

  if (state.success) {
    return <p className="text-caption font-medium text-grass-green">Claimed! 🍷</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          name="quantity"
          type="number"
          min={1}
          max={quantityRemaining}
          defaultValue={1}
          className="w-16 rounded-cards border border-stone-border bg-cream-canvas px-2 py-1.5 text-caption text-heading-charcoal outline-none focus:border-ink-black"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-buttons bg-ink-black px-3.5 py-2 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Claiming…" : "Claim"}
        </button>
      </div>
      {state.error && <p className="text-micro text-alert-red">{state.error}</p>}
    </form>
  );
}
