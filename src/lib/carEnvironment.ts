export interface CarState {
  x: number;
  y: number;
  angle: number;
  speed: number;
  sensors: number[];
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class CarEnvironment {
  private width: number;
  private height: number;
  private car: CarState;
  private obstacles: Obstacle[];
  private checkpoints: { x: number; y: number; passed: boolean }[];
  private numSensors: number;
  private sensorRange: number;
  private startX: number;
  private startY: number;
  private track: { inner: { x: number; y: number }[]; outer: { x: number; y: number }[] };

  constructor(width = 800, height = 600) {
    this.width = width;
    this.height = height;
    this.numSensors = 5;
    this.sensorRange = 150;
    this.startX = width * 0.15;
    this.startY = height * 0.5;
    
    this.track = this.generateTrack();
    this.obstacles = this.generateObstaclesFromTrack();
    this.checkpoints = this.generateCheckpoints();
    this.car = this.resetCar();
  }

  private generateTrack() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const outerRadiusX = this.width * 0.4;
    const outerRadiusY = this.height * 0.38;
    const innerRadiusX = this.width * 0.22;
    const innerRadiusY = this.height * 0.2;
    
    const points = 60;
    const outer: { x: number; y: number }[] = [];
    const inner: { x: number; y: number }[] = [];
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      // Add some variation to make track interesting
      const variation = Math.sin(angle * 3) * 20 + Math.cos(angle * 2) * 15;
      
      outer.push({
        x: cx + Math.cos(angle) * (outerRadiusX + variation),
        y: cy + Math.sin(angle) * (outerRadiusY + variation * 0.5)
      });
      
      inner.push({
        x: cx + Math.cos(angle) * (innerRadiusX + variation * 0.3),
        y: cy + Math.sin(angle) * (innerRadiusY + variation * 0.2)
      });
    }
    
    return { outer, inner };
  }

  private generateObstaclesFromTrack(): Obstacle[] {
    // Track boundaries are handled by collision detection with track walls
    return [];
  }

  private generateCheckpoints() {
    const checkpoints: { x: number; y: number; passed: boolean }[] = [];
    const numCheckpoints = 8;
    
    for (let i = 0; i < numCheckpoints; i++) {
      const idx = Math.floor((i / numCheckpoints) * this.track.outer.length);
      const outer = this.track.outer[idx];
      const inner = this.track.inner[idx];
      
      checkpoints.push({
        x: (outer.x + inner.x) / 2,
        y: (outer.y + inner.y) / 2,
        passed: false
      });
    }
    
    return checkpoints;
  }

  private resetCar(): CarState {
    return {
      x: this.startX,
      y: this.startY,
      angle: 0,
      speed: 0,
      sensors: new Array(this.numSensors).fill(1)
    };
  }

  reset(): number[] {
    this.car = this.resetCar();
    this.checkpoints.forEach(cp => cp.passed = false);
    this.updateSensors();
    return this.getState();
  }

  getState(): number[] {
    return [
      ...this.car.sensors,
      this.car.speed / 5,
      Math.sin(this.car.angle),
      Math.cos(this.car.angle)
    ];
  }

  step(action: number): { state: number[]; reward: number; done: boolean } {
    // Actions: 0=left, 1=straight, 2=right, 3=accelerate, 4=brake
    const turnSpeed = 0.08;
    const acceleration = 0.15;
    const friction = 0.98;
    const maxSpeed = 5;

    // Apply action
    switch (action) {
      case 0: // Turn left
        this.car.angle -= turnSpeed;
        break;
      case 1: // Go straight (accelerate slightly)
        this.car.speed = Math.min(maxSpeed, this.car.speed + acceleration * 0.5);
        break;
      case 2: // Turn right
        this.car.angle += turnSpeed;
        break;
      case 3: // Accelerate
        this.car.speed = Math.min(maxSpeed, this.car.speed + acceleration);
        break;
      case 4: // Brake
        this.car.speed *= 0.8;
        break;
    }

    // Apply friction
    this.car.speed *= friction;

    // Move car
    this.car.x += Math.cos(this.car.angle) * this.car.speed;
    this.car.y += Math.sin(this.car.angle) * this.car.speed;

    // Update sensors
    this.updateSensors();

    // Calculate reward
    let reward = 0;
    let done = false;

    // Reward for moving forward
    reward += this.car.speed * 0.1;

    // Check checkpoint progress
    for (const checkpoint of this.checkpoints) {
      if (!checkpoint.passed) {
        const dist = Math.hypot(this.car.x - checkpoint.x, this.car.y - checkpoint.y);
        if (dist < 40) {
          checkpoint.passed = true;
          reward += 50;
        }
      }
    }

    // Penalty for getting close to walls
    const minSensor = Math.min(...this.car.sensors);
    if (minSensor < 0.3) {
      reward -= (0.3 - minSensor) * 5;
    }

    // Check collision with track boundaries
    if (this.isOutOfTrack()) {
      reward = -100;
      done = true;
    }

    // Check if out of bounds
    if (this.car.x < 0 || this.car.x > this.width || 
        this.car.y < 0 || this.car.y > this.height) {
      reward = -100;
      done = true;
    }

    // Bonus for completing all checkpoints
    if (this.checkpoints.every(cp => cp.passed)) {
      reward += 200;
      this.checkpoints.forEach(cp => cp.passed = false);
    }

    return {
      state: this.getState(),
      reward,
      done
    };
  }

  private isOutOfTrack(): boolean {
    // Check if car is outside outer boundary or inside inner boundary
    const { x, y } = this.car;
    
    // Use ray casting to check if point is inside polygon
    const insideOuter = this.isPointInPolygon(x, y, this.track.outer);
    const insideInner = this.isPointInPolygon(x, y, this.track.inner);
    
    return !insideOuter || insideInner;
  }

  private isPointInPolygon(x: number, y: number, polygon: { x: number; y: number }[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  private updateSensors() {
    const sensorAngles = [-Math.PI/3, -Math.PI/6, 0, Math.PI/6, Math.PI/3];
    
    for (let i = 0; i < this.numSensors; i++) {
      const angle = this.car.angle + sensorAngles[i];
      let minDist = this.sensorRange;
      
      // Cast ray and find distance to track boundaries
      for (let d = 5; d < this.sensorRange; d += 5) {
        const testX = this.car.x + Math.cos(angle) * d;
        const testY = this.car.y + Math.sin(angle) * d;
        
        const insideOuter = this.isPointInPolygon(testX, testY, this.track.outer);
        const insideInner = this.isPointInPolygon(testX, testY, this.track.inner);
        
        if (!insideOuter || insideInner) {
          minDist = d;
          break;
        }
      }
      
      this.car.sensors[i] = minDist / this.sensorRange;
    }
  }

  getCar(): CarState {
    return { ...this.car };
  }

  getTrack() {
    return this.track;
  }

  getCheckpoints() {
    return this.checkpoints;
  }

  getDimensions() {
    return { width: this.width, height: this.height };
  }
}
