import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PatternAlert {
  pattern: string;
  symbol: string;
  timeframe: string;
  confidence: number;
  price: number;
  time: string;
}

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

const IntradayPatternScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<PatternAlert[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("5");
  const [candleData, setCandleData] = useState<Record<string, CandleData[]>>({});
  const [newSymbol, setNewSymbol] = useState("");

  // Pattern definitions
  const patterns = {
    bullishEngulfing: (candles: CandleData[]): boolean => {
      if (candles.length < 2) return false;
      const [prev, current] = candles.slice(-2);
      return (
        prev.close < prev.open && // Previous red candle
        current.close > current.open && // Current green candle
        current.open < prev.close && // Current opens below prev close
        current.close > prev.open // Current closes above prev open
      );
    },

    bearishEngulfing: (candles: CandleData[]): boolean => {
      if (candles.length < 2) return false;
      const [prev, current] = candles.slice(-2);
      return (
        prev.close > prev.open && // Previous green candle
        current.close < current.open && // Current red candle
        current.open > prev.close && // Current opens above prev close
        current.close < prev.open // Current closes below prev open
      );
    },

    doji: (candle: CandleData): boolean => {
      const bodySize = Math.abs(candle.open - candle.close);
      const wickSize = candle.high - candle.low;
      return bodySize / wickSize < 0.1;
    },

    hammer: (candle: CandleData): boolean => {
      const bodySize = Math.abs(candle.open - candle.close);
      const upperWick = Math.abs(candle.high - Math.max(candle.open, candle.close));
      const lowerWick = Math.abs(Math.min(candle.open, candle.close) - candle.low);
      return lowerWick > bodySize * 2 && upperWick < bodySize * 0.5;
    }
  };

  const addToWatchlist = () => {
    if (newSymbol && !watchlist.includes(newSymbol)) {
      setWatchlist([...watchlist, newSymbol.toUpperCase()]);
      setNewSymbol("");
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  const generateMockData = (symbol: string) => {
    const data: CandleData[] = [];
    let lastClose = Math.random() * 1000 + 100;
    const now = Date.now();
    
    for (let i = 0; i < 100; i++) {
      const timestamp = now - (100 - i) * parseInt(selectedTimeframe) * 60 * 1000;
      const open = lastClose + (Math.random() - 0.5) * 10;
      const high = Math.max(open * (1 + Math.random() * 0.02), open);
      const low = Math.min(open * (1 - Math.random() * 0.02), open);
      const close = (open + high + low) / 3 + (Math.random() - 0.5) * 5;
      const volume = Math.floor(Math.random() * 100000 + 10000);
      
      data.push({ open, high, low, close, volume, timestamp });
      lastClose = close;
    }
    
    return data;
  };

  const scanPatterns = () => {
    watchlist.forEach(symbol => {
      const data = generateMockData(symbol);
      setCandleData(prev => ({ ...prev, [symbol]: data }));
      
      // Check for patterns
      if (patterns.bullishEngulfing(data)) {
        addAlert(symbol, "Bullish Engulfing", 0.85);
      }
      if (patterns.bearishEngulfing(data)) {
        addAlert(symbol, "Bearish Engulfing", 0.82);
      }
      if (patterns.doji(data[data.length - 1])) {
        addAlert(symbol, "Doji", 0.75);
      }
      if (patterns.hammer(data[data.length - 1])) {
        addAlert(symbol, "Hammer", 0.78);
      }
    });
  };

  const addAlert = (symbol: string, pattern: string, confidence: number) => {
    const newAlert: PatternAlert = {
      pattern,
      symbol,
      timeframe: `${selectedTimeframe}m`,
      confidence,
      price: candleData[symbol]?.[candleData[symbol].length - 1]?.close || 0,
      time: new Date().toLocaleTimeString()
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  useEffect(() => {
    if (scanning) {
      const interval = setInterval(scanPatterns, parseInt(selectedTimeframe) * 1000);
      return () => clearInterval(interval);
    }
  }, [scanning, watchlist, selectedTimeframe]);

  return (
    <div className="p-6">
      <Card className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Intraday Pattern Scanner</h2>
            <Button
              onClick={() => setScanning(!scanning)}
              variant={scanning ? "destructive" : "default"}
            >
              {scanning ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Stop Scanning
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Start Scanning
                </>
              )}
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Add Symbol</Label>
              <div className="flex gap-2">
                <Input
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  placeholder="Enter symbol..."
                  className="flex-1"
                />
                <Button onClick={addToWatchlist}>Add</Button>
              </div>
            </div>
            <div className="w-48">
              <Label>Timeframe</Label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1m</SelectItem>
                  <SelectItem value="5">5m</SelectItem>
                  <SelectItem value="15">15m</SelectItem>
                  <SelectItem value="30">30m</SelectItem>
                  <SelectItem value="60">1h</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Watchlist</h3>
              <div className="space-y-2">
                {watchlist.map((symbol) => (
                  <div
                    key={symbol}
                    className="flex items-center justify-between p-2 bg-accent/10 rounded"
                  >
                    <span>{symbol}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWatchlist(symbol)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {watchlist.length === 0 && (
                  <p className="text-muted-foreground">No symbols added</p>
                )}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Pattern Alerts</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                <AnimatePresence>
                  {alerts.map((alert, index) => (
                    <motion.div
                      key={`${alert.symbol}-${alert.time}-${index}`}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="p-2 bg-accent/10 rounded"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold">{alert.symbol}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {alert.pattern}
                          </span>
                        </div>
                        <span className="text-sm">{alert.time}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm">
                          Price: ₹{alert.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-green-500">
                          {(alert.confidence * 100).toFixed(1)}% confidence
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {alerts.length === 0 && (
                  <p className="text-muted-foreground">No alerts yet</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IntradayPatternScanner;
