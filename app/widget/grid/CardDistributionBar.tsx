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
  "#83A0A0", // cadet gray
  "#4C5F6B", // paynes gray
  "#2B3D41", // gunmetal
  "#5F7069", // feldgrau
];

export default function CardDistributionBar({ conf, data }: Props) {
  const dist = data.distribution.slice(0, 8);

  // 🎨 Prozentbalken
  const bar = (
    <div className="distribution-bar">
      {dist.map((d, i) => {
        const isSmall = d.percentage < 10;
        return (
          <motion.div
            key={d.label}
            initial={{ width: 0 }}
            animate={{ width: `${d.percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            title={`${d.label}: ${d.count} (${d.percentage.toFixed(1)}%)`}
            className="bar-segment"
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
          >
            {isSmall ? (
              <div className="segment-value small-only">{d.count}</div>
            ) : (
              <>
                <div className="segment-title">{d.percentage.toFixed(0)} %</div>
                <div className="segment-value">{d.count}</div>
                <div className="segment-sub">{d.label}</div>
              </>
            )}
          </motion.div>
        );
      })}
    </div>
  );

  // 🧩 Hauptinhalt (Karte)
  const content = (
    <div className="distribution-card">
      <div className="distribution-header">
        <div className="card-title">{conf.label}</div>
        <div className="card-sub">Gesamt: {data.total} Datensätze</div>
      </div>
      {bar}
    </div>
  );

  // 🔗 Falls Link vorhanden → klickbare Karte
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
