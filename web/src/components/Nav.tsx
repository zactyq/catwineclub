import Link from "next/link";
import type { Viewer } from "@/lib/access";
import SignOutButton from "@/components/SignOutButton";
import MobileNavMenu from "@/components/MobileNavMenu";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Group Buy", href: "/group-buy" },
  { label: "Rules", href: "/rules" },
];

export default function Nav({ viewer }: { viewer: Viewer }) {
  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-[1200px] px-4 sm:px-6">
      <div className="flex items-center justify-between rounded-nav bg-cream-canvas/95 px-4 py-3 shadow-subtle backdrop-blur-sm sm:px-5">
        <Link
          href="/"
          className="font-display text-heading text-heading-charcoal"
        >
          Catwine Club
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-caption text-heading-charcoal transition-opacity hover:opacity-70"
            >
              {link.label}
            </Link>
          ))}
          {viewer.status === "member" && viewer.isAdmin && (
            <Link
              href="/admin"
              className="text-caption text-ember-orange transition-opacity hover:opacity-70"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {viewer.status === "member" ? (
            <>
              <span
                className={`hidden rounded-badges px-2 py-1 text-micro sm:inline ${
                  viewer.isApproved
                    ? "bg-mint/20 text-heading-charcoal"
                    : "bg-honey/30 text-heading-charcoal"
                }`}
              >
                {viewer.isApproved ? "Member" : "Pending Approval"}
              </span>
              <Link
                href="/profile"
                className="rounded-buttons px-3.5 py-2 text-caption text-heading-charcoal transition-opacity hover:opacity-70"
              >
                Profile
              </Link>
              <SignOutButton className="rounded-buttons px-3.5 py-2 text-caption text-heading-charcoal transition-opacity hover:opacity-70" />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-buttons px-3.5 py-2 text-caption text-heading-charcoal transition-opacity hover:opacity-70"
              >
                Sign In
              </Link>
              <Link
                href="/apply"
                className="rounded-buttons bg-ink-black px-3.5 py-2 text-caption text-cream-canvas transition-opacity hover:opacity-90"
              >
                Join the Club
              </Link>
            </>
          )}
          <MobileNavMenu isAdmin={viewer.status === "member" && viewer.isAdmin} />
        </div>
      </div>
    </header>
  );
}
