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
    <div className="distribution-bar">
      {dist.map((d, i) => (
        <motion.div
          key={d.label}
          initial={{ width: 0 }}
          animate={{ width: `${d.percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          title={`${d.label}: ${d.count} (${d.percentage.toFixed(1)}%)`}
          className="bar-segment"
          style={{ backgroundColor: COLORS[i % COLORS.length] }}
        >
          <div className="segment-title">{d.percentage.toFixed(0)} %</div>
          <div className="segment-value">{d.count}</div>
          <div className="segment-sub">{d.label}</div>
        </motion.div>
      ))}
    </div>
  );

  // 🧩 Inhalt (Container)
  const content = (
    <div className="distribution-card">
      <div className="distribution-header">
        <div className="card-title">{conf.label}</div>
        <div className="card-sub">Gesamt: {data.total} Datensätze</div>
      </div>
      {bar}
    </div>
  );

  // 🔗 Integration ins KPI-Grid
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
