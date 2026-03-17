"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { TimelinePoint } from "@/lib/sentimento/types";

export default function TimelineChart({ data }: { data: TimelinePoint[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full">
      <h3 className="font-bold text-gray-800 mb-4">Menções por dia (7 dias)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} /><stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gNeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} /><stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gNeu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ca8a04" stopOpacity={0.15} /><stop offset="95%" stopColor="#ca8a04" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, color: "#111827", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07)" }} />
          <Legend formatter={(value) => <span style={{ color: "#6b7280", fontSize: 12 }}>{value}</span>} />
          <Area type="monotone" dataKey="positivo" stroke="#16a34a" strokeWidth={2} fill="url(#gPos)" name="Positivo" />
          <Area type="monotone" dataKey="negativo" stroke="#dc2626" strokeWidth={2} fill="url(#gNeg)" name="Negativo" />
          <Area type="monotone" dataKey="neutro"   stroke="#ca8a04" strokeWidth={2} fill="url(#gNeu)" name="Neutro" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
