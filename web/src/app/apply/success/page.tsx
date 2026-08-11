import Link from "next/link";

export default function ApplySuccessPage() {
  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center gap-5 px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-heading-lg text-heading-charcoal">
        Application received
      </h1>
      <p className="max-w-sm text-body text-body-brown">
        Thanks for applying! An admin will review it and reach out once
        you&apos;re approved. In the meantime, feel free to sign in — you
        can browse once you&apos;re a member.
      </p>
      <Link
        href="/login"
        className="rounded-buttons bg-ink-black px-3.5 py-2.5 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90"
      >
        Sign In
      </Link>
    </section>
  );
}
