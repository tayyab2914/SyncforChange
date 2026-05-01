interface EventHeroProps {
  src: string;
  alt: string;
  openToCollaboration: boolean;
}

export default function EventHero({
  src,
  alt,
  openToCollaboration,
}: EventHeroProps) {
  if (!src) return null;

  return (
    <div className="relative rounded-3xl overflow-hidden mb-12 shadow-sm group">
      <img
        className="w-full h-[450px] object-cover transition-transform duration-700 group-hover:scale-105"
        src={src}
        alt={alt}
      />
      {openToCollaboration && (
        <div className="absolute top-6 left-6">
          <span className="bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">handshake</span>
            Open to Co-Hosting
          </span>
        </div>
      )}
    </div>
  );
}
