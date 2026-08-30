"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/compressImage";

function formatMB(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export default function CompressedImageInput({
  name,
  required,
}: {
  name: string;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setStatus(null);
      return;
    }
    setStatus("Compressing…");
    const compressed = await compressImage(file);

    const dt = new DataTransfer();
    dt.items.add(compressed);
    if (inputRef.current) inputRef.current.files = dt.files;

    setStatus(
      compressed.size < file.size
        ? `${formatMB(file.size)} → ${formatMB(compressed.size)}`
        : null
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept="image/*"
        required={required}
        onChange={handleChange}
        className="rounded-cards border border-stone-border bg-white px-4 py-2.5 text-caption text-heading-charcoal outline-none file:mr-3 file:rounded-buttons file:border-0 file:bg-ink-black file:px-3 file:py-1.5 file:text-micro file:font-semibold file:text-cream-canvas"
      />
      {status && <span className="text-micro text-muted-gray">{status}</span>}
    </div>
  );
}
