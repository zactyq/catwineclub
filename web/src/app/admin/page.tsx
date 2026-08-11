import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer, isAdminEmail } from "@/lib/access";
import { listApplications } from "@/lib/data/applications";
import { listAdmins } from "@/lib/data/admins";
import { listFlaggedClaims } from "@/lib/data/wines";
import {
  addAdminAction,
  approveApplicationAction,
  approveRemovalAction,
  dismissRemovalAction,
  rejectApplicationAction,
  removeAdminAction,
} from "./actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminPage() {
  const viewer = await getViewer();
  if (viewer.status !== "member" || !viewer.isAdmin) {
    redirect("/");
  }

  const [pending, reviewed, admins, flaggedClaims] = await Promise.all([
    listApplications("pending"),
    listApplications(),
    listAdmins(),
    listFlaggedClaims(),
  ]);
  const alreadyReviewed = reviewed.filter((a) => a.Status !== "pending").slice(0, 10);

  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-12 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-heading-lg text-heading-charcoal">
          Admin
        </h1>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/group-buy/new"
            className="rounded-buttons bg-sand-surface px-3.5 py-2.5 text-caption font-semibold text-ink-black transition-opacity hover:opacity-90"
          >
            Post a Wine
          </Link>
          <Link
            href="/events/new"
            className="rounded-buttons bg-sand-surface px-3.5 py-2.5 text-caption font-semibold text-ink-black transition-opacity hover:opacity-90"
          >
            Create an Event
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-subheading font-medium text-heading-charcoal">
          Pending Applications ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-caption text-body-brown">Nothing waiting on review.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((app) => (
              <div
                key={app.Id}
                className="flex flex-col gap-3 rounded-cards bg-white p-6 shadow-subtle sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-body font-medium text-heading-charcoal">{app.Name}</p>
                  <p className="text-caption text-muted-gray">{app.Email}</p>
                  {app.Phone && <p className="text-caption text-muted-gray">{app.Phone}</p>}
                  {app.HowHeard && (
                    <p className="text-caption text-body-brown">Heard via: {app.HowHeard}</p>
                  )}
                  {app.Message && (
                    <p className="mt-1 text-caption text-body-brown">&ldquo;{app.Message}&rdquo;</p>
                  )}
                  <p className="text-micro text-muted-gray">Applied {formatDate(app.CreatedAt)}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={approveApplicationAction.bind(null, app.Id)}>
                    <button
                      type="submit"
                      className="rounded-buttons bg-ink-black px-3.5 py-2 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={rejectApplicationAction.bind(null, app.Id)}>
                    <button
                      type="submit"
                      className="rounded-buttons bg-stone-surface px-3.5 py-2 text-caption font-semibold text-heading-charcoal transition-opacity hover:opacity-90"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {alreadyReviewed.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-subheading font-medium text-heading-charcoal">
            Recently Reviewed
          </h2>
          <div className="flex flex-col gap-2">
            {alreadyReviewed.map((app) => (
              <div
                key={app.Id}
                className="flex items-center justify-between rounded-cards bg-stone-surface px-4 py-3"
              >
                <div>
                  <span className="text-caption font-medium text-heading-charcoal">
                    {app.Name}
                  </span>{" "}
                  <span className="text-caption text-muted-gray">{app.Email}</span>
                </div>
                <span
                  className={`rounded-badges px-2 py-1 text-micro ${
                    app.Status === "approved"
                      ? "bg-mint/20 text-heading-charcoal"
                      : "bg-alert-red/20 text-heading-charcoal"
                  }`}
                >
                  {app.Status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <h2 className="text-subheading font-medium text-heading-charcoal">
          Claim Removal Requests ({flaggedClaims.length})
        </h2>
        {flaggedClaims.length === 0 ? (
          <p className="text-caption text-body-brown">No pending requests.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {flaggedClaims.map((claim) => (
              <div
                key={claim.Id}
                className="flex flex-col gap-3 rounded-cards bg-white p-6 shadow-subtle sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-body font-medium text-heading-charcoal">
                    {claim.wineName}
                  </p>
                  <p className="text-caption text-muted-gray">
                    {claim.MemberEmail} — {claim.Quantity} bottle
                    {claim.Quantity === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={approveRemovalAction.bind(null, claim.Id)}>
                    <button
                      type="submit"
                      className="rounded-buttons bg-ink-black px-3.5 py-2 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90"
                    >
                      Remove Claim
                    </button>
                  </form>
                  <form action={dismissRemovalAction.bind(null, claim.Id)}>
                    <button
                      type="submit"
                      className="rounded-buttons bg-stone-surface px-3.5 py-2 text-caption font-semibold text-heading-charcoal transition-opacity hover:opacity-90"
                    >
                      Dismiss
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-subheading font-medium text-heading-charcoal">
          Admins
        </h2>
        <div className="flex flex-col gap-2">
          {process.env.ADMIN_EMAILS?.split(",")
            .map((e) => e.trim())
            .filter(Boolean)
            .map((email) => (
              <div
                key={email}
                className="flex items-center justify-between rounded-cards bg-stone-surface px-4 py-3"
              >
                <span className="text-caption text-heading-charcoal">{email}</span>
                <span className="rounded-badges bg-honey/30 px-2 py-1 text-micro text-heading-charcoal">
                  Permanent
                </span>
              </div>
            ))}
          {admins
            .filter((a) => !isAdminEmail(a.Email))
            .map((admin) => (
              <div
                key={admin.Id}
                className="flex items-center justify-between rounded-cards bg-stone-surface px-4 py-3"
              >
                <span className="text-caption text-heading-charcoal">{admin.Email}</span>
                <form action={removeAdminAction.bind(null, admin.Id)}>
                  <button
                    type="submit"
                    className="text-micro text-alert-red underline underline-offset-2"
                  >
                    Remove
                  </button>
                </form>
              </div>
            ))}
        </div>
        <form
          action={addAdminAction}
          className="flex w-full max-w-sm items-center gap-2"
        >
          <input
            name="email"
            type="email"
            required
            placeholder="new-admin@example.com"
            className="flex-1 rounded-cards border border-stone-border bg-white px-4 py-2.5 text-caption text-heading-charcoal outline-none focus:border-ink-black"
          />
          <button
            type="submit"
            className="shrink-0 rounded-buttons bg-ink-black px-3.5 py-2.5 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90"
          >
            Add Admin
          </button>
        </form>
      </div>
    </section>
  );
}
