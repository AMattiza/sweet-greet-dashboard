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

  // 🎨 Prozentbalken
  const bar = (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "6.4rem",
        borderRadius: "12px",
        overflow: "hidden",
        background: "#f6f6f6",
        boxShadow: "inset 0 0 6px rgba(0,0,0,0.05)",
      }}
    >
      {dist.map((d, i) => {
        const showFull = d.percentage >= 7;
        return (
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
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              color: "#fff",
              textShadow: "0 1px 2px rgba(0,0,0,0.25)",
              whiteSpace: "nowrap",
              padding: "6px 4px",
            }}
          >
            {showFull ? (
              <>
                <div className="card-title" style={{ marginBottom: 0 }}>
                  {d.percentage.toFixed(0)} %
                </div>
                <div className="card-value">{d.count}</div>
                <div className="card-sub" style={{ marginTop: "2px" }}>
                  {d.label}
                </div>
              </>
            ) : (
              <div
                className="card-value"
                style={{ fontSize: "20px", lineHeight: "24px" }}
              >
                {d.count}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );

  // 🧩 Inhalt (ohne .card)
  const content = (
    <div
      style={{
        background: "#fff",
        color: "#74786E",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        borderRadius: "12px",
        padding: "18px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "14px",
        }}
      >
        <div className="card-title">{conf.label}</div>
        <div className="card-sub">Gesamt: {data.total} Datensätze</div>
      </div>

      {bar}
    </div>
  );

  // 🔗 Integration ins Grid-System
  return (
    <div id="kpi-root" data-iframe-size="" data-iframe-overflowed="">
      <div className="grid-container" data-iframe-overflowed="">
        {conf.target ? (
          <a
            href={conf.target}
            target={conf.targetBlank === false ? "_self" : "_blank"}
            rel="noreferrer"
            data-iframe-overflowed=""
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
        )}
      </div>
    </div>
  );
}
