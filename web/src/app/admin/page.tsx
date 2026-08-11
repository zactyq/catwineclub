import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/access";
import { listApplications } from "@/lib/data/applications";
import { approveApplicationAction, rejectApplicationAction } from "./actions";

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

  const [pending, reviewed] = await Promise.all([
    listApplications("pending"),
    listApplications(),
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
    </section>
  );
}
