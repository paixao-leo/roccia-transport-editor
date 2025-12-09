interface StatCardProps {
  value: string | number;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="text-4xl font-bold text-primary mb-2">{value}</div>
      <div className="text-muted-foreground uppercase font-semibold text-sm tracking-wide">
        {label}
      </div>
    </div>
  );
}
