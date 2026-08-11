import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";

export default function WineAgentPage() {
  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center sm:px-6">
      <ImagePlaceholder
        label="Illustration: wine agent mascot"
        className="aspect-square w-40"
      />
      <span className="rounded-badges bg-honey/30 px-2 py-1 text-micro text-heading-charcoal">
        Coming Soon
      </span>
      <h1 className="max-w-md font-display text-heading-lg text-heading-charcoal">
        Meet the Wine Sales Agent
      </h1>
      <p className="max-w-md text-body text-body-brown">
        Ask for recommendations based on what you like, or check stock and
        pricing on anything currently listed for group buy. We&apos;re still
        pouring this one — check back soon.
      </p>
      <Link
        href="/group-buy"
        className="rounded-buttons bg-ink-black px-3.5 py-2.5 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90"
      >
        Browse Group Buys in the Meantime
      </Link>
    </section>
  );
}
