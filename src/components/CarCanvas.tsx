import React, { useRef, useEffect } from 'react';
import { CarState } from '@/lib/carEnvironment';

interface CarCanvasProps {
  car: CarState;
  track: { inner: { x: number; y: number }[]; outer: { x: number; y: number }[] };
  checkpoints: { x: number; y: number; passed: boolean }[];
  width: number;
  height: number;
  qValues?: number[];
}

export const CarCanvas: React.FC<CarCanvasProps> = ({
  car,
  track,
  checkpoints,
  width,
  height,
  qValues
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0f14';
    ctx.fillRect(0, 0, width, height);

    // Draw grid pattern
    ctx.strokeStyle = 'rgba(45, 55, 72, 0.3)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw track
    // Outer boundary
    ctx.beginPath();
    ctx.moveTo(track.outer[0].x, track.outer[0].y);
    for (const point of track.outer) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
    ctx.fillStyle = '#1a1f2e';
    ctx.fill();
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner boundary (cut out)
    ctx.beginPath();
    ctx.moveTo(track.inner[0].x, track.inner[0].y);
    for (const point of track.inner) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
    ctx.fillStyle = '#0a0f14';
    ctx.fill();
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw checkpoints
    for (const checkpoint of checkpoints) {
      ctx.beginPath();
      ctx.arc(checkpoint.x, checkpoint.y, 15, 0, Math.PI * 2);
      if (checkpoint.passed) {
        ctx.fillStyle = 'rgba(0, 255, 136, 0.6)';
        ctx.strokeStyle = '#00ff88';
      } else {
        ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
        ctx.strokeStyle = '#ffc800';
      }
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw sensors
    const sensorAngles = [-Math.PI/3, -Math.PI/6, 0, Math.PI/6, Math.PI/3];
    const sensorRange = 150;
    
    for (let i = 0; i < car.sensors.length; i++) {
      const angle = car.angle + sensorAngles[i];
      const endX = car.x + Math.cos(angle) * sensorRange * car.sensors[i];
      const endY = car.y + Math.sin(angle) * sensorRange * car.sensors[i];

      // Sensor line
      ctx.beginPath();
      ctx.moveTo(car.x, car.y);
      ctx.lineTo(endX, endY);
      
      const sensorValue = car.sensors[i];
      if (sensorValue < 0.3) {
        ctx.strokeStyle = 'rgba(255, 85, 85, 0.8)';
      } else if (sensorValue < 0.5) {
        ctx.strokeStyle = 'rgba(255, 200, 0, 0.6)';
      } else {
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
      }
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sensor endpoint
      ctx.beginPath();
      ctx.arc(endX, endY, 4, 0, Math.PI * 2);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
    }

    // Draw car (enhanced sprite)
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);

    // Parameters
    const bodyW = 44;
    const bodyH = 26;
    const halfW = bodyW / 2;
    const halfH = bodyH / 2;

    // Glow
    ctx.shadowColor = 'rgba(0,212,255,0.35)';
    ctx.shadowBlur = 12;

    // Body (rounded rect)
    const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    // Body gradient
    const g = ctx.createLinearGradient(-halfW, 0, halfW, 0);
    g.addColorStop(0, '#006b86');
    g.addColorStop(1, '#00d4ff');

    drawRoundedRect(-halfW, -halfH, bodyW, bodyH, 6);
    ctx.fillStyle = g;
    ctx.fill();

    // Body outline
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Windows
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.moveTo(-8, -6);
    ctx.quadraticCurveTo(0, -10, 12, -6);
    ctx.lineTo(12, 2);
    ctx.quadraticCurveTo(0, -2, -8, 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Wheels
    ctx.fillStyle = '#0b0b0b';
    const wheelW = 8;
    const wheelH = 4;
    ctx.beginPath();
    ctx.ellipse(-halfW + 8, halfH - 4, wheelW, wheelH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(halfW - 8, halfH - 4, wheelW, wheelH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Headlights
    ctx.beginPath();
    ctx.ellipse(halfW - 4, -6, 3, 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,250,200,0.95)';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(halfW - 4, 6, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Small accent stripe
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-halfW + 6, -4);
    ctx.lineTo(halfW - 6, -4);
    ctx.stroke();

    ctx.restore();

    // Draw Q-values visualization
    if (qValues && qValues.length > 0) {
      const actions = ['←', '↑', '→', '⚡', '⏹'];
      const maxQ = Math.max(...qValues);
      const minQ = Math.min(...qValues);
      const range = maxQ - minQ || 1;

      ctx.font = '12px JetBrains Mono';
      for (let i = 0; i < qValues.length; i++) {
        const normalized = (qValues[i] - minQ) / range;
        const x = 20 + i * 50;
        const y = height - 20;

        // Bar
        const barHeight = normalized * 40;
        ctx.fillStyle = `rgba(0, 212, 255, ${0.3 + normalized * 0.7})`;
        ctx.fillRect(x, y - barHeight, 40, barHeight);

        // Label
        ctx.fillStyle = i === qValues.indexOf(maxQ) ? '#00ff88' : '#ffffff';
        ctx.fillText(actions[i], x + 15, y - barHeight - 5);
        ctx.fillStyle = '#888';
        ctx.fillText(qValues[i].toFixed(2), x + 5, y + 15);
      }
    }

  }, [car, track, checkpoints, width, height, qValues]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg border border-border"
    />
  );
};
