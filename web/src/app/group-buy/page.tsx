import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import ClaimForm from "@/components/ClaimForm";
import { getViewer } from "@/lib/access";
import { listWines } from "@/lib/data/wines";
import { requestClaimRemovalAction } from "./actions";

export default async function GroupBuyPage() {
  const viewer = await getViewer();
  const wines = await listWines(viewer.status === "member" ? viewer.email : undefined);
  const canClaim = viewer.status === "member" && viewer.isApproved;

  return (
    <section className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-16 sm:px-6">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <h1 className="font-display text-heading-lg text-heading-charcoal">
          Group Buy
        </h1>
        <p className="max-w-md text-body text-body-brown">
          Claim a share of what&apos;s on offer — first come, first served.
          Payment and collection are arranged directly with whoever posted it.
        </p>
        {canClaim && (
          <Link
            href="/group-buy/new"
            className="rounded-buttons bg-ink-black px-3.5 py-2.5 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90"
          >
            Post a Wine
          </Link>
        )}
      </div>

      {wines.length === 0 ? (
        <p className="text-center text-body text-body-brown">
          Nothing listed yet — check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wines.map((wine) => (
            <div
              key={wine.Id}
              className="flex flex-col gap-3 rounded-cards bg-white p-6 shadow-subtle"
            >
              <ImagePlaceholder
                label={wine.WineName}
                className="aspect-[4/3] w-full"
              />
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-heading font-medium text-heading-charcoal">
                    {wine.WineName}
                  </h3>
                  {wine.Vintage && (
                    <p className="text-caption text-muted-gray">{wine.Vintage}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-badges px-2 py-1 text-micro ${
                    wine.Status === "open"
                      ? "bg-mint/20 text-heading-charcoal"
                      : "bg-stone-surface text-muted-gray"
                  }`}
                >
                  {wine.Status === "open" ? "Open" : "Closed"}
                </span>
              </div>
              {wine.Description && (
                <p className="text-caption text-body-brown">{wine.Description}</p>
              )}
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
              {wine.myClaimedQuantity > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-caption font-medium text-grass-green">
                    You&apos;ve claimed {wine.myClaimedQuantity} bottle
                    {wine.myClaimedQuantity === 1 ? "" : "s"} 🍷
                  </p>
                  {wine.myRemovalRequested ? (
                    <span className="shrink-0 text-micro text-muted-gray">
                      Removal requested
                    </span>
                  ) : (
                    <form action={requestClaimRemovalAction.bind(null, wine.Id)}>
                      <button
                        type="submit"
                        className="shrink-0 text-micro text-alert-red underline underline-offset-2"
                      >
                        Request removal
                      </button>
                    </form>
                  )}
                </div>
              )}

              {wine.Status === "open" && wine.quantityRemaining > 0 ? (
                canClaim ? (
                  <ClaimForm wineId={wine.Id} quantityRemaining={wine.quantityRemaining} />
                ) : viewer.status === "member" ? (
                  <p className="text-micro text-muted-gray">
                    Pending admin approval before you can claim.
                  </p>
                ) : (
                  <Link
                    href="/login"
                    className="w-fit text-caption text-ember-orange underline underline-offset-2"
                  >
                    Sign in to claim
                  </Link>
                )
              ) : (
                <p className="text-micro text-muted-gray">
                  {wine.quantityRemaining === 0 ? "Fully claimed" : "Closed"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
