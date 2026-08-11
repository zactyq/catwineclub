import { redirect } from "next/navigation";
import { getViewer } from "@/lib/access";
import { bulkImportWinesAction, createWineAction } from "../actions";

export default async function NewWinePage() {
  const viewer = await getViewer();
  if (viewer.status !== "member" || !viewer.isApproved) {
    redirect("/group-buy");
  }

  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center gap-12 px-4 py-16 sm:px-6">
      <div className="flex max-w-lg flex-col items-center gap-3 text-center">
        <h1 className="font-display text-heading-lg text-heading-charcoal">
          Post a Wine
        </h1>
        <p className="text-body text-body-brown">
          List a deal for the club to claim on a first-come, first-served
          basis.
        </p>
      </div>

      <form
        action={createWineAction}
        className="flex w-full max-w-lg flex-col gap-5 rounded-cards bg-white p-8 shadow-subtle"
      >
        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-heading-charcoal">Wine Name</span>
          <input
            name="wineName"
            type="text"
            required
            className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-heading-charcoal">Vintage</span>
          <input
            name="vintage"
            type="text"
            placeholder="2019 or NV"
            className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-heading-charcoal">Description</span>
          <textarea
            name="description"
            rows={3}
            className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-heading-charcoal">Image URL</span>
          <input
            name="imageUrl"
            type="url"
            className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-caption font-medium text-heading-charcoal">
              Original Price
            </span>
            <input
              name="originalPrice"
              type="number"
              step="0.01"
              min={0}
              className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-caption font-medium text-heading-charcoal">
              Discounted Price
            </span>
            <input
              name="discountedPrice"
              type="number"
              step="0.01"
              min={0}
              className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-heading-charcoal">
            Quantity Available
          </span>
          <input
            name="quantityAvailable"
            type="number"
            min={1}
            required
            defaultValue={1}
            className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
          />
        </label>

        <button
          type="submit"
          className="rounded-buttons bg-ink-black px-3.5 py-2.5 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90"
        >
          Post Wine
        </button>
      </form>

      {viewer.isAdmin && (
        <div className="flex w-full max-w-lg flex-col gap-4 rounded-cards bg-stone-surface p-8">
          <div>
            <h2 className="text-subheading font-medium text-heading-charcoal">
              Bulk Import (Admin)
            </h2>
            <p className="text-caption text-body-brown">
              Paste a JSON array of wines — ask your favourite AI to format it
              for you. Fields: wineName, vintage, description, imageUrl,
              originalPrice, discountedPrice, quantityAvailable.
            </p>
          </div>
          <form action={bulkImportWinesAction} className="flex flex-col gap-3">
            <textarea
              name="json"
              rows={8}
              placeholder='[{"wineName":"Chateau Example 2019","originalPrice":45,"discountedPrice":30,"quantityAvailable":12}]'
              className="rounded-cards border border-stone-border bg-white px-4 py-2.5 font-mono text-micro text-heading-charcoal outline-none focus:border-ink-black"
            />
            <button
              type="submit"
              className="w-fit rounded-buttons bg-ink-black px-3.5 py-2.5 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90"
            >
              Import
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
