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

export default function RulesPage() {
  return (
    <section className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-16 sm:px-6">
      <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-3 text-center">
        <span className="text-caption font-medium text-ember-orange">
          Read Before You Join
        </span>
        <h1 className="font-display text-heading-lg text-heading-charcoal">
          Rules &amp; Guidelines
        </h1>
        <p className="text-body text-body-brown">
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
            <h2 className="text-subheading font-medium text-heading-charcoal">
              {section.title}
            </h2>
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
  );
}
