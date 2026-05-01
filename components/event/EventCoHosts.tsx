interface EventCoHostsProps {
  coHosts: string[];
}

export default function EventCoHosts({ coHosts }: EventCoHostsProps) {
  if (coHosts.length === 0) return null;

  return (
    <div className="p-8 bg-surface-container-low rounded-3xl">
      <h3 className="text-lg font-bold text-on-surface mb-4">
        Co-hosted with
      </h3>
      <div className="flex flex-wrap gap-3">
        {coHosts.map((name) => (
          <span
            key={name}
            className="px-4 py-2 bg-surface-container rounded-xl text-sm font-medium text-on-surface"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
