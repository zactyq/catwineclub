"use client";

import { useActionState } from "react";
import { addReviewAction, type ReviewState } from "@/app/events/[id]/actions";

export default function ReviewForm({
  eventId,
  eventWineId,
}: {
  eventId: number;
  eventWineId: number;
}) {
  const boundAction = addReviewAction.bind(null, eventId, eventWineId);
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(
    boundAction,
    {}
  );

  if (state.success) {
    return <p className="text-micro font-medium text-grass-green">Score added — thanks!</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          name="score"
          type="number"
          min={0}
          max={100}
          defaultValue={90}
          required
          className="w-20 rounded-cards border border-stone-border bg-cream-canvas px-2 py-1.5 text-caption text-heading-charcoal outline-none focus:border-ink-black"
        />
        <span className="text-micro text-muted-gray">/ 100</span>
        <input
          name="comment"
          type="text"
          placeholder="Optional note"
          className="flex-1 rounded-cards border border-stone-border bg-cream-canvas px-3 py-1.5 text-caption text-heading-charcoal outline-none focus:border-ink-black"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-buttons bg-ink-black px-3 py-1.5 text-micro font-semibold text-cream-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Score"}
        </button>
      </div>
      {state.error && <p className="text-micro text-alert-red">{state.error}</p>}
    </form>
  );
}
