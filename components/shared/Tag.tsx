interface TagProps {
  label: string;
  /** Tailwind utility classes, e.g. "bg-primary/10 text-primary" */
  color: string;
  size?: "sm" | "xs";
}

export default function Tag({ label, color, size = "xs" }: TagProps) {
  return (
    <span
      className={`inline-block rounded-full font-black uppercase tracking-widest ${color} ${
        size === "xs" ? "px-3 py-1 text-[10px]" : "px-4 py-1.5 text-xs"
      }`}
    >
      {label}
    </span>
  );
}
