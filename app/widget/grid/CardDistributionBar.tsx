"use client";

type DistributionItem = {
  label: string;
  count: number;
  percentage: number;
};

type Props = {
  conf: {
    label: string;
    target?: string;
    targetBlank?: boolean;
  };
  data: {
    total: number;
    distribution: DistributionItem[];
  };
};

export default function CardDistributionBar({ conf, data }: Props) {
  const total = data.total;
  const dist = data.distribution.filter((d) => d.percentage > 0);

  const colors = [
    "#9EB384", // grün
    "#FFD54F", // gelb
    "#E57373", // rot
    "#64B5F6", // blau
    "#BA68C8", // lila
    "#4DB6AC", // türkis
    "#FFB74D", // orange
  ];

  const content = (
    <div
      className="card"
      style={{
        background: "#f4f4f4",
        color: "#333",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "1rem",
        height: "100%",
      }}
    >
      {/* Titel */}
      <div className="card-title" style={{ marginBottom: "0.5rem" }}>
        {conf.label}
      </div>

      {/* Balken */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "30px",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "0.75rem",
        }}
      >
        {dist.map((d, i) => (
          <div
            key={i}
            title={`${d.label}: ${d.percentage.toFixed(1)}% (${d.count})`}
            style={{
              width: `${d.percentage}%`,
              backgroundColor: colors[i % colors.length],
              transition: "width 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Legende */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem 1rem",
          fontSize: "0.8rem",
          lineHeight: 1.2,
        }}
      >
        {dist.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "2px",
                backgroundColor: colors[i % colors.length],
              }}
            ></span>
            <span>
              {d.label} ({d.percentage.toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>

      {/* Subtext */}
      <div
        className="card-sub"
        style={{
          textAlign: "center",
          fontSize: "0.85rem",
          opacity: 0.8,
          marginTop: "0.75rem",
        }}
      >
        Gesamt: {total} Datensätze
      </div>
    </div>
  );

  // Klickbar, wenn Target vorhanden
  return conf.target ? (
    <a
      href={conf.target}
      target={conf.targetBlank === false ? "_self" : "_blank"}
      rel="noreferrer"
      style={{
        textDecoration: "none",
        display: "block",
        width: "100%",
        height: "100%",
      }}
    >
      {content}
    </a>
  ) : (
    content
  );
}
