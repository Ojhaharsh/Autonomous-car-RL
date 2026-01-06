import React from 'react';
import { motion } from 'framer-motion';
import { CarCanvas } from '@/components/CarCanvas';
import { NeuralNetworkVisualizer } from '@/components/NeuralNetworkVisualizer';
import { StatsPanel } from '@/components/StatsPanel';
import { RewardChart } from '@/components/RewardChart';
import { ControlPanel } from '@/components/ControlPanel';
import { useRLSimulation } from '@/hooks/useRLSimulation';
import { Car, Cpu, Activity } from 'lucide-react';

const Index = () => {
  const {
    state,
    isRunning,
    speed,
    mode,
    dimensions,
    toggle,
    reset,
    setSpeed,
    changeMode
  } = useRLSimulation();

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <header className="border-b border-border/50 glass">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="p-2 rounded-lg bg-primary/10 glow-primary">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient font-mono">RL Self-Driving Car</h1>
                <p className="text-xs text-muted-foreground">Deep Q-Learning Visualization</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50">
                <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                <span className="text-xs font-mono text-muted-foreground">
                  {isRunning ? 'Running' : 'Paused'}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50">
                <span className="text-xs font-mono text-muted-foreground">
                  Mode: <span className={mode === 'training' ? 'text-warning' : 'text-success'}>{mode}</span>
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Canvas */}
          <motion.div 
            className="lg:col-span-8 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Controls moved here (preserve all props/handlers) */}
            <div>
              <ControlPanel
                isRunning={isRunning}
                speed={speed}
                onToggle={toggle}
                onReset={reset}
                onSpeedChange={setSpeed}
                mode={mode}
                onModeChange={changeMode}
              />
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold font-mono text-foreground">Simulation Environment</h2>
              </div>
              <CarCanvas
                car={state.car}
                track={state.track}
                checkpoints={state.checkpoints}
                width={dimensions.width}
                height={dimensions.height}
                qValues={state.qValues}
              />
            </div>

            {/* Reward Chart (pushed down a bit for nicer spacing) */}
            <div className="mt-4">
              <RewardChart rewardHistory={state.rewardHistory} />
            </div>
          </motion.div>

          {/* Right Column - Controls & Info (Controls removed; metrics take top) */}
          <motion.div 
            className="lg:col-span-4 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Stats Panel (moved up into freed space) */}
            <StatsPanel
              episode={state.episode}
              totalReward={state.totalReward}
              epsilon={state.epsilon}
              avgReward={state.avgReward}
              bestReward={state.bestReward === -Infinity ? 0 : state.bestReward}
              steps={state.steps}
            />

            {/* Neural Network Visualizer (moved up into freed space) */}
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold font-mono text-foreground">Decision Network</span>
            </div>
            <NeuralNetworkVisualizer
              inputValues={state.inputState}
              qValues={state.qValues}
              selectedAction={state.selectedAction}
            />
          </motion.div>
        </div>

        {/* Footer Info */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="glass inline-block rounded-lg px-6 py-3">
            <p className="text-sm text-muted-foreground font-mono">
              🧠 The car learns to navigate using <span className="text-primary">Deep Q-Learning</span> • 
              5 distance sensors → Neural Network → Actions (steer/accelerate/brake)
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
