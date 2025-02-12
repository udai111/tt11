import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Activity, TrendingUp, TrendingDown, RefreshCw, PlayCircle,
  PauseCircle, Settings2, AlertTriangle, BarChart2, LineChart, Workflow,
  ArrowLeft, Home, AlertCircle, Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { performanceManager, type PerformanceSettings } from "@/lib/performance-manager";
import { cn } from "@/lib/utils";

interface Strategy {
  id: string;
  name: string;
  type: 'trend' | 'mean-reversion' | 'momentum' | 'arbitrage' | 'ml-prediction';
  config: {
    timeframe: string;
    indicator: string;
    entryThreshold: number;
    exitThreshold: number;
    stopLoss: number;
    takeProfit: number;
    riskPercentage: number;
    leverageLevel?: number;
  };
  performance?: {
    winRate: number;
    profitFactor: number;
    sharpeRatio: number;
  };
}

interface Trade {
  id: string;
  strategy: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  quantity: number;
  leverage: number;
  status: 'open' | 'closed';
  pnl?: number;
  timestamp: string;
  risk: {
    stopLoss: number;
    takeProfit: number;
    riskAmount: number;
  };
}

interface MarketData {
  price: number;
  volume: number;
  change24h: number;
  volatility: number;
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
}

const TRAlgoBot = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");
  const [strategies, setStrategies] = useState<Strategy[]>([
    {
      id: "ma-crossover",
      name: "MA Crossover",
      type: "trend",
      config: {
        timeframe: "5m",
        indicator: "MA",
        entryThreshold: 0.02,
        exitThreshold: 0.01,
        stopLoss: 2,
        takeProfit: 4,
        riskPercentage: 1
      },
      performance: {
        winRate: 65.5,
        profitFactor: 1.8,
        sharpeRatio: 1.2
      }
    },
    {
      id: "rsi-mean-reversion",
      name: "RSI Mean Reversion",
      type: "mean-reversion",
      config: {
        timeframe: "15m",
        indicator: "RSI",
        entryThreshold: 30,
        exitThreshold: 70,
        stopLoss: 1.5,
        takeProfit: 3,
        riskPercentage: 1
      },
      performance: {
        winRate: 58.2,
        profitFactor: 1.5,
        sharpeRatio: 0.9
      }
    },
    {
      id: "ml-trend-predictor",
      name: "ML Trend Predictor",
      type: "ml-prediction",
      config: {
        timeframe: "1h",
        indicator: "ML",
        entryThreshold: 0.75,
        exitThreshold: 0.25,
        stopLoss: 2,
        takeProfit: 5,
        riskPercentage: 1.5
      },
      performance: {
        winRate: 72.1,
        profitFactor: 2.1,
        sharpeRatio: 1.5
      }
    }
  ]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [riskPerTrade, setRiskPerTrade] = useState(1);
  const [leverage, setLeverage] = useState(1);
  const [marketData, setMarketData] = useState<MarketData>({
    price: 45000,
    volume: 1200000,
    change24h: 2.5,
    volatility: 1.8,
    rsi: 55,
    macd: {
      value: 125.5,
      signal: 100.2,
      histogram: 25.3
    }
  });
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>({
    useHighPerformanceMode: false,
    enableBackgroundProcessing: false,
    renderQuality: 'medium',
    updateInterval: 1000,
    maxParallelOperations: 2
  });
  const [performanceWarnings, setPerformanceWarnings] = useState<string[]>([]);

  // Advanced risk management
  const validateRiskParameters = useCallback(() => {
    const maxRiskPerTrade = 2; // 2% max risk per trade
    const maxLeverage = 10; // 10x max leverage

    if (riskPerTrade > maxRiskPerTrade) {
      toast({
        title: "Risk Warning",
        description: `Risk per trade cannot exceed ${maxRiskPerTrade}%`,
        variant: "destructive"
      });
      return false;
    }

    if (leverage > maxLeverage) {
      toast({
        title: "Leverage Warning",
        description: `Leverage cannot exceed ${maxLeverage}x`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  }, [riskPerTrade, leverage, toast]);

  // Market analysis and signal generation
  const analyzeMarket = useCallback(() => {
    const strategy = strategies.find(s => s.id === selectedStrategy);
    if (!strategy) return null;

    const signals = {
      rsi: marketData.rsi < 30 ? 'buy' : marketData.rsi > 70 ? 'sell' : 'neutral',
      macd: marketData.macd.histogram > 0 ? 'buy' : 'sell',
      volatility: marketData.volatility > 2 ? 'high' : 'normal',
      trend: marketData.change24h > 0 ? 'bullish' : 'bearish'
    };

    return signals;
  }, [selectedStrategy, strategies, marketData]);

  // Real-time market simulation
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        // Simulate market data updates
        setMarketData(prev => {
          const priceChange = (Math.random() - 0.5) * 100;
          const newPrice = prev.price + priceChange;

          return {
            price: newPrice,
            volume: prev.volume * (1 + (Math.random() - 0.5) * 0.1),
            change24h: ((newPrice - prev.price) / prev.price) * 100,
            volatility: Math.abs(priceChange / prev.price) * 100,
            rsi: Math.min(100, Math.max(0, prev.rsi + (Math.random() - 0.5) * 5)),
            macd: {
              value: prev.macd.value + (Math.random() - 0.5) * 10,
              signal: prev.macd.signal + (Math.random() - 0.5) * 8,
              histogram: prev.macd.value - prev.macd.signal
            }
          };
        });

        // Execute trading logic
        const signals = analyzeMarket();
        if (signals && validateRiskParameters()) {
          executeTrade(signals);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isRunning, selectedStrategy, analyzeMarket, validateRiskParameters]);

  const executeTrade = (signals: any) => {
    const strategy = strategies.find(s => s.id === selectedStrategy);
    if (!strategy) return;

    // Advanced trading logic based on multiple signals
    const shouldTrade =
      (signals.rsi === 'buy' && signals.macd === 'buy' && signals.volatility === 'normal') ||
      (signals.rsi === 'sell' && signals.macd === 'sell' && signals.volatility === 'normal');

    if (shouldTrade) {
      const tradeType = signals.rsi === 'buy' ? 'buy' : 'sell';
      const riskAmount = (marketData.price * riskPerTrade) / 100;

      const newTrade: Trade = {
        id: Date.now().toString(),
        strategy: strategy.name,
        symbol: selectedSymbol,
        type: tradeType,
        entryPrice: marketData.price,
        quantity: (riskAmount / marketData.price) * leverage,
        leverage: leverage,
        status: 'open',
        timestamp: new Date().toISOString(),
        risk: {
          stopLoss: tradeType === 'buy' ?
            marketData.price * (1 - strategy.config.stopLoss / 100) :
            marketData.price * (1 + strategy.config.stopLoss / 100),
          takeProfit: tradeType === 'buy' ?
            marketData.price * (1 + strategy.config.takeProfit / 100) :
            marketData.price * (1 - strategy.config.takeProfit / 100),
          riskAmount: riskAmount
        }
      };

      setTrades(prev => [newTrade, ...prev]);

      toast({
        title: "New Trade Executed",
        description: `${tradeType.toUpperCase()} ${selectedSymbol} at ${marketData.price}`,
        variant: "default"
      });
    }
  };

  const toggleBot = () => {
    if (!selectedStrategy) {
      toast({
        title: "Error",
        description: "Please select a trading strategy first",
        variant: "destructive"
      });
      return;
    }

    if (!validateRiskParameters()) {
      return;
    }

    setIsRunning(!isRunning);

    toast({
      title: isRunning ? "Bot Stopped" : "Bot Started",
      description: `Trading bot has been ${isRunning ? 'stopped' : 'started'} successfully`,
      variant: "default"
    });
  };

  const toggleHighPerformance = () => {
    const newSettings = {
      ...performanceSettings,
      useHighPerformanceMode: !performanceSettings.useHighPerformanceMode
    };
    setPerformanceSettings(newSettings);
    performanceManager.updateSettings(newSettings);

    toast({
      title: newSettings.useHighPerformanceMode ? "High Performance Mode Enabled" : "High Performance Mode Disabled",
      description: newSettings.useHighPerformanceMode
        ? "Using maximum available system resources"
        : "Using balanced system resources",
      variant: "default"
    });
  };

  useEffect(() => {
    const initializePerformance = async () => {
      await performanceManager.detectCapabilities();
      const recommendedSettings = performanceManager.getRecommendedSettings();
      setPerformanceSettings(recommendedSettings);
      performanceManager.updateSettings(recommendedSettings);
      setPerformanceWarnings(performanceManager.getPerformanceWarnings());
    };

    initializePerformance();
  }, []);


  const strategiesCount = strategies.length;
  const activeTradesCount = trades.filter(t => t.status === 'open').length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">TRAlgoBot - Advanced Trading System</h2>
          {isRunning && <Activity className="h-5 w-5 text-green-500 animate-pulse" />}
        </div>
        {performanceWarnings.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-500">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Performance Warnings</span>
            </div>
            <ul className="mt-2 space-y-1">
              {performanceWarnings.map((warning, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>•</span> {warning}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleHighPerformance}
            variant={performanceSettings.useHighPerformanceMode ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Zap className={cn(
              "h-4 w-4",
              performanceSettings.useHighPerformanceMode && "text-yellow-500"
            )} />
            {performanceSettings.useHighPerformanceMode ? "High Performance" : "Normal Mode"}
          </Button>
          <Button
            onClick={toggleBot}
            variant={isRunning ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <PauseCircle className="h-5 w-5" />
                Stop Bot
              </>
            ) : (
              <>
                <PlayCircle className="h-5 w-5" />
                Start Bot
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Link href="/strategy-builder">
          <Button variant="outline" className="w-full">
            <Workflow className="w-4 h-4 mr-2" />
            Strategy Builder
          </Button>
        </Link>
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
          <span>Active Strategies</span>
          <span className="font-bold">{strategiesCount}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
          <span>Active Trades</span>
          <span className="font-bold">{activeTradesCount}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
          <span>Global Rank</span>
          <span className="font-bold text-primary">#42</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Strategy Configuration */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Strategy Configuration</h3>
              <Settings2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div>
                <Label>Trading Pair</Label>
                <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                    <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                    <SelectItem value="BNBUSDT">BNB/USDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Strategy</Label>
                <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {strategies.map(strategy => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Risk Per Trade (%)</Label>
                <Input
                  type="number"
                  value={riskPerTrade}
                  onChange={(e) => setRiskPerTrade(Number(e.target.value))}
                  min="0.1"
                  max="5"
                  step="0.1"
                />
              </div>
              <div>
                <Label>Leverage (x)</Label>
                <Input
                  type="number"
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  min="1"
                  max="10"
                  step="1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Market Overview</h3>
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Current Price</span>
                <span className="text-xl font-bold">
                  ${marketData.price.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>24h Volume</span>
                <span>${(marketData.volume / 1000000).toFixed(2)}M</span>
              </div>
              <div className="flex justify-between items-center">
                <span>24h Change</span>
                <span className={marketData.change24h > 0 ? "text-green-500" : "text-red-500"}>
                  {marketData.change24h.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>RSI</span>
                <span className={
                  marketData.rsi > 70 ? "text-red-500" :
                    marketData.rsi < 30 ? "text-green-500" :
                      "text-yellow-500"
                }>
                  {marketData.rsi.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>MACD</span>
                <span className={marketData.macd.histogram > 0 ? "text-green-500" : "text-red-500"}>
                  {marketData.macd.histogram.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Performance Metrics</h3>
              <LineChart className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {selectedStrategy && strategies.find(s => s.id === selectedStrategy)?.performance ? (
                <>
                  <div className="flex justify-between items-center">
                    <span>Win Rate</span>
                    <span className="text-green-500">
                      {strategies.find(s => s.id === selectedStrategy)?.performance?.winRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Profit Factor</span>
                    <span>{strategies.find(s => s.id === selectedStrategy)?.performance?.profitFactor}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sharpe Ratio</span>
                    <span>{strategies.find(s => s.id === selectedStrategy)?.performance?.sharpeRatio}</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  Select a strategy to view performance metrics
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Trades</h3>
            <RefreshCw className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Strategy</th>
                  <th className="text-left py-2">Symbol</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Entry Price</th>
                  <th className="text-left py-2">Leverage</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">P&L</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b">
                    <td className="py-2">{new Date(trade.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2">{trade.strategy}</td>
                    <td className="py-2">{trade.symbol}</td>
                    <td className="py-2">
                      <span className={trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
                        {trade.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2">${trade.entryPrice.toFixed(2)}</td>
                    <td className="py-2">{trade.leverage}x</td>
                    <td className="py-2">{trade.status}</td>
                    <td className={`py-2 ${trade.pnl && trade.pnl > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.pnl ? `${trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Risk Warning */}
      {(riskPerTrade > 1 || leverage > 5) && (
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">High Risk Warning</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Your current risk settings are higher than recommended. Consider reducing your risk per trade or leverage to protect your capital.
          </p>
        </div>
      )}
    </div>
  );
};

export default TRAlgoBot;