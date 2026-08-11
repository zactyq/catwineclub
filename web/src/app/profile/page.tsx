import Link from "next/link";
import { redirect } from "next/navigation";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { getViewer } from "@/lib/access";
import { getApprovedApplication } from "@/lib/data/applications";
import { listClaimsForMember } from "@/lib/data/wines";
import { listSignupsForMember } from "@/lib/data/events";
import { listReviewsForMember, listPhotosForMember } from "@/lib/data/eventContent";
import { attachmentUrl } from "@/lib/nocodb";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ProfilePage() {
  const viewer = await getViewer();
  if (viewer.status !== "member") {
    redirect("/login");
  }

  const [application, claims, signups, reviews, photos] = await Promise.all([
    getApprovedApplication(viewer.email),
    listClaimsForMember(viewer.email),
    listSignupsForMember(viewer.email),
    listReviewsForMember(viewer.email),
    listPhotosForMember(viewer.email),
  ]);

  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-12 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-heading-lg text-heading-charcoal">
          {application?.Name ?? viewer.email}
        </h1>
        <p className="text-caption text-muted-gray">
          {viewer.email}
          {viewer.isAdmin && " · Admin"}
          {application?.ReviewedAt && ` · Member since ${formatDate(application.ReviewedAt)}`}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-subheading font-medium text-heading-charcoal">
          Wines You&apos;ve Bought ({claims.length})
        </h2>
        {claims.length === 0 ? (
          <p className="text-caption text-body-brown">
            Nothing yet —{" "}
            <Link href="/group-buy" className="text-ember-orange underline underline-offset-2">
              browse group buys
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {claims.map((c) => (
              <div
                key={c.Id}
                className="flex items-center justify-between rounded-cards bg-white px-4 py-3 shadow-subtle"
              >
                <span className="text-caption text-heading-charcoal">{c.wineName}</span>
                <span className="text-micro text-muted-gray">
                  {c.Quantity} bottle{c.Quantity === 1 ? "" : "s"} · {formatDate(c.CreatedAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-subheading font-medium text-heading-charcoal">
          Events You&apos;ve Joined ({signups.length})
        </h2>
        {signups.length === 0 ? (
          <p className="text-caption text-body-brown">
            Nothing yet —{" "}
            <Link href="/events" className="text-ember-orange underline underline-offset-2">
              see what&apos;s coming up
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {signups.map((s) => (
              <Link
                key={s.Id}
                href={`/events/${s.EventId}`}
                className="flex items-center justify-between rounded-cards bg-white px-4 py-3 shadow-subtle hover:opacity-80"
              >
                <span className="text-caption text-heading-charcoal">{s.eventTitle}</span>
                <span className="text-micro text-muted-gray">
                  {s.eventDate && formatDate(s.eventDate)}
                  {s.PlusOnes > 0 ? ` · +${s.PlusOnes}` : ""}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-subheading font-medium text-heading-charcoal">
          Wines You&apos;ve Rated ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-caption text-body-brown">
            Rate a wine from the &ldquo;Wines From This Tasting&rdquo; section on any past event
            page.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {reviews.map((r) => (
              <Link
                key={r.Id}
                href={`/events/${r.eventId}`}
                className="flex flex-col gap-1 rounded-cards bg-white px-4 py-3 shadow-subtle hover:opacity-80"
              >
                <div className="flex items-center justify-between">
                  <span className="text-caption font-medium text-heading-charcoal">
                    {r.wineName}
                  </span>
                  <span className="text-micro text-heading-charcoal">
                    {"★".repeat(r.Rating)}
                    {"☆".repeat(5 - r.Rating)}
                  </span>
                </div>
                <span className="text-micro text-muted-gray">{r.eventTitle}</span>
                {r.Comment && <p className="text-caption text-body-brown">{r.Comment}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-subheading font-medium text-heading-charcoal">
          Photos You&apos;ve Uploaded ({photos.length})
        </h2>
        {photos.length === 0 ? (
          <p className="text-caption text-body-brown">
            Add some from any past event&apos;s photo section.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((p) =>
              p.Photo?.[0] ? (
                <Link key={p.Id} href={`/events/${p.EventId}`} className="flex flex-col gap-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element -- self-hosted NocoDB */}
                  <img
                    src={attachmentUrl(p.Photo[0])}
                    alt={p.Caption ?? p.eventTitle}
                    className="aspect-square w-full rounded-cards object-cover"
                  />
                  <span className="text-micro text-muted-gray">{p.eventTitle}</span>
                </Link>
              ) : (
                <ImagePlaceholder key={p.Id} label={p.eventTitle} className="aspect-square w-full" />
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
