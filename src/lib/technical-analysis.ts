import { DateTime } from 'luxon';
import * as tf from '@tensorflow/tfjs';
import { SMA, RSI, MACD, BollingerBands } from 'trading-signals';

export interface StockData {
  symbol: string;
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
  timestamp: number[];
}

export interface IndicatorResult {
  value: number;
  signal?: 'buy' | 'sell' | 'neutral';
  strength?: 'strong' | 'moderate' | 'weak';
}

export class TechnicalAnalysis {
  private static instance: TechnicalAnalysis;
  private mlModel: tf.LayersModel | null = null;
  private backendType: string = 'cpu';

  private constructor() {}

  static getInstance(): TechnicalAnalysis {
    if (!TechnicalAnalysis.instance) {
      TechnicalAnalysis.instance = new TechnicalAnalysis();
    }
    return TechnicalAnalysis.instance;
  }

  async calculateRSI(data: number[], period: number = 14): Promise<IndicatorResult> {
    const rsi = new RSI(period);
    data.forEach(price => rsi.update(price));
    const value = Number(rsi.getResult().toString());

    return {
      value,
      signal: value > 70 ? 'sell' : value < 30 ? 'buy' : 'neutral',
      strength: value > 80 || value < 20 ? 'strong' : value > 70 || value < 30 ? 'moderate' : 'weak'
    };
  }

  async calculateBollingerBands(data: number[], period: number = 20): Promise<{
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
  }> {
    const bb = new BollingerBands(period);
    data.forEach(price => bb.update(price));
    const result = bb.getResult();

    return {
      upper: Number(result.upper.toString()),
      middle: Number(result.middle.toString()),
      lower: Number(result.lower.toString()),
      bandwidth: Number(((result.upper.toNumber() - result.lower.toNumber()) / result.middle.toNumber()).toFixed(4))
    };
  }

  async calculateMACD(data: number[]): Promise<{
    macd: number;
    signal: number;
    histogram: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  }> {
    const macd = new MACD({
      indicator: SMA,
      shortInterval: 12,
      longInterval: 26,
      signalInterval: 9
    });

    data.forEach(price => macd.update(price));
    const result = macd.getResult();

    const macdValue = Number(result.macd.toString());
    const signalValue = Number(result.signal.toString());
    const histogramValue = Number(result.histogram.toString());

    return {
      macd: macdValue,
      signal: signalValue,
      histogram: histogramValue,
      trend: histogramValue > 0 ? 'bullish' : histogramValue < 0 ? 'bearish' : 'neutral'
    };
  }

  async detectPatterns(data: StockData): Promise<Array<{
    pattern: string;
    significance: 'high' | 'medium' | 'low';
    action: 'buy' | 'sell' | 'neutral';
  }>> {
    const patterns = [];
    const lastIndex = data.close.length - 1;

    // Doji Pattern
    const doji = this.isDoji(data.open[lastIndex], data.high[lastIndex], 
                           data.low[lastIndex], data.close[lastIndex]);
    if (doji) {
      patterns.push({
        pattern: 'Doji',
        significance: 'high',
        action: 'neutral'
      });
    }

    // Hammer Pattern
    const hammer = this.isHammer(data.open[lastIndex], data.high[lastIndex],
                               data.low[lastIndex], data.close[lastIndex]);
    if (hammer) {
      patterns.push({
        pattern: 'Hammer',
        significance: 'high',
        action: 'buy'
      });
    }

    // Engulfing Pattern
    if (lastIndex > 0) {
      const engulfing = this.isEngulfing(
        data.open[lastIndex - 1], data.close[lastIndex - 1],
        data.open[lastIndex], data.close[lastIndex]
      );
      if (engulfing) {
        patterns.push({
          pattern: engulfing === 'bullish' ? 'Bullish Engulfing' : 'Bearish Engulfing',
          significance: 'high',
          action: engulfing === 'bullish' ? 'buy' : 'sell'
        });
      }
    }

    return patterns;
  }

  private isDoji(open: number, high: number, low: number, close: number): boolean {
    const bodySize = Math.abs(close - open);
    const totalRange = high - low;
    return bodySize / totalRange < 0.1;
  }

  private isHammer(open: number, high: number, low: number, close: number): boolean {
    const bodySize = Math.abs(close - open);
    const upperWick = high - Math.max(open, close);
    const lowerWick = Math.min(open, close) - low;
    return lowerWick > 2 * bodySize && upperWick < 0.1 * bodySize;
  }

  private isEngulfing(prevOpen: number, prevClose: number, 
                     currOpen: number, currClose: number): 'bullish' | 'bearish' | null {
    const prevBody = Math.abs(prevClose - prevOpen);
    const currBody = Math.abs(currClose - currOpen);

    if (currBody > prevBody) {
      if (currClose > currOpen && prevClose < prevOpen) return 'bullish';
      if (currClose < currOpen && prevClose > prevOpen) return 'bearish';
    }
    return null;
  }

  async analyzeVolume(data: StockData): Promise<{
    volumeSpike: boolean;
    averageVolume: number;
    relativeVolume: number;
  }> {
    const recentVolumes = data.volume.slice(-5);
    const averageVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
    const currentVolume = data.volume[data.volume.length - 1];
    const relativeVolume = currentVolume / averageVolume;

    return {
      volumeSpike: relativeVolume > 2,
      averageVolume,
      relativeVolume
    };
  }

  async getAlertConditions(data: StockData): Promise<Array<{
    type: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
  }>> {
    const alerts = [];
    const lastPrice = data.close[data.close.length - 1];
    const lastVolume = data.volume[data.volume.length - 1];

    // RSI Alerts
    const rsi = await this.calculateRSI(data.close);
    if (rsi.value > 70) {
      alerts.push({
        type: 'RSI',
        message: `Overbought condition - RSI at ${rsi.value.toFixed(2)}`,
        severity: 'high'
      });
    } else if (rsi.value < 30) {
      alerts.push({
        type: 'RSI',
        message: `Oversold condition - RSI at ${rsi.value.toFixed(2)}`,
        severity: 'high'
      });
    }

    // Volume Alerts
    const volumeAnalysis = await this.analyzeVolume(data);
    if (volumeAnalysis.volumeSpike) {
      alerts.push({
        type: 'Volume',
        message: `Volume spike detected - ${volumeAnalysis.relativeVolume.toFixed(1)}x average`,
        severity: 'medium'
      });
    }

    return alerts;
  }


  async calculateIndicators(data: StockData) {
    const rsiResult = await this.calculateRSI(data.close);
    const sma20 = new SMA(20, { initValue: data.close[0] });
    const sma50 = new SMA(50, { initValue: data.close[0] });
    const sma200 = new SMA(200, { initValue: data.close[0] });
    const bbResult = await this.calculateBollingerBands(data.close);
    const macdResult = await this.calculateMACD(data.close);

    const indicators = {
      rsi: [rsiResult.value],
      sma20: [],
      sma50: [],
      sma200: [],
      bb: [{ upper: bbResult.upper, middle: bbResult.middle, lower: bbResult.lower }],
      macd: [{ macd: macdResult.macd, signal: macdResult.signal, histogram: macdResult.histogram }]
    };

    data.close.forEach((price, index) => {
      if (index > 0) {
        sma20.update(price);
        sma50.update(price);
        sma200.update(price);
      }
      indicators.sma20.push(Number(sma20.getResult().toString()));
      indicators.sma50.push(Number(sma50.getResult().toString()));
      indicators.sma200.push(Number(sma200.getResult().toString()));
    });

    return indicators;
  }


  async calculateVolumeProfile(data: StockData) {
    const volumeByPrice: { [key: number]: number } = {};
    const priceIncrement = 0.1;

    for (let i = 0; i < data.close.length; i++) {
      const price = Math.round(data.close[i] / priceIncrement) * priceIncrement;
      volumeByPrice[price] = (volumeByPrice[price] || 0) + data.volume[i];
    }

    return Object.entries(volumeByPrice)
      .map(([price, volume]) => ({ price: parseFloat(price), volume }))
      .sort((a, b) => a.price - b.price);
  }


  async screenStocks(symbols: string[], criteria: ScreenerCriteria) {
    const results = [];

    for (const symbol of symbols) {
      try {
        const stockData = await this.fetchStockData(symbol, criteria.timeframe);
        const indicators = await this.calculateIndicators(stockData);
        const patterns = await this.detectPatterns(stockData);
        const alerts = await this.getAlertConditions(stockData);
        const volumeAnalysis = await this.analyzeVolume(stockData);

        const meetsCriteria = (
          (!criteria.minPrice || stockData.close[stockData.close.length - 1] >= criteria.minPrice) &&
          (!criteria.maxPrice || stockData.close[stockData.close.length - 1] <= criteria.maxPrice) &&
          (!criteria.minVolume || stockData.volume[stockData.volume.length - 1] >= criteria.minVolume) &&
          (!criteria.volumeSpike || volumeAnalysis.relativeVolume >= criteria.volumeSpike) &&
          (!criteria.rsiThreshold || indicators.rsi[indicators.rsi.length - 1] <= criteria.rsiThreshold)
        );

        if (meetsCriteria) {
          results.push({
            symbol,
            alerts,
            patterns,
            indicators: {
              rsi: indicators.rsi[indicators.rsi.length - 1],
              macd: indicators.macd[indicators.macd.length - 1],
              bollingerBands: indicators.bb[indicators.bb.length - 1],
              sma20: indicators.sma20[indicators.sma20.length-1],
              sma50: indicators.sma50[indicators.sma50.length-1],
              sma200: indicators.sma200[indicators.sma200.length-1]
            },
            lastPrice: stockData.close[stockData.close.length - 1],
            volume: stockData.volume[stockData.volume.length - 1]
          });
        }
      } catch (error) {
        console.error(`Error screening ${symbol}:`, error);
      }
    }

    return results;
  }

  private async fetchStockData(symbol: string, timeframe: string): Promise<StockData> {
    const endDate = DateTime.now();
    const startDate = endDate.minus({ days: 30 });

    const data: StockData = {
      symbol,
      open: [],
      high: [],
      low: [],
      close: [],
      volume: [],
      timestamp: []
    };

    let currentDate = startDate;
    let basePrice = Math.random() * 1000;

    while (currentDate <= endDate) {
      if (currentDate.weekday <= 5) {
        const volatility = basePrice * 0.02;
        const open = basePrice + (Math.random() - 0.5) * volatility;
        const close = open + (Math.random() - 0.5) * volatility;
        const high = Math.max(open, close) + Math.random() * volatility;
        const low = Math.min(open, close) - Math.random() * volatility;

        data.open.push(open);
        data.high.push(high);
        data.low.push(low);
        data.close.push(close);
        data.volume.push(Math.floor(Math.random() * 1000000));
        data.timestamp.push(currentDate.toMillis());

        basePrice = close;
      }
      currentDate = currentDate.plus({ days: 1 });
    }

    return data;
  }

  //The ML model related functions are preserved.

  private async initializeMLModel() {
    try {
      // Setup TensorFlow backend with fallback
      this.backendType = await setupTensorFlowBackend();

      const model = tf.sequential();
      model.add(tf.layers.lstm({
        units: 50,
        returnSequences: true,
        inputShape: [30, 5]
      }));
      model.add(tf.layers.dropout({ rate: 0.2 }));
      model.add(tf.layers.lstm({ units: 50, returnSequences: false }));
      model.add(tf.layers.dense({ units: 1 }));

      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError'
      });

      this.mlModel = model;
      console.log(`ML model initialized using ${this.backendType} backend`);
    } catch (error) {
      console.error('Failed to initialize ML model:', error);
      throw new Error('ML model initialization failed');
    }
  }

  async predictProbability(data: StockData): Promise<number> {
    if (!this.mlModel) return 0;

    try {
      const inputFeatures = tf.tensor3d([this.prepareFeatures(data)]);
      const prediction = this.mlModel.predict(inputFeatures) as tf.Tensor;
      const probability = (await prediction.data())[0];

      inputFeatures.dispose();
      prediction.dispose();

      return Math.min(Math.max(probability, 0), 1);
    } catch (error) {
      console.error('Prediction error:', error);
      return 0;
    }
  }

  private prepareFeatures(data: StockData) {
    const features = [];
    const windowSize = 30;

    for (let i = Math.max(0, data.close.length - windowSize); i < data.close.length; i++) {
      features.push([
        data.open[i],
        data.high[i],
        data.low[i],
        data.close[i],
        data.volume[i]
      ]);
    }

    while (features.length < windowSize) {
      features.unshift([0, 0, 0, 0, 0]);
    }

    return features;
  }

  async initializeTensorFlow():Promise<string>{
    return await setupTensorFlowBackend();
  }
  getBackendType(): string {
    return this.backendType;
  }
}

// Initialize TensorFlow backend with fallback
async function setupTensorFlowBackend() {
  try {
    const webglVersion = tf.ENV.get('WEBGL_VERSION');
    if (!webglVersion) {
      console.log('WebGL not available, falling back to CPU backend');
      await tf.setBackend('cpu');
      return 'cpu';
    }
    await tf.setBackend('webgl');
    return 'webgl';
  } catch (error) {
    console.warn('Error initializing WebGL backend:', error);
    await tf.setBackend('cpu');
    return 'cpu';
  }
}


export interface ScreenerCriteria {
  minVolume?: number;
  minPrice?: number;
  maxPrice?: number;
  rsiThreshold?: number;
  volumeSpike?: number;
  priceChange?: number;
  timeframe: string;
}

export const technicalAnalysis = TechnicalAnalysis.getInstance();