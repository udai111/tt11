import * as tf from '@tensorflow/tfjs';

export interface PerformanceSettings {
  useHighPerformanceMode: boolean;
  enableBackgroundProcessing: boolean;
  renderQuality: 'low' | 'medium' | 'high';
  updateInterval: number;
  maxParallelOperations: number;
  batchSize: number;
  useWebWorkers: boolean;
  enableMemoryOptimization: boolean;
}

class PerformanceManager {
  private static instance: PerformanceManager;
  private settings: PerformanceSettings = {
    useHighPerformanceMode: true,
    enableBackgroundProcessing: true,
    renderQuality: 'high',
    updateInterval: 100, // Even faster updates
    maxParallelOperations: 8, // More parallel ops
    batchSize: 128, // Larger batch size
    useWebWorkers: true,
    enableMemoryOptimization: true
  };
  private initialized = false;

  private constructor() {}

  static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  async updateSettings(newSettings: Partial<PerformanceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    await this.applySettings();
  }

  private async applySettings() {
    if (this.initialized) {
      await this.updateBackend();
      return;
    }

    try {
      await this.updateBackend();

      if (this.settings.enableMemoryOptimization) {
        tf.engine().startScope();
        tf.tidy(() => {});
        tf.engine().reset(); // Clear any leftover memory
      }

      await tf.ready();
      tf.enableProdMode();

      // Configure WebGL for better performance
      const gl = (tf.backend() as any).getGLContext?.();
      if (gl) {
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.STENCIL_TEST);
        gl.disable(gl.BLEND);
        gl.getExtension('WEBGL_lose_context');
      }

      this.initialized = true;
    } catch (e) {
      console.warn('Failed to configure TensorFlow.js backend:', e);
      await tf.setBackend('cpu');
      await tf.ready();
    }
  }

  private async updateBackend() {
    if (this.settings.useHighPerformanceMode) {
      try {
        await tf.setBackend('webgl');
        const gl = (tf.backend() as any).getGLContext?.();
        if (gl) {
          gl.powerPreference = 'high-performance';
        }
        console.log('GPU mode enabled successfully');
      } catch (e) {
        console.warn('Failed to enable GPU mode, using CPU:', e);
        await tf.setBackend('cpu');
      }
    } else {
      await tf.setBackend('cpu');
      console.log('CPU mode enabled');
    }
  }

  detectCapabilities(): { webgl: boolean } {
    const webgl = tf.findBackend('webgl') !== undefined;
    return { webgl };
  }

  getRecommendedSettings(): PerformanceSettings {
    const capabilities = this.detectCapabilities();
    return {
      ...this.settings,
      useHighPerformanceMode: capabilities.webgl,
      renderQuality: capabilities.webgl ? 'high' : 'medium'
    };
  }

  getCurrentSettings(): PerformanceSettings {
    return { ...this.settings };
  }
}

export const performanceManager = PerformanceManager.getInstance();