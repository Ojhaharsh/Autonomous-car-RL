// Simple Neural Network for Q-Learning
export class NeuralNetwork {
  private weights1: number[][];
  private weights2: number[][];
  private bias1: number[];
  private bias2: number[];
  private inputSize: number;
  private hiddenSize: number;
  private outputSize: number;
  private learningRate: number;

  constructor(inputSize: number, hiddenSize: number, outputSize: number, learningRate = 0.01) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;
    this.learningRate = learningRate;

    // Xavier initialization
    this.weights1 = this.initWeights(inputSize, hiddenSize);
    this.weights2 = this.initWeights(hiddenSize, outputSize);
    this.bias1 = new Array(hiddenSize).fill(0);
    this.bias2 = new Array(outputSize).fill(0);
  }

  private initWeights(rows: number, cols: number): number[][] {
    const scale = Math.sqrt(2 / (rows + cols));
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (Math.random() - 0.5) * 2 * scale)
    );
  }

  private relu(x: number): number {
    return Math.max(0, x);
  }

  private reluDerivative(x: number): number {
    return x > 0 ? 1 : 0;
  }

  forward(input: number[]): { output: number[]; hidden: number[]; hiddenRaw: number[] } {
    // Hidden layer
    const hiddenRaw = new Array(this.hiddenSize).fill(0);
    for (let j = 0; j < this.hiddenSize; j++) {
      for (let i = 0; i < this.inputSize; i++) {
        hiddenRaw[j] += input[i] * this.weights1[i][j];
      }
      hiddenRaw[j] += this.bias1[j];
    }
    const hidden = hiddenRaw.map(x => this.relu(x));

    // Output layer (linear for Q-values)
    const output = new Array(this.outputSize).fill(0);
    for (let j = 0; j < this.outputSize; j++) {
      for (let i = 0; i < this.hiddenSize; i++) {
        output[j] += hidden[i] * this.weights2[i][j];
      }
      output[j] += this.bias2[j];
    }

    return { output, hidden, hiddenRaw };
  }

  train(input: number[], targetOutput: number[]): number {
    const { output, hidden, hiddenRaw } = this.forward(input);

    // Calculate loss
    let loss = 0;
    const outputError = new Array(this.outputSize).fill(0);
    for (let i = 0; i < this.outputSize; i++) {
      outputError[i] = targetOutput[i] - output[i];
      loss += outputError[i] * outputError[i];
    }

    // Backpropagation
    // Output layer gradients
    for (let j = 0; j < this.outputSize; j++) {
      for (let i = 0; i < this.hiddenSize; i++) {
        this.weights2[i][j] += this.learningRate * outputError[j] * hidden[i];
      }
      this.bias2[j] += this.learningRate * outputError[j];
    }

    // Hidden layer gradients
    const hiddenError = new Array(this.hiddenSize).fill(0);
    for (let i = 0; i < this.hiddenSize; i++) {
      for (let j = 0; j < this.outputSize; j++) {
        hiddenError[i] += outputError[j] * this.weights2[i][j];
      }
      hiddenError[i] *= this.reluDerivative(hiddenRaw[i]);
    }

    for (let j = 0; j < this.hiddenSize; j++) {
      for (let i = 0; i < this.inputSize; i++) {
        this.weights1[i][j] += this.learningRate * hiddenError[j] * input[i];
      }
      this.bias1[j] += this.learningRate * hiddenError[j];
    }

    return loss / 2;
  }

  predict(input: number[]): number[] {
    return this.forward(input).output;
  }

  getWeights() {
    return {
      weights1: this.weights1,
      weights2: this.weights2,
      bias1: this.bias1,
      bias2: this.bias2
    };
  }
}

// Q-Learning Agent
export class QLearningAgent {
  private network: NeuralNetwork;
  private gamma: number;
  private epsilon: number;
  private epsilonDecay: number;
  private minEpsilon: number;
  private replayBuffer: { state: number[]; action: number; reward: number; nextState: number[]; done: boolean }[];
  private bufferSize: number;
  private batchSize: number;

  constructor(
    stateSize: number,
    actionSize: number,
    hiddenSize = 24,
    learningRate = 0.01,
    gamma = 0.95,
    epsilon = 1.0,
    epsilonDecay = 0.995,
    minEpsilon = 0.01
  ) {
    this.network = new NeuralNetwork(stateSize, hiddenSize, actionSize, learningRate);
    this.gamma = gamma;
    this.epsilon = epsilon;
    this.epsilonDecay = epsilonDecay;
    this.minEpsilon = minEpsilon;
    this.replayBuffer = [];
    this.bufferSize = 2000;
    this.batchSize = 32;
  }

  selectAction(state: number[], actionSize: number): number {
    if (Math.random() < this.epsilon) {
      return Math.floor(Math.random() * actionSize);
    }
    const qValues = this.network.predict(state);
    return qValues.indexOf(Math.max(...qValues));
  }

  remember(state: number[], action: number, reward: number, nextState: number[], done: boolean) {
    this.replayBuffer.push({ state, action, reward, nextState, done });
    if (this.replayBuffer.length > this.bufferSize) {
      this.replayBuffer.shift();
    }
  }

  replay(): number {
    if (this.replayBuffer.length < this.batchSize) return 0;

    let totalLoss = 0;
    const batch = this.sampleBatch();

    for (const experience of batch) {
      const { state, action, reward, nextState, done } = experience;
      
      const currentQ = this.network.predict(state);
      const nextQ = this.network.predict(nextState);
      
      const target = [...currentQ];
      target[action] = done ? reward : reward + this.gamma * Math.max(...nextQ);
      
      totalLoss += this.network.train(state, target);
    }

    // Decay epsilon
    if (this.epsilon > this.minEpsilon) {
      this.epsilon *= this.epsilonDecay;
    }

    return totalLoss / this.batchSize;
  }

  private sampleBatch() {
    const shuffled = [...this.replayBuffer].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, this.batchSize);
  }

  getEpsilon() {
    return this.epsilon;
  }

  getNetwork() {
    return this.network;
  }

  getQValues(state: number[]) {
    return this.network.predict(state);
  }
}
