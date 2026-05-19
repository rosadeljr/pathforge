'use client';

import { Card } from '@/components/ui/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface XPData {
  date: string;
  xp: number;
  cumulative: number;
}

interface XPProgressChartProps {
  data: XPData[];
}

export function XPProgressChart({ data }: XPProgressChartProps) {
  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            XP Progression
          </h3>
          <p className="text-sm text-slate-400">
            Your XP growth over the last 30 days
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.1)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="rgba(255, 255, 255, 0.3)"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.3)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 10, 10, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '8px',
              }}
              labelStyle={{ color: 'rgb(255, 255, 255)' }}
              cursor={{ stroke: 'rgba(6, 182, 212, 0.3)' }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="xp"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{
                fill: '#06b6d4',
                r: 4,
              }}
              activeDot={{ r: 6 }}
              name="Daily XP"
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#a855f7"
              strokeWidth={2}
              dot={{
                fill: '#a855f7',
                r: 4,
              }}
              activeDot={{ r: 6 }}
              name="Total XP"
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
