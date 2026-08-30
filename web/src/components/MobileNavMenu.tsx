"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Group Buy", href: "/group-buy" },
  { label: "Rules", href: "/rules" },
];

export default function MobileNavMenu({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Toggle navigation menu"
        className="flex flex-col gap-1 rounded-buttons p-2 transition-opacity hover:opacity-70"
      >
        <span className="block h-0.5 w-5 bg-heading-charcoal" />
        <span className="block h-0.5 w-5 bg-heading-charcoal" />
        <span className="block h-0.5 w-5 bg-heading-charcoal" />
      </button>

      {open && (
        <nav className="absolute top-full right-0 mt-2 flex w-48 flex-col gap-1 rounded-cards bg-white p-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-cards px-3 py-2 text-caption text-heading-charcoal transition-opacity hover:opacity-70"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="rounded-cards px-3 py-2 text-caption text-ember-orange transition-opacity hover:opacity-70"
            >
              Admin
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
