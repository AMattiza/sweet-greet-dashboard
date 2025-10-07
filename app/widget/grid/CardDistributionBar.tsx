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
  "#DA9D41", // gelb
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
        height: "3.25rem", // gleiches optisches Gewicht wie Zahl (40px line-height)
        borderRadius: "12px",
        overflow: "hidden",
        background: "#f4f4f4",
        boxShadow: "inset 0 0 4px rgba(0,0,0,0.08)",
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
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: "32px",        // exakt wie .card-value
            lineHeight: "40px",
            textShadow: "0 1px 2px rgba(0,0,0,0.25)",
            whiteSpace: "nowrap",
          }}
        >
          {d.percentage >= 8 ? d.count : ""}
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
        fontFamily: "'Inter', sans-serif",
        fontWeight: 300,
        fontSize: "12px",
        marginTop: "1rem",
        color: "#74786E",
      }}
    >
      {dist.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: COLORS[i % COLORS.length],
              borderRadius: "3px",
            }}
          />
          <span style={{ whiteSpace: "nowrap" }}>
            {d.label} ({d.count} / {d.percentage.toFixed(0)} %)
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
        color: "#74786E",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        borderRadius: "12px",
        padding: "18px",
      }}
    >
      <div
        className="card-title"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          fontSize: "14px",
          color: "#74786E",
          marginBottom: "8px",
        }}
      >
        {conf.label}
      </div>

      {bar}

      {legend}

      <div
        className="card-sub"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 300,
          fontSize: "12px",
          opacity: 0.9,
          textAlign: "center",
          marginTop: "0.75rem",
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
