import React from 'react';
import { motion } from 'framer-motion';

interface NeuralNetworkVisualizerProps {
  inputValues: number[];
  qValues: number[];
  selectedAction: number;
}

export const NeuralNetworkVisualizer: React.FC<NeuralNetworkVisualizerProps> = ({
  inputValues,
  qValues,
  selectedAction
}) => {
  const inputLabels = ['Sensor L2', 'Sensor L1', 'Sensor C', 'Sensor R1', 'Sensor R2', 'Speed', 'Sin θ', 'Cos θ'];
  const outputLabels = ['Left', 'Forward', 'Right', 'Accel', 'Brake'];
  const hiddenNodes = 12;

  const nodeRadius = 12;
  const layerGap = 120;
  const startX = 80;
  const startY = 40;

  const getInputY = (i: number) => startY + i * 35;
  const getHiddenY = (i: number) => startY + 20 + i * 22;
  const getOutputY = (i: number) => startY + 60 + i * 45;

  const maxQ = Math.max(...qValues);

  return (
    <div className="glass rounded-lg p-4">
      <h3 className="text-sm font-semibold text-primary mb-3 font-mono">Neural Network State</h3>
      <svg width="100%" height="320" viewBox="0 0 400 320">
        {/* Connections: Input to Hidden */}
        {inputValues.map((_, i) =>
          Array.from({ length: hiddenNodes }).map((_, j) => (
            <line
              key={`ih-${i}-${j}`}
              x1={startX + nodeRadius}
              y1={getInputY(i)}
              x2={startX + layerGap - nodeRadius}
              y2={getHiddenY(j)}
              stroke="hsl(185 100% 50% / 0.1)"
              strokeWidth="1"
            />
          ))
        )}

        {/* Connections: Hidden to Output */}
        {Array.from({ length: hiddenNodes }).map((_, i) =>
          qValues.map((q, j) => (
            <motion.line
              key={`ho-${i}-${j}`}
              x1={startX + layerGap + nodeRadius}
              y1={getHiddenY(i)}
              x2={startX + layerGap * 2 - nodeRadius}
              y2={getOutputY(j)}
              stroke={j === selectedAction ? 'hsl(145 80% 45%)' : 'hsl(185 100% 50% / 0.15)'}
              strokeWidth={j === selectedAction ? 2 : 1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          ))
        )}

        {/* Input Layer */}
        {inputValues.map((value, i) => (
          <g key={`input-${i}`}>
            <motion.circle
              cx={startX}
              cy={getInputY(i)}
              r={nodeRadius}
              fill={`hsl(185 100% ${30 + value * 40}%)`}
              stroke="hsl(185 100% 50%)"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
            />
            <text
              x={startX - 45}
              y={getInputY(i) + 4}
              fill="hsl(215 20% 55%)"
              fontSize="8"
              fontFamily="JetBrains Mono"
            >
              {inputLabels[i]}
            </text>
            <text
              x={startX}
              y={getInputY(i) + 3}
              fill="white"
              fontSize="7"
              fontFamily="JetBrains Mono"
              textAnchor="middle"
            >
              {value.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Hidden Layer */}
        {Array.from({ length: hiddenNodes }).map((_, i) => (
          <motion.circle
            key={`hidden-${i}`}
            cx={startX + layerGap}
            cy={getHiddenY(i)}
            r={nodeRadius * 0.7}
            fill="hsl(270 80% 40%)"
            stroke="hsl(270 80% 60%)"
            strokeWidth="1.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + i * 0.02 }}
          />
        ))}

        {/* Output Layer */}
        {qValues.map((value, i) => (
          <g key={`output-${i}`}>
            <motion.circle
              cx={startX + layerGap * 2}
              cy={getOutputY(i)}
              r={nodeRadius}
              fill={i === selectedAction ? 'hsl(145 80% 45%)' : `hsl(185 100% ${30 + (value === maxQ ? 50 : 20)}%)`}
              stroke={i === selectedAction ? 'hsl(145 80% 60%)' : 'hsl(185 100% 50%)'}
              strokeWidth={i === selectedAction ? 3 : 2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
            />
            <text
              x={startX + layerGap * 2 + 25}
              y={getOutputY(i) + 4}
              fill={i === selectedAction ? 'hsl(145 80% 45%)' : 'hsl(215 20% 55%)'}
              fontSize="10"
              fontFamily="JetBrains Mono"
              fontWeight={i === selectedAction ? 'bold' : 'normal'}
            >
              {outputLabels[i]}
            </text>
            <text
              x={startX + layerGap * 2 + 25}
              y={getOutputY(i) + 16}
              fill="hsl(215 20% 45%)"
              fontSize="8"
              fontFamily="JetBrains Mono"
            >
              Q: {value.toFixed(2)}
            </text>
          </g>
        ))}

        {/* Layer Labels */}
        <text x={startX} y={320} fill="hsl(185 100% 50%)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">
          Input
        </text>
        <text x={startX + layerGap} y={320} fill="hsl(270 80% 60%)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">
          Hidden
        </text>
        <text x={startX + layerGap * 2} y={320} fill="hsl(145 80% 45%)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">
          Output
        </text>
      </svg>
    </div>
  );
};
