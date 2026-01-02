import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Zap, Brain } from 'lucide-react';

interface ControlPanelProps {
  isRunning: boolean;
  speed: number;
  onToggle: () => void;
  onReset: () => void;
  onSpeedChange: (value: number) => void;
  mode: 'training' | 'inference';
  onModeChange: (mode: 'training' | 'inference') => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  speed,
  onToggle,
  onReset,
  onSpeedChange,
  mode,
  onModeChange
}) => {
  return (
    <div className="glass rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-primary font-mono">Controls</h3>
      
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'training' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('training')}
          className="flex-1 font-mono"
        >
          <Brain className="w-4 h-4 mr-2" />
          Train
        </Button>
        <Button
          variant={mode === 'inference' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('inference')}
          className="flex-1 font-mono"
        >
          <Zap className="w-4 h-4 mr-2" />
          Drive
        </Button>
      </div>

      {/* Play/Pause & Reset */}
      <div className="flex gap-2">
        <Button
          onClick={onToggle}
          className="flex-1"
          variant={isRunning ? 'secondary' : 'default'}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start
            </>
          )}
        </Button>
        <Button onClick={onReset} variant="outline" size="icon">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground font-mono">
          <span>Simulation Speed</span>
          <span>{speed}x</span>
        </div>
        <Slider
          value={[speed]}
          onValueChange={(v) => onSpeedChange(v[0])}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
      </div>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1 font-mono">
        <p className="text-primary font-semibold">How it works:</p>
        <p>• <span className="text-warning">Training:</span> Agent explores & learns</p>
        <p>• <span className="text-success">Driving:</span> Uses learned policy</p>
        <p>• Yellow dots = checkpoints</p>
        <p>• Cyan lines = distance sensors</p>
      </div>
    </div>
  );
};
