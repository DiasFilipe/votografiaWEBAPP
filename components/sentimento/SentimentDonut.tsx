"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { SentimentStats } from "@/lib/sentimento/types";

const COLORS = { Positivo: "#22c55e", Negativo: "#ef4444", Neutro: "#eab308" };

export default function SentimentDonut({ stats }: { stats: SentimentStats }) {
  const data = [
    { name: "Positivo", value: stats.positivo, pct: stats.positivoPct },
    { name: "Negativo", value: stats.negativo, pct: stats.negativoPct },
    { name: "Neutro", value: stats.neutro, pct: stats.neutroPct },
  ].filter((d) => d.value > 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, pct }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (pct < 8) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="bold">
        {pct}%
      </text>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full">
      <h3 className="font-bold text-gray-800 mb-4">Distribuição de Sentimento</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" labelLine={false} label={CustomLabel}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, color: "#111827", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07)" }}
            formatter={(value, name) => [`${value} menções`, String(name)]}
          />
          <Legend formatter={(value) => <span style={{ color: "#6b7280", fontSize: 13 }}>{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
