export class Loop {
  constructor(tickCallback, renderCallback) {
    this.tickCallback = tickCallback;
    this.renderCallback = renderCallback;
    this.isRunning = false;
    this.lastTime = 0;
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }

  animate = () => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    this.tickCallback(deltaTime);
    this.renderCallback();

    requestAnimationFrame(this.animate);
  };
}