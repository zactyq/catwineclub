import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";

const featureCards = [
  {
    heading: "Group Buys",
    body: "Admins and members post wine deals — original price, discount, vintage, quantity — and everyone claims a share on a first-come, first-served basis.",
    linkLabel: "Browse group buys",
    href: "/group-buy",
  },
  {
    heading: "Events & Tastings",
    body: "See what's coming up, sign yourself and your plus-ones up in a couple of taps, and never miss a tasting because it scrolled off the group chat.",
    linkLabel: "See upcoming events",
    href: "/events",
  },
  {
    heading: "Wine Sales Agent",
    body: "Ask for recommendations or check stock and pricing on anything currently listed — coming soon.",
    linkLabel: "Meet the agent",
    href: "/wine-agent",
  },
];

const rulesSections = [
  {
    title: "1. Good Vibes & Event Conduct",
    items: [
      "Respect the Hosts: While the Exco manages the club channels, our amazing event hosts put in the hard work to set up and dictate the rules for their specific events. Remember we are a wine appreciation club for all — do respect each other, keep everyone comfortable, and be as inclusive as possible.",
      "Pace Yourself: We want everyone to have a great time, so please pace yourself! Try not to get too drunk, carted out, or sick. And for the party animals, there's always space for you guys to go wild at your own “round twos” after the event proper.",
      "Buddy System: If we see our friends getting a bit too rowdy, let's help them get home ASAP — it keeps them safe and maintains a respectable environment for everyone else.",
      "Accountability & “OOPS” Fees: Accidents happen! If you make a mess, please clean it up. If you break a glass, there's an ‘OOPS’ fee — please offer to pay for it. If feelings get hurt, please make peace before the next event.",
      "BYOB Etiquette: For BYOB days/events, please try your best to stay on theme and avoid bringing petrol station wine. Reach out to Isaac or Luke if you need help finding good bottles.",
    ],
  },
  {
    title: "2. The “Yellow Card” System",
    items: [
      "The Warning: If you get into trouble or cause a bit too much mischief, the event hosts have full authority to hand out a ‘yellow card’.",
      "Atonement: You can clear your name by asking for forgiveness, contributing to the CWC fund, organizing an upcoming event, or bringing a lovely bottle of Montrachet for the next gathering.",
      "Strike Two: Two yellow cards mean a red card. We'll gently ask you to sit out of events until you've recovered and are ready to rejoin us.",
    ],
  },
  {
    title: "3. Invites, Promos, & Socials",
    items: [
      "Growing the Community: Feel free to invite friends to the next event and sign up on their behalf — always ask for their consent first.",
      "Posting & Promos: Have a 3rd party event, promo, group buy, or want to jio people out for a drink? Feel free to post it in a respectful manner.",
      "Tag Us: Please help post and tag @catwineclub on IG — our social media game kinda sucks right now and we'd love the help!",
    ],
  },
  {
    title: "4. RSVPs & Group Housekeeping",
    items: [
      "Cancellations: If you can't make it to a paid event, please give a heads-up and try your best to find a replacement.",
      "Lurkers: Not your glass of wine? Feel free to leave the group, zero pressure. We do light housekeeping yearly on our anniversary to clear out inactive folks who haven't attended all year.",
    ],
  },
  {
    title: "5. Get Involved!",
    items: [
      "Have a great idea, want to run a wine event, or are interested in joining the Exco? Reach out to any of the Exco team (for now, that's Luke, Charis, and Isaac). We'll help you get set up, then hold a fun, not-so-secret internal vote to decide the fate of your event!",
    ],
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-8 px-4 pt-16 pb-20 sm:px-6 md:grid-cols-[1fr_minmax(0,2fr)_1fr] md:gap-4 md:pt-24 md:pb-28">
        <ImagePlaceholder
          label="Illustration: cat + wine mascot cluster (left)"
          className="hidden aspect-square w-full md:flex"
        />

        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-2xl font-display text-heading-lg text-heading-charcoal md:text-display">
            Where wine lovers (and their cats) gather
          </h1>
          <p className="max-w-md text-body text-body-brown">
            Cat Wine Club runs on group chats — deals scroll away, sign-ups get
            counted by hand. This is the one place to see what&apos;s on offer,
            claim an allocation, and sign up for events.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/apply"
              className="rounded-buttons bg-ink-black px-3.5 py-2.5 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90"
            >
              Join the Club
            </Link>
            <Link
              href="/events"
              className="rounded-buttons bg-sand-surface px-3.5 py-2.5 text-caption font-semibold text-ink-black transition-opacity hover:opacity-90"
            >
              See What&apos;s Coming
            </Link>
          </div>
        </div>

        <ImagePlaceholder
          label="Illustration: cat + wine mascot cluster (right)"
          className="hidden aspect-square w-full md:flex"
        />
      </section>

      {/* Our Story */}
      <section className="mx-auto w-full max-w-[1200px] px-4 py-20 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-caption font-medium text-ember-orange">
            The Problem
          </span>
          <h2 className="font-display text-heading-lg text-heading-charcoal">
            Wine deals shouldn&apos;t scroll away
          </h2>
          <p className="text-body text-body-brown">
            As the club grows, allocations get missed or double-counted and
            the admins spend their evenings on admin instead of on wine. CWC
            is an organising tool, not a shop — payment, collection, and
            delivery stay exactly as they are today, arranged directly
            between members and admins.
          </p>
        </div>
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

      {/* Rules & Guidelines */}
      <section className="mx-auto w-full max-w-[1200px] px-4 py-20 sm:px-6">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <span className="text-caption font-medium text-ember-orange">
            Read Before You Join
          </span>
          <h2 className="font-display text-heading-lg text-heading-charcoal">
            Rules &amp; Guidelines
          </h2>
          <p className="max-w-xl text-body text-body-brown">
            We are a casual, not-for-profit, non-registered community built
            purely for wine lovers. We do our absolute best to create an
            inclusive environment where new and experienced wine nerds feel
            comfortable and welcome!
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {rulesSections.map((section) => (
            <div
              key={section.title}
              className="flex flex-col gap-3 rounded-cards bg-white p-8 shadow-subtle"
            >
              <h3 className="text-subheading font-medium text-heading-charcoal">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {section.items.map((item, i) => (
                  <li key={i} className="text-caption text-body-brown">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
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
    </div>
  );
}
