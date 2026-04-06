import type { Viewer } from "cesium";

interface FPSSample {
  index: number;
  timestamp: number;      // performance.now() ms
  elapsed: number;        // 实际采样间隔（秒）
  fps: number;
  frameCount: number;
}

interface ComparisonResult {
  sampleIndex: number;
  timeOffset: string;     // "0.0s", "0.2s" ...
  modelA_fps: number;
  modelB_fps: number;
  diff: number;           // A - B
}

export class FPSSampler {
  private viewer: Viewer;
  private samples: FPSSample[] = [];
  private frameCount: number = 0;
  private lastSampleTime: number = 0;
  private startTime: number = 0;
  private isRunning: boolean = false;
  private sampleInterval: number;
  private handler: (() => void) | null = null;

  constructor(viewer: Viewer, sampleInterval: number = 0.2) {
    this.viewer = viewer;
    this.sampleInterval = sampleInterval;
  }

  start(): void {
    this.samples = [];
    this.frameCount = 0;
    this.startTime = performance.now();
    this.lastSampleTime = this.startTime;
    this.isRunning = true;

    this.handler = (): void => {
      if (!this.isRunning) return;

      this.frameCount++;
      const now = performance.now();
      const elapsed = (now - this.lastSampleTime) / 1000;

      if (elapsed >= this.sampleInterval) {
        this.samples.push({
          index: this.samples.length,
          timestamp: now,
          elapsed: parseFloat(elapsed.toFixed(4)),
          fps: Math.round(this.frameCount / elapsed),
          frameCount: this.frameCount,
        });

        this.frameCount = 0;
        this.lastSampleTime = now;
      }
    };

    this.viewer.scene.postRender.addEventListener(this.handler);
  }

  stop(): FPSSample[] {
    this.isRunning = false;
    if (this.handler) {
      this.viewer.scene.postRender.removeEventListener(this.handler);
      this.handler = null;
    }
    return this.samples;
  }

  getSamples(): FPSSample[] {
    return [...this.samples];
  }

  getAverageFPS(): number {
    if (this.samples.length === 0) return 0;
    const total = this.samples.reduce((sum, s) => sum + s.fps, 0);
    return parseFloat((total / this.samples.length).toFixed(2));
  }

  getMinFPS(): number {
    return Math.min(...this.samples.map((s) => s.fps));
  }

  getMaxFPS(): number {
    return Math.max(...this.samples.map((s) => s.fps));
  }
}

// ─── 对比工具函数 ───────────────────────────────────────────────

export function compareSamplers(
  samplesA: FPSSample[],
  samplesB: FPSSample[],
  interval: number = 0.2
): ComparisonResult[] {
  const len = Math.min(samplesA.length, samplesB.length);
  return Array.from({ length: len }, (_, i) => ({
    sampleIndex: i,
    timeOffset: `${(i * interval).toFixed(1)}s`,
    modelA_fps: samplesA[i].fps,
    modelB_fps: samplesB[i].fps,
    diff: samplesA[i].fps - samplesB[i].fps,
  }));
}

export function exportToCSV(results: ComparisonResult[]): string {
  const header = "time,modelA_fps,modelB_fps,diff";
  const rows = results.map(
    (r) => `${r.timeOffset},${r.modelA_fps},${r.modelB_fps},${r.diff}`
  );
  return [header, ...rows].join("\n");
}