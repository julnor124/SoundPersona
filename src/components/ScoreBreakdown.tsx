type ScoreBreakdownProps = {
  items: Array<{ label: string; value: number }>;
};

export default function ScoreBreakdown({ items }: ScoreBreakdownProps) {
  return (
    <div className="breakdown">
      {items.map((item) => (
        <div key={item.label} className="breakdown-row">
          <div className="breakdown-label">
            <span>{item.label}</span>
            <span>{item.value}</span>
          </div>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${item.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
