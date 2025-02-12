import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart2,
  LineChart,
  RefreshCw,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { technicalAnalysis } from "@/lib/technical-analysis";
import { screenerService, type ScreenerState } from "@/lib/screener-service";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function IntradayProbabilityPage() {
  const [state, setState] = useState<ScreenerState>(screenerService.getState());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedStock, setSelectedStock] = useState(state.selectedSymbols[0] || "");
  const [volumeProfile, setVolumeProfile] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [marketBreadth, setMarketBreadth] = useState<any>(null);

  const stockOptions = [
    "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK",
    "WIPRO", "BAJFINANCE", "BHARTIARTL", "ASIANPAINT", "MARUTI"
  ];

  const timeframeOptions = ["1min", "5min", "15min", "30min", "1H", "4H", "1D"];

  useEffect(() => {
    const unsubscribe = screenerService.subscribe(setState);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedStock) {
      screenerService.setSymbols([selectedStock]);
    }
  }, [selectedStock]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        screenerService.runScreener();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const updateCriteria = useCallback((key: keyof ScreenerState['criteria'], value: number) => {
    screenerService.updateCriteria({ [key]: value });
  }, []);

  const handleTimeframeChange = useCallback((value: string) => {
    screenerService.setTimeframe(value);
  }, []);

  const currentResult = state.results.find(r => r.symbol === selectedStock);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Live Intraday Probability</h1>
          <p className="text-muted-foreground">
            Advanced technical analysis and market predictions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedStock} onValueChange={setSelectedStock}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select stock" />
            </SelectTrigger>
            <SelectContent>
              {stockOptions.map((stock) => (
                <SelectItem key={stock} value={stock}>
                  {stock}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={state.timeframe} onValueChange={handleTimeframeChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeframeOptions.map((tf) => (
                <SelectItem key={tf} value={tf}>
                  {tf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              id="auto-refresh"
            />
            <Label htmlFor="auto-refresh">Auto Refresh</Label>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => screenerService.runScreener()}
            disabled={state.isLoading}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                state.isLoading && "animate-spin"
              )}
            />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Probability Score Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Probability Analysis</h2>
          <div className="space-y-4">
            {currentResult ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Overall Probability</span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    currentResult.probability > 0.7 ? "bg-green-500/20 text-green-500" :
                    currentResult.probability > 0.4 ? "bg-yellow-500/20 text-yellow-500" :
                    "bg-red-500/20 text-red-500"
                  )}>
                    {(currentResult.probability * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="space-y-2">
                  {currentResult.patterns.map((pattern: any, index: number) => (
                    <div
                      key={index}
                      className="bg-accent/10 p-3 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <span>{pattern.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {pattern.significance}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-40">
                <Activity className="w-8 h-8 animate-spin" />
              </div>
            )}
          </div>
        </Card>

        {/* Technical Indicators Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Technical Analysis</h2>
          {currentResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <div className="text-sm font-medium">RSI</div>
                  <div className="text-2xl font-semibold">
                    {currentResult.indicators.rsi.toFixed(2)}
                  </div>
                </div>
                <div className="bg-accent/10 p-3 rounded-lg">
                  <div className="text-sm font-medium">MACD</div>
                  <div className="text-2xl font-semibold">
                    {currentResult.indicators.macd.macd.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Volume Profile</Label>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={volumeProfile}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="price" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="volume"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <Activity className="w-8 h-8 animate-spin" />
            </div>
          )}
        </Card>

        {/* Screener Settings Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Screener Settings</h2>
          <div className="space-y-6">
            <div>
              <Label>Minimum Volume</Label>
              <Slider
                value={[state.criteria.minVolume]}
                onValueChange={([value]) => updateCriteria('minVolume', value)}
                min={0}
                max={1000000}
                step={10000}
              />
            </div>

            <div>
              <Label>RSI Threshold</Label>
              <Slider
                value={[state.criteria.rsiThreshold]}
                onValueChange={([value]) => updateCriteria('rsiThreshold', value)}
                min={0}
                max={100}
                step={1}
              />
            </div>

            <div>
              <Label>Volume Spike</Label>
              <Slider
                value={[state.criteria.volumeSpike]}
                onValueChange={([value]) => updateCriteria('volumeSpike', value)}
                min={1}
                max={10}
                step={0.1}
              />
            </div>

            <div>
              <Label>Price Change (%)</Label>
              <Slider
                value={[state.criteria.priceChange]}
                onValueChange={([value]) => updateCriteria('priceChange', value)}
                min={0}
                max={10}
                step={0.1}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Market Breadth */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Market Breadth</h2>
        {marketBreadth ? (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-accent/10 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">A/D Ratio</div>
              <div className="text-2xl font-semibold">
                {marketBreadth.advanceDeclineRatio.toFixed(2)}
              </div>
            </div>
            <div className="bg-accent/10 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Advancers</div>
              <div className="text-2xl font-semibold text-green-500">
                {marketBreadth.advancers}
              </div>
            </div>
            <div className="bg-accent/10 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Decliners</div>
              <div className="text-2xl font-semibold text-red-500">
                {marketBreadth.decliners}
              </div>
            </div>
            <div className="bg-accent/10 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Unchanged</div>
              <div className="text-2xl font-semibold">
                {marketBreadth.unchanged}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <Activity className="w-8 h-8 animate-spin" />
          </div>
        )}
      </Card>

      {state.error && (
        <div className="fixed bottom-4 right-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            {state.error}
          </motion.div>
        </div>
      )}
    </div>
  );
}