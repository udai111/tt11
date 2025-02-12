import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Activity, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface TradeSignal {
  symbol: string;
  type: 'buy' | 'sell';
  price: number;
  time: string;
  strength: number;
  indicator: string;
}

interface MarketCondition {
  vix: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  volume: number;
  volatility: number;
}

const IntradayTradingPanel = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("NIFTY");
  const [timeframe, setTimeframe] = useState("5");
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [marketCondition, setMarketCondition] = useState<MarketCondition>({
    vix: 15.5,
    trend: 'neutral',
    volume: 100000,
    volatility: 0.8
  });
  const [autoTrade, setAutoTrade] = useState(false);
  const [riskLevel, setRiskLevel] = useState("medium");

  // Simulate market data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketCondition(prev => ({
        ...prev,
        vix: prev.vix + (Math.random() - 0.5) * 2,
        volume: prev.volume + (Math.random() - 0.5) * 10000,
        volatility: Math.max(0.1, Math.min(2, prev.volatility + (Math.random() - 0.5) * 0.1)),
        trend: Math.random() > 0.7 ? 
          (Math.random() > 0.5 ? 'bullish' : 'bearish') : 
          prev.trend
      }));

      // Generate random signals
      if (Math.random() > 0.7) {
        const newSignal: TradeSignal = {
          symbol: selectedSymbol,
          type: Math.random() > 0.5 ? 'buy' : 'sell',
          price: 17500 + Math.random() * 100,
          time: new Date().toLocaleTimeString(),
          strength: Math.random() * 100,
          indicator: ['RSI', 'MACD', 'BB', 'Volume'][Math.floor(Math.random() * 4)]
        };
        setSignals(prev => [newSignal, ...prev].slice(0, 10));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedSymbol]);

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Intraday Analysis</h3>
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-trade">Auto Trade</Label>
            <Switch
              id="auto-trade"
              checked={autoTrade}
              onCheckedChange={setAutoTrade}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Symbol</Label>
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger>
                <SelectValue placeholder="Select symbol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NIFTY">NIFTY</SelectItem>
                <SelectItem value="BANKNIFTY">BANKNIFTY</SelectItem>
                <SelectItem value="RELIANCE">RELIANCE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Timeframe</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1m</SelectItem>
                <SelectItem value="5">5m</SelectItem>
                <SelectItem value="15">15m</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-3">
            <h4 className="text-sm font-medium mb-2">Market Condition</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>VIX</span>
                <span className={marketCondition.vix > 20 ? 'text-red-500' : 'text-green-500'}>
                  {marketCondition.vix.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Trend</span>
                <span className={
                  marketCondition.trend === 'bullish' ? 'text-green-500' :
                  marketCondition.trend === 'bearish' ? 'text-red-500' :
                  'text-yellow-500'
                }>
                  {marketCondition.trend.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Volume</span>
                <span>{Math.floor(marketCondition.volume).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <h4 className="text-sm font-medium mb-2">Risk Settings</h4>
            <Select value={riskLevel} onValueChange={setRiskLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </Card>
        </div>

        <Card className="p-3">
          <h4 className="text-sm font-medium mb-2">Trade Signals</h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {signals.map((signal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between p-2 rounded ${
                  signal.type === 'buy' ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  {signal.type === 'buy' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span>{signal.symbol}</span>
                  <span className="text-sm text-muted-foreground">{signal.indicator}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={signal.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
                    ₹{signal.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">{signal.time}</span>
                </div>
              </motion.div>
            ))}
            {signals.length === 0 && (
              <div className="text-center text-muted-foreground">
                No signals yet
              </div>
            )}
          </div>
        </Card>
      </div>
    </Card>
  );
};

export default IntradayTradingPanel;
