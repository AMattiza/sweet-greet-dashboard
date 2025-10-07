"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";

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

// ✅ Tooltip für Recharts
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div
        style={{
          background: "#fff",
          color: "#333",
          border: "1px solid #ddd",
          padding: "6px 10px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <strong>{d.label}</strong>
        <div>{d.count} Einträge</div>
        <div>{d.percentage.toFixed(1)}%</div>
      </div>
    );
  }
  return null;
};

export default function CardDistribution({ conf, data }: Props) {
  const top = data.distribution.slice(0, 5); // nur Top 5 anzeigen
  const total = data.total;

  const bg = "#f4f4f4";
  const color = "#333";

  const content = (
    <div
      className="card"
      style={{
        background: bg,
        color,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div className="card-title">{conf.label}</div>
      <div
        style={{
          flex: 1,
          width: "100%",
          padding: "0.5rem 0",
        }}
      >
        <ResponsiveContainer width="100%" height={150}>
          <BarChart
            data={top}
            layout="vertical"
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <XAxis type="number" hide domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="percentage"
              fill="#9EB384"
              radius={[8, 8, 8, 8]}
              label={{
                position: "right",
                fill: "#333",
                formatter: (v: number) => `${v.toFixed(0)}%`,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        className="card-sub"
        style={{ textAlign: "center", fontSize: "0.85rem", opacity: 0.8 }}
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
      style={{ textDecoration: "none", display: "block", width: "100%", height: "100%" }}
    >
      {content}
    </a>
  ) : (
    content
  );
}
