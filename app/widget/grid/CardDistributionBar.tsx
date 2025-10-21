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
  data?: {
    total: number;
    distribution: DistributionItem[];
  };
  loading?: boolean;
};

const COLORS = [
  "#83A0A0", // cadet gray
  "#4C5F6B", // paynes gray
  "#2B3D41", // gunmetal
  "#5F7069", // feldgrau
];

export default function CardDistributionBar({ conf, data, loading }: Props) {
  const isLoading = loading || !data || !data.distribution?.length;
  const dist = data?.distribution?.slice(0, 8) || [];

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
                <div className="segment-title">{d.percentage.toFixed(0)}%</div>
                <div className="segment-value">{d.count}</div>
                <div className="segment-sub">{d.label}</div>
              </>
            )}
          </motion.div>
        );
      })}
    </div>
  );

  // 💫 Ladezustand / Skeleton
  const skeleton = (
    <div className="flex flex-col items-center justify-center gap-3 animate-pulse py-6">
      <div className="w-2/3 h-6 bg-gray-200 rounded"></div>
      <div className="w-1/2 h-6 bg-gray-200 rounded"></div>
    </div>
  );

  // 🧩 Das Distribution-Widget selbst
  const card = (
    <div
      className="card distribution-widget transition-all duration-300 min-h-[180px] md:min-h-[200px]"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: "1122px",      // <- entscheidend: erzwingt gleiche Breite wie Grid
        margin: "0 auto",        // <- exakt zentriert im Grid
        boxSizing: "border-box", // <- verhindert interne Differenzen
      }}
    >
      <div className="distribution-header">
        <div className="card-title">{conf.label}</div>
        {!isLoading && <div className="card-sub">Gesamt: {data?.total} Datensätze</div>}
      </div>
      {isLoading ? skeleton : bar}
    </div>
  );

  // 🔗 Klickbar, falls Ziel vorhanden
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
        color: "inherit",
      }}
    >
      {card}
    </a>
  ) : (
    card
  );
}
