interface EventAboutProps {
  description: string;
}

export default function EventAbout({ description }: EventAboutProps) {
  const paragraphs = description
    ? description.split("\n").filter((p) => p.trim().length > 0)
    : [];

  return (
    <div className="space-y-6 text-lg text-on-surface-variant leading-relaxed mb-12">
      <h3 className="text-2xl font-bold text-on-surface">About this event</h3>

      {paragraphs.length > 0 ? (
        paragraphs.map((para, i) => <p key={i}>{para}</p>)
      ) : (
        <p className="text-stone-400 italic">No description provided.</p>
      )}
    </div>
  );
}
