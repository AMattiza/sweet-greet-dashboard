"use client";
import { motion } from "framer-motion";

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

// harmonische Farbpalette
const COLORS = [
  "#9EB384", // grün
  "#FFD54F", // gelb
  "#E57373", // rot
  "#64B5F6", // blau
  "#BA68C8", // violett
  "#4DB6AC", // türkis
  "#F06292", // pink
  "#A1887F", // braun
];

export default function CardDistributionBar({ conf, data }: Props) {
  const dist = data.distribution.slice(0, 8); // max 8 Segmente

  const bar = (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "1.5rem",
        borderRadius: "1rem",
        overflow: "hidden",
        background: "#f0f0f0",
        boxShadow: "inset 0 0 3px rgba(0,0,0,0.1)",
      }}
    >
      {dist.map((d, i) => (
        <motion.div
          key={d.label}
          initial={{ width: 0 }}
          animate={{ width: `${d.percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          title={`${d.label}: ${d.count} (${d.percentage.toFixed(1)}%)`}
          style={{
            backgroundColor: COLORS[i % COLORS.length],
            height: "100%",
          }}
        />
      ))}
    </div>
  );

  const legend = (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.75rem 1.25rem",
        fontSize: "0.85rem",
        marginTop: "0.75rem",
      }}
    >
      {dist.map((d, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: COLORS[i % COLORS.length],
              borderRadius: "3px",
            }}
          />
          <span style={{ whiteSpace: "nowrap" }}>
            {d.label} ({d.percentage.toFixed(0)}%)
          </span>
        </div>
      ))}
    </div>
  );

  const content = (
    <div
      className="card"
      style={{
        background: "#fff",
        color: "#333",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div
        className="card-title"
        style={{
          textAlign: "center",
          fontWeight: 600,
          paddingTop: "0.5rem",
          fontSize: "1rem",
          color: "#555",
        }}
      >
        {conf.label}
      </div>

      <div style={{ padding: "0.5rem 1rem" }}>{bar}</div>

      {legend}

      <div
        style={{
          textAlign: "center",
          fontSize: "0.8rem",
          opacity: 0.6,
          paddingBottom: "0.5rem",
        }}
      >
        Gesamt: {data.total} Datensätze
      </div>
    </div>
  );

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
