import Image from "next/image";
import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { getViewer } from "@/lib/access";
import { listWines } from "@/lib/data/wines";

const featureCards = [
  {
    heading: "Group Buys",
    body: "Members and admins post wine deals — original price, discount, vintage, quantity — and everyone claims a share on a first-come, first-served basis.",
    linkLabel: "Browse group buys",
    href: "/group-buy",
  },
  {
    heading: "Events & Tastings",
    body: "Small-group tastings, member-run dinners, and the occasional guest sommelier. Sign up for yourself and your plus-ones in a couple of taps.",
    linkLabel: "See upcoming events",
    href: "/events",
  },
  {
    heading: "Rules & Guidelines",
    body: "Casual, inclusive, and mostly self-policing — the yellow card system, BYOB etiquette, and how to get more involved.",
    linkLabel: "Read the rules",
    href: "/rules",
  },
];

export default async function HomePage() {
  const [viewer, wines] = await Promise.all([getViewer(), listWines()]);
  const openWines = wines
    .filter((w) => w.Status === "open" && w.quantityRemaining > 0)
    .slice(0, 3);
  const isSignedIn = viewer.status === "member";

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-8 px-4 pt-16 pb-20 sm:px-6 md:grid-cols-[1fr_minmax(0,2fr)_1fr] md:gap-4 md:pt-24 md:pb-28">
        <Image
          src="/hero-cat-left.png"
          alt="Illustrated cat lounging beside a glass of red wine"
          width={1254}
          height={1254}
          priority
          className="hidden aspect-square w-full rounded-illustration object-cover md:block"
        />

        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-2xl font-display text-heading-lg text-heading-charcoal md:text-display">
            Where wine lovers (and their cats) gather
          </h1>
          <p className="max-w-md text-body text-body-brown">
            Tastings, group buys, and the occasional bit of chaos — all fuelled
            by good wine, good company, and (ideally) a cat nearby.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {!isSignedIn && (
              <Link
                href="/apply"
                className="rounded-buttons bg-ink-black px-3.5 py-2.5 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90"
              >
                Join the Club
              </Link>
            )}
            <Link
              href="/events"
              className={`rounded-buttons px-3.5 py-2.5 text-caption font-semibold transition-opacity hover:opacity-90 ${
                isSignedIn
                  ? "bg-ink-black text-cream-canvas"
                  : "bg-sand-surface text-ink-black"
              }`}
            >
              See What&apos;s Coming
            </Link>
          </div>
        </div>

        <Image
          src="/hero-cat-right.png"
          alt="Illustrated cat reaching for a glass of red wine on a table"
          width={1254}
          height={1254}
          priority
          className="hidden aspect-square w-full rounded-illustration object-cover md:block"
        />
      </section>

      {/* Open right now */}
      <section className="mx-auto w-full max-w-[1200px] px-4 py-20 sm:px-6">
        <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-caption font-medium text-ember-orange">
            Open Right Now
          </span>
          <h2 className="font-display text-heading-lg text-heading-charcoal">
            This week&apos;s group buys
          </h2>
        </div>

        {openWines.length === 0 ? (
          <p className="text-center text-body text-body-brown">
            Nothing open at the moment —{" "}
            <Link href="/group-buy" className="text-ember-orange underline underline-offset-2">
              check the group buy page
            </Link>{" "}
            for what&apos;s coming next.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {openWines.map((wine) => (
              <div
                key={wine.Id}
                className="flex flex-col gap-3 rounded-cards bg-white p-6 shadow-subtle"
              >
                <ImagePlaceholder label={wine.WineName} className="aspect-[4/3] w-full" />
                <div>
                  <h3 className="text-heading font-medium text-heading-charcoal">
                    {wine.WineName}
                  </h3>
                  {wine.Vintage && (
                    <p className="text-caption text-muted-gray">{wine.Vintage}</p>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  {wine.DiscountedPrice != null && (
                    <span className="text-subheading font-medium text-heading-charcoal">
                      ${wine.DiscountedPrice.toFixed(2)}
                    </span>
                  )}
                  {wine.OriginalPrice != null && (
                    <span className="text-caption text-muted-gray line-through">
                      ${wine.OriginalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-micro text-muted-gray">
                  {wine.quantityRemaining} of {wine.QuantityAvailable} left
                </p>
                <Link
                  href="/group-buy"
                  className="w-fit text-caption text-ember-orange underline underline-offset-2"
                >
                  Claim it
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feature grid */}
      <section className="mx-auto w-full max-w-[1200px] px-4 py-20 sm:px-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {featureCards.map((card) => (
            <div
              key={card.heading}
              className="flex flex-col gap-3 rounded-cards bg-white p-8 shadow-subtle"
            >
              <h3 className="text-heading font-medium text-heading-charcoal">
                {card.heading}
              </h3>
              <p className="text-body text-body-brown">{card.body}</p>
              <Link
                href={card.href}
                className="mt-1 w-fit text-caption text-ember-orange underline underline-offset-2"
              >
                {card.linkLabel}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      {!isSignedIn && (
        <section className="w-full bg-stone-surface">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-5 px-4 py-24 text-center sm:px-6">
            <h2 className="font-display text-heading-lg text-heading-charcoal">
              Ready to join?
            </h2>
            <p className="max-w-sm text-body text-body-brown">
              Tell us a bit about yourself and we&apos;ll take it from there.
            </p>
            <Link
              href="/apply"
              className="rounded-buttons bg-ink-black px-3.5 py-2.5 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90"
            >
              Apply to Join
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
