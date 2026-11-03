import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export function CompletionTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-52 sm:h-64 md:h-72 flex items-center justify-center text-xs sm:text-sm text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <div className="h-52 sm:h-64 md:h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            minTickGap={20}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: 12,
            }}
            itemStyle={{ color: '#6366f1', fontWeight: 600, fontSize: 12 }}
            labelStyle={{ fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="completed"
            stroke="#6366f1"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorCompleted)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const COLORS = {
  urgent: '#ef4444', // red
  high: '#f97316',   // orange
  medium: '#3b82f6', // blue
  low: '#94a3b8',    // slate
};

export function PriorityChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-52 sm:h-64 md:h-72 flex items-center justify-center text-xs sm:text-sm text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <div className="h-52 sm:h-64 md:h-72 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="45%"
            outerRadius="75%"
            paddingAngle={5}
            dataKey="count"
            nameKey="priority"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.priority] || '#cbd5e1'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: 12,
            }}
            itemStyle={{ fontSize: 12 }}
            labelStyle={{ fontSize: 12 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              fontSize: '11px',
              textTransform: 'capitalize',
              paddingTop: 4,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}