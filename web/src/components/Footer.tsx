import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto w-full bg-stone-surface">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-3">
          <span className="font-display text-heading text-heading-charcoal">
            Catwine Club
          </span>
          <p className="max-w-xs text-caption text-body-brown">
            Wine, cats, and good company.
          </p>
        </div>

        <div className="flex flex-wrap gap-12">
          <div className="flex flex-col gap-3">
            <span className="text-caption font-medium text-heading-charcoal">
              Club
            </span>
            <Link href="/" className="text-caption text-body-brown hover:text-heading-charcoal">
              About Us
            </Link>
            <Link href="/events" className="text-caption text-body-brown hover:text-heading-charcoal">
              Events
            </Link>
            <Link href="/group-buy" className="text-caption text-body-brown hover:text-heading-charcoal">
              Group Buy
            </Link>
            <Link href="/apply" className="text-caption text-body-brown hover:text-heading-charcoal">
              Apply to Join
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-caption font-medium text-heading-charcoal">
              Connect
            </span>
            <span className="text-caption text-muted-gray">Instagram</span>
            <span className="text-caption text-muted-gray">Email</span>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-4 pb-8 sm:px-6">
        <p className="text-micro text-muted-gray">
          © {new Date().getFullYear()} Catwine Club. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
