"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartRow = { month: string; [key: string]: string | number };

export function EvolutionChart({
  data,
  primaryKey,
  secondaryKey,
  primaryLabel,
  secondaryLabel,
}: {
  data: ChartRow[];
  primaryKey: string;
  secondaryKey: string;
  primaryLabel: string;
  secondaryLabel: string;
}) {
  return (
    <div className="h-[230px] w-full" aria-label={`Evolução de ${primaryLabel} e ${secondaryLabel}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id={`fill-${primaryKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6d95ff" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#6d95ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#202020" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 11 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            cursor={{ stroke: "#3a3a3a", strokeDasharray: "3 3" }}
            contentStyle={{ background: "#171717", border: "1px solid #2b2b2b", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#a3a3a3", marginBottom: 6 }}
          />
          <Area type="monotone" dataKey={primaryKey} name={primaryLabel} stroke="#6d95ff" strokeWidth={2} fill={`url(#fill-${primaryKey})`} />
          <Area type="monotone" dataKey={secondaryKey} name={secondaryLabel} stroke="#777" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
