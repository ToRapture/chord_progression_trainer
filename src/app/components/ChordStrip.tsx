type Cell = {
  label: string;
  target?: boolean;
};

export function ChordStrip({ cells }: { cells: Cell[] }) {
  return (
    <div className="chord-strip">
      {cells.map((c, i) => {
        const isMissing = c.label === "?";
        const cls = [
          "chord-cell",
          c.target ? "target" : "",
          isMissing ? "missing" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <div key={i} className={cls} title={`Position ${i + 1}`}>
            {c.label}
          </div>
        );
      })}
    </div>
  );
}
