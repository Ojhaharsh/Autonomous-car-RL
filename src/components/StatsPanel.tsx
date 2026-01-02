import React from 'react';
import { motion } from 'framer-motion';

interface StatsPanelProps {
  episode: number;
  totalReward: number;
  epsilon: number;
  avgReward: number;
  bestReward: number;
  steps: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  episode,
  totalReward,
  epsilon,
  avgReward,
  bestReward,
  steps
}) => {
  const stats = [
    { label: 'Episode', value: episode.toString(), color: 'text-primary' },
    { label: 'Steps', value: steps.toString(), color: 'text-foreground' },
    { label: 'Reward', value: totalReward.toFixed(1), color: totalReward > 0 ? 'text-success' : 'text-destructive' },
    { label: 'Best', value: bestReward.toFixed(1), color: 'text-success' },
    { label: 'Avg (10)', value: avgReward.toFixed(1), color: 'text-accent' },
    { label: 'Epsilon', value: (epsilon * 100).toFixed(1) + '%', color: 'text-warning' },
  ];

  return (
    <div className="glass rounded-lg p-4">
      <h3 className="text-sm font-semibold text-primary mb-4 font-mono">Training Metrics</h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-secondary/50 rounded-md p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <p className="text-xs text-muted-foreground font-mono">{stat.label}</p>
            <p className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Exploration vs Exploitation bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1 font-mono">
          <span>Exploration</span>
          <span>Exploitation</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-warning to-success"
            style={{ width: `${(1 - epsilon) * 100}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${(1 - epsilon) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
};
