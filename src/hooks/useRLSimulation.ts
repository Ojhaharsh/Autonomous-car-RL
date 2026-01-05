import { useState, useCallback, useRef, useEffect } from 'react';
import { CarEnvironment } from '@/lib/carEnvironment';
import { QLearningAgent } from '@/lib/neuralNetwork';

export interface SimulationState {
  car: ReturnType<CarEnvironment['getCar']>;
  track: ReturnType<CarEnvironment['getTrack']>;
  checkpoints: ReturnType<CarEnvironment['getCheckpoints']>;
  episode: number;
  totalReward: number;
  steps: number;
  epsilon: number;
  qValues: number[];
  selectedAction: number;
  inputState: number[];
  rewardHistory: number[];
  bestReward: number;
  avgReward: number;
}

export const useRLSimulation = () => {
  const envRef = useRef<CarEnvironment | null>(null);
  const agentRef = useRef<QLearningAgent | null>(null);
  const animationRef = useRef<number | null>(null);
  const episodeRewardsRef = useRef<number[]>([]);

  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(3);
  const [mode, setMode] = useState<'training' | 'inference'>('training');
  const [dimensions] = useState({ width: 800, height: 500 });

  const [state, setState] = useState<SimulationState>(() => {
    const env = new CarEnvironment(800, 500);
    envRef.current = env;
    agentRef.current = new QLearningAgent(8, 5, 24, 0.01, 0.95, 1.0, 0.997, 0.05);
    
    return {
      car: env.getCar(),
      track: env.getTrack(),
      checkpoints: env.getCheckpoints(),
      episode: 0,
      totalReward: 0,
      steps: 0,
      epsilon: 1.0,
      qValues: [0, 0, 0, 0, 0],
      selectedAction: 1,
      inputState: env.getState(),
      rewardHistory: [],
      bestReward: -Infinity,
      avgReward: 0
    };
  });

  const runStep = useCallback(() => {
    const env = envRef.current;
    const agent = agentRef.current;
    if (!env || !agent) return;

    const currentState = env.getState();
    const qValues = agent.getQValues(currentState);
    
    // Select action based on mode
    let action: number;
    if (mode === 'training') {
      action = agent.selectAction(currentState, 5);
    } else {
      // Pure exploitation in inference mode
      action = qValues.indexOf(Math.max(...qValues));
    }

    const { state: nextState, reward, done } = env.step(action);

    if (mode === 'training') {
      agent.remember(currentState, action, reward, nextState, done);
      agent.replay();
    }

    setState(prev => {
      const newTotalReward = prev.totalReward + reward;
      
      if (done) {
        // Episode ended
        episodeRewardsRef.current.push(newTotalReward);
        const rewardHistory = [...prev.rewardHistory, newTotalReward];
        const last10 = rewardHistory.slice(-10);
        const avgReward = last10.reduce((a, b) => a + b, 0) / last10.length;
        
        env.reset();
        
        return {
          ...prev,
          car: env.getCar(),
          checkpoints: env.getCheckpoints(),
          episode: prev.episode + 1,
          totalReward: 0,
          steps: 0,
          epsilon: agent.getEpsilon(),
          qValues,
          selectedAction: action,
          inputState: currentState,
          rewardHistory,
          bestReward: Math.max(prev.bestReward, newTotalReward),
          avgReward
        };
      }

      return {
        ...prev,
        car: env.getCar(),
        checkpoints: env.getCheckpoints(),
        totalReward: newTotalReward,
        steps: prev.steps + 1,
        epsilon: agent.getEpsilon(),
        qValues,
        selectedAction: action,
        inputState: currentState
      };
    });
  }, [mode]);

  const gameLoop = useCallback(() => {
    for (let i = 0; i < speed; i++) {
      runStep();
    }
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [runStep, speed]);

  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(gameLoop);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, gameLoop]);

  const toggle = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    
    const env = new CarEnvironment(dimensions.width, dimensions.height);
    envRef.current = env;
    agentRef.current = new QLearningAgent(8, 5, 24, 0.01, 0.95, 1.0, 0.997, 0.05);
    episodeRewardsRef.current = [];

    setState({
      car: env.getCar(),
      track: env.getTrack(),
      checkpoints: env.getCheckpoints(),
      episode: 0,
      totalReward: 0,
      steps: 0,
      epsilon: 1.0,
      qValues: [0, 0, 0, 0, 0],
      selectedAction: 1,
      inputState: env.getState(),
      rewardHistory: [],
      bestReward: -Infinity,
      avgReward: 0
    });
  }, [dimensions]);

  const changeMode = useCallback((newMode: 'training' | 'inference') => {
    setMode(newMode);
    if (newMode === 'inference' && agentRef.current) {
      // Reset episode for clean inference run
      envRef.current?.reset();
      setState(prev => ({
        ...prev,
        car: envRef.current!.getCar(),
        checkpoints: envRef.current!.getCheckpoints(),
        totalReward: 0,
        steps: 0
      }));
    }
  }, []);

  return {
    state,
    isRunning,
    speed,
    mode,
    dimensions,
    toggle,
    reset,
    setSpeed,
    changeMode
  };
};
