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
  const dist = data.distribution.slice(0, 8);

  const bar = (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "3rem", // 👉 höherer Balken für klare Lesbarkeit
        borderRadius: "1rem",
        overflow: "hidden",
        background: "#f0f0f0",
        boxShadow: "inset 0 0 4px rgba(0,0,0,0.15)",
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1.4rem", // gleiche Größe wie Hauptwerte in anderen Widgets
            textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            whiteSpace: "nowrap",
          }}
        >
          {/* Zeigt Zahlen nur an, wenn Segment > 7 % Breite (Lesbarkeit) */}
          {d.percentage >= 7 ? d.count : ""}
        </motion.div>
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
        fontSize: "0.9rem",
        marginTop: "1rem",
        color: "#444",
      }}
    >
      {dist.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div
            style={{
              width: "14px",
              height: "14px",
              backgroundColor: COLORS[i % COLORS.length],
              borderRadius: "3px",
            }}
          />
          <span style={{ whiteSpace: "nowrap" }}>
            {d.label} ({d.count} / {d.percentage.toFixed(0)}%)
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
        boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
        borderRadius: "1rem",
        padding: "1rem",
      }}
    >
      <div
        className="card-title"
        style={{
          textAlign: "center",
          fontWeight: 700,
          paddingBottom: "0.75rem",
          fontSize: "1rem",
          color: "#555",
        }}
      >
        {conf.label}
      </div>

      {bar}

      {legend}

      <div
        style={{
          textAlign: "center",
          fontSize: "0.85rem",
          opacity: 0.6,
          paddingTop: "0.75rem",
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
