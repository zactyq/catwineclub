export default function ImagePlaceholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-illustration border border-dashed border-stone-border bg-sand-surface text-center ${className}`}
    >
      <span className="px-4 text-micro text-muted-gray">{label}</span>
    </div>
  );
}
