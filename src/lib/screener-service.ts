import { technicalAnalysis } from './technical-analysis';

export interface ScreenerState {
  selectedSymbols: string[];
  timeframe: string;
  criteria: {
    minVolume: number;
    minPrice: number;
    maxPrice: number;
    rsiThreshold: number;
    volumeSpike: number;
    priceChange: number;
  };
  results: Array<{
    symbol: string;
    probability: number;
    patterns: Array<{ name: string; significance: string }>;
    indicators: {
      rsi: number;
      macd: {
        macd: number;
        signal: number;
        histogram: number;
      };
      bollingerBands: {
        upper: number;
        middle: number;
        lower: number;
      };
    };
    lastPrice: number;
    volume: number;
  }>;
  isLoading: boolean;
  error: string | null;
}

class ScreenerService {
  private static instance: ScreenerService;
  private subscribers: ((state: ScreenerState) => void)[] = [];

  private state: ScreenerState = {
    selectedSymbols: [],
    timeframe: '5min',
    criteria: {
      minVolume: 100000,
      minPrice: 10,
      maxPrice: 1000,
      rsiThreshold: 70,
      volumeSpike: 2,
      priceChange: 2
    },
    results: [],
    isLoading: false,
    error: null
  };

  private constructor() {}

  static getInstance(): ScreenerService {
    if (!ScreenerService.instance) {
      ScreenerService.instance = new ScreenerService();
    }
    return ScreenerService.instance;
  }

  subscribe(callback: (state: ScreenerState) => void) {
    this.subscribers.push(callback);
    callback(this.state);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notify() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  async updateCriteria(criteria: Partial<ScreenerState['criteria']>) {
    this.state.criteria = { ...this.state.criteria, ...criteria };
    await this.runScreener();
  }

  async setSymbols(symbols: string[]) {
    this.state.selectedSymbols = symbols;
    await this.runScreener();
  }

  setTimeframe(timeframe: string) {
    this.state.timeframe = timeframe;
    this.runScreener();
  }

  async runScreener() {
    try {
      this.state.isLoading = true;
      this.state.error = null;
      this.notify();

      const results = await technicalAnalysis.screenStocks(
        this.state.selectedSymbols,
        {
          ...this.state.criteria,
          timeframe: this.state.timeframe
        }
      );

      this.state.results = results;
    } catch (error: unknown) {
      this.state.error = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Screener error:', error);
    } finally {
      this.state.isLoading = false;
      this.notify();
    }
  }

  getState(): ScreenerState {
    return this.state;
  }
}

export const screenerService = ScreenerService.getInstance();