import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface RewardChartProps {
  rewardHistory: number[];
}

export const RewardChart: React.FC<RewardChartProps> = ({ rewardHistory }) => {
  const data = rewardHistory.slice(-50).map((reward, index) => ({
    episode: rewardHistory.length - 50 + index + 1,
    reward: reward
  }));

  const avgReward = data.length > 0 ? data.reduce((sum, d) => sum + d.reward, 0) / data.length : 0;

  return (
    <div className="glass rounded-lg p-4">
      <h3 className="text-sm font-semibold text-primary mb-3 font-mono">Reward History</h3>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <XAxis 
            dataKey="episode" 
            stroke="hsl(215 20% 45%)" 
            fontSize={10}
            tickLine={false}
          />
          <YAxis 
            stroke="hsl(215 20% 45%)" 
            fontSize={10}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(220 20% 10%)',
              border: '1px solid hsl(220 20% 18%)',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono'
            }}
            labelStyle={{ color: 'hsl(185 100% 50%)' }}
          />
          <ReferenceLine y={0} stroke="hsl(220 20% 25%)" strokeDasharray="3 3" />
          <ReferenceLine y={avgReward} stroke="hsl(270 80% 60%)" strokeDasharray="5 5" />
          <Line
            type="monotone"
            dataKey="reward"
            stroke="hsl(185 100% 50%)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'hsl(185 100% 50%)' }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground text-center mt-2 font-mono">
        Last 50 episodes • Avg: {avgReward.toFixed(1)}
      </p>
    </div>
  );
};
