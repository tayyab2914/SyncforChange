import type { EventTag } from "@/types";
import Tag from "@/components/shared/Tag";

interface EventHeaderProps {
  tags: EventTag[];
  title: string;
  subtitle: string;
}

export default function EventHeader({ tags, title, subtitle }: EventHeaderProps) {
  return (
    <div className="mb-10">
      <div className="flex flex-wrap gap-3 mb-6">
        {tags.map((tag) => (
          <Tag key={tag.label} label={tag.label} color={tag.color} size="sm" />
        ))}
      </div>

      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-6 leading-tight">
        {title}
      </h1>

      <p className="text-xl text-on-surface-variant leading-relaxed font-medium">
        {subtitle}
      </p>
    </div>
  );
}
