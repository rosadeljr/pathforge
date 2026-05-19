'use client';

import { Card } from '@/components/ui/Card';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface ReadinessData {
  factor: string;
  value: number;
  fullMark: number;
}

interface ReadinessRadarProps {
  data: ReadinessData[];
  score: number;
}

export function ReadinessRadar({ data, score }: ReadinessRadarProps) {
  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Readiness Score
            </h3>
            <p className="text-sm text-slate-400">
              Career readiness assessment
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              {score}%
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid
              stroke="rgba(255, 255, 255, 0.1)"
              gridType="polygon"
            />
            <PolarAngleAxis
              dataKey="factor"
              stroke="rgba(255, 255, 255, 0.4)"
              style={{ fontSize: '12px' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              stroke="rgba(255, 255, 255, 0.2)"
              style={{ fontSize: '12px' }}
            />
            <Radar
              name="Your Readiness"
              dataKey="value"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.3}
              isAnimationActive={true}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 10, 10, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '8px',
              }}
              labelStyle={{ color: 'rgb(255, 255, 255)' }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
