interface EventMetadataProps {
  date: string;
  time: string;
  location: string;
  address: string;
}

export default function EventMetadata({
  date,
  time,
  location,
  address,
}: EventMetadataProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
      <MetadataCard icon="calendar_month" label="Date & Time" primary={date} secondary={time} />
      <MetadataCard icon="location_on" label="Location" primary={location} secondary={address} />
    </div>
  );
}

interface MetadataCardProps {
  icon: string;
  label: string;
  primary: string;
  secondary: string;
}

function MetadataCard({ icon, label, primary, secondary }: MetadataCardProps) {
  return (
    <div className="p-6 bg-surface-container-low rounded-2xl flex items-start gap-4">
      <div className="p-3 bg-surface-container-lowest rounded-xl text-primary shrink-0">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
          {label}
        </p>
        <p className="font-bold text-on-surface">{primary}</p>
        <p className="text-sm text-on-surface-variant">{secondary}</p>
      </div>
    </div>
  );
}
