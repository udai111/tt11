import { useEffect, useState, useRef, memo } from "react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, TrendingUp, TrendingDown, BarChart2, HelpCircle, Bitcoin, LineChart, Globe, CandlestickChart, Bell, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const NormalChart = memo(({ data }: { data: CandlestickData[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredPrice, setHoveredPrice] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    setIsLoading(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.fillStyle = '#131722';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(42, 46, 57, 0.5)';
    ctx.lineWidth = 0.5;

    for (let i = 0; i < 10; i++) {
      const y = (canvas.height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    const candleWidth = (canvas.width / data.length) * 0.8;
    const spacing = (canvas.width / data.length) * 0.2;

    data.forEach((candle, i) => {
      const x = (candleWidth + spacing) * i;

      const getY = (price: number) =>
        ((maxPrice - price) / priceRange) * (canvas.height * 0.8) + (canvas.height * 0.1);

      ctx.fillStyle = candle.close > candle.open ? '#26a69a' : '#ef5350';
      const openY = getY(candle.open);
      const closeY = getY(candle.close);
      ctx.fillRect(
        x,
        Math.min(openY, closeY),
        candleWidth,
        Math.abs(closeY - openY)
      );

      ctx.strokeStyle = candle.close > candle.open ? '#26a69a' : '#ef5350';
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, getY(candle.high));
      ctx.lineTo(x + candleWidth / 2, Math.min(openY, closeY));
      ctx.moveTo(x + candleWidth / 2, Math.max(openY, closeY));
      ctx.lineTo(x + candleWidth / 2, getY(candle.low));
      ctx.stroke();
    });

    ctx.fillStyle = '#d1d4dc';
    ctx.font = '12px sans-serif';
    for (let i = 0; i <= 10; i++) {
      const price = minPrice + (priceRange * (i / 10));
      const y = (canvas.height / 10) * i;
      ctx.fillText(price.toFixed(2), 10, y - 5);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const candleIndex = Math.floor(x / (candleWidth + spacing));

      if (candleIndex >= 0 && candleIndex < data.length) {
        const candle = data[candleIndex];
        setHoveredPrice(
          `O: ${candle.open.toFixed(2)} H: ${candle.high.toFixed(2)} L: ${candle.low.toFixed(2)} C: ${candle.close.toFixed(2)}`
        );
      } else {
        setHoveredPrice(null);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    setTimeout(() => setIsLoading(false), 500);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [data]);

  return (
    <div className="relative">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 flex items-center justify-center z-50"
          >
            <div className="flex flex-col items-center gap-4">
              <Activity className="w-8 h-8 animate-pulse" />
              <p>Loading Chart...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-[500px]"
          style={{ height: '500px' }}
        />
        {hoveredPrice && (
          <div className="absolute top-4 right-4 bg-background/90 p-2 rounded shadow">
            {hoveredPrice}
          </div>
        )}
      </div>
    </div>
  );
});

NormalChart.displayName = 'NormalChart';

interface PatternData {
  name: string;
  probability: number;
  strength: number;
  successRate: number;
  recentSignals: number;
  signalType: 'buy' | 'sell' | 'neutral';
  timeframe: string;
  example: {
    entry: number;
    target: number;
    stopLoss: number;
  };
  description: string;
}

interface StockPattern {
  symbol: string;
  patterns: PatternData[];
}

interface CustomDrawing {
  type: 'trendline' | 'fibonacci' | 'rectangle' | 'circle';
  points: { x: number; y: number }[];
  color: string;
}

const ALL_PATTERNS = [
  "Doji", "Hammer", "Shooting Star", "Engulfing", "Morning Star",
  "Evening Star", "Harami", "Three White Soldiers", "Three Black Crows",
  "Piercing Line", "Dark Cloud Cover", "Rising Three Methods",
  "Falling Three Methods", "Three Inside Up", "Three Inside Down",
  "Head and Shoulders", "Inverse Head and Shoulders", "Double Top",
  "Double Bottom", "Triple Top", "Triple Bottom", "Rounding Bottom",
  "Cup and Handle", "Flag", "Pennant", "Wedge", "Triangle",
  "Diamond Top", "Diamond Bottom", "Butterfly", "Gartley",
  "Bat Pattern", "Crab Pattern", "Shark Pattern", "ABCD Pattern"
];

const ChartScanAIChart = memo(({ data }: { data: CandlestickData[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredPattern, setHoveredPattern] = useState<string | null>(null);
  const [patterns, setPatterns] = useState<Array<{
    type: string;
    startIndex: number;
    endIndex: number;
    confidence: number;
  }>>([]);

  useEffect(() => {
    if (!canvasRef.current) return;
    setIsLoading(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.fillStyle = '#131722';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(42, 46, 57, 0.5)';
    ctx.lineWidth = 0.5;

    const gridLines = 10;
    for (let i = 0; i <= gridLines; i++) {
      const y = (canvas.height / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.1;

    const candleWidth = (canvas.width / data.length) * 0.8;
    const spacing = (canvas.width / data.length) * 0.2;

    const getY = (price: number) =>
      ((maxPrice + padding - price) / (priceRange + 2 * padding)) * canvas.height;

    data.forEach((candle, i) => {
      const x = (candleWidth + spacing) * i;

      const isGreen = candle.close > candle.open;
      ctx.fillStyle = isGreen ? '#26a69a' : '#ef5350';
      ctx.strokeStyle = isGreen ? '#26a69a' : '#ef5350';

      const openY = getY(candle.open);
      const closeY = getY(candle.close);
      const highY = getY(candle.high);
      const lowY = getY(candle.low);

      ctx.fillRect(
        x,
        Math.min(openY, closeY),
        candleWidth,
        Math.abs(closeY - openY) || 1
      );

      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, Math.min(openY, closeY));
      ctx.moveTo(x + candleWidth / 2, Math.max(openY, closeY));
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();

      if (i >= 2) {
        const bodySize = Math.abs(candle.open - candle.close);
        const wickSize = candle.high - candle.low;
        if (bodySize / wickSize < 0.1) {
          patterns.push({
            type: 'Doji',
            startIndex: i,
            endIndex: i,
            confidence: 0.85
          });
        }

        const upperWick = Math.abs(candle.high - Math.max(candle.open, candle.close));
        const lowerWick = Math.abs(Math.min(candle.open, candle.close) - candle.low);
        if (lowerWick > bodySize * 2 && upperWick < bodySize * 0.5) {
          patterns.push({
            type: 'Hammer',
            startIndex: i,
            endIndex: i,
            confidence: 0.75
          });
        }
      }
    });

    patterns.forEach(pattern => {
      const x = (candleWidth + spacing) * pattern.startIndex;
      ctx.fillStyle = '#FFD700';
      ctx.font = '12px sans-serif';
      ctx.fillText(pattern.type, x, 20);
    });

    ctx.fillStyle = '#d1d4dc';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    for (let i = 0; i <= 10; i++) {
      const price = minPrice + (priceRange * (i / 10));
      const y = (canvas.height / 10) * i;
      ctx.fillText(price.toFixed(2), 10, y - 5);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const candleIndex = Math.floor(x / (candleWidth + spacing));

      const patternAtPosition = patterns.find(p =>
        p.startIndex <= candleIndex && p.endIndex >= candleIndex
      );

      if (patternAtPosition) {
        setHoveredPattern(
          `${patternAtPosition.type} (${(patternAtPosition.confidence * 100).toFixed(1)}% confidence)`
        );
      } else {
        setHoveredPattern(null);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    setTimeout(() => setIsLoading(false), 500);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [data]);

  return (
    <div className="relative">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 flex items-center justify-center z-50"
          >
            <div className="flex flex-col items-center gap-4">
              <Activity className="w-8 h-8 animate-pulse" />
              <p>Analyzing Patterns...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-[500px]"
          style={{ height: '500px' }}
        />
        {hoveredPattern && (
          <div className="absolute top-4 right-4 bg-background/90 p-2 rounded shadow">
            {hoveredPattern}
          </div>
        )}
      </div>
    </div>
  );
});

ChartScanAIChart.displayName = 'ChartScanAIChart';

type MarketType = 'indian' | 'international' | 'crypto';

interface PriceData {
  [key: string]: number;
}

interface MarketPrices {
  indian: PriceData;
  international: PriceData;
  crypto: PriceData;
}

const fetchActivePatterns = async (symbol: string) => {
  const response = await fetch(`/api/patterns/active/${symbol}`);
  if (!response.ok) throw new Error('Failed to fetch active patterns');
  return response.json();
};

const fetchTechnicalIndicators = async (symbol: string) => {
  const response = await fetch(`/api/indicators/latest/${symbol}`);
  if (!response.ok) throw new Error('Failed to fetch technical indicators');
  return response.json();
};

const fetchScreenerResults = async (symbol: string) => {
  const response = await fetch(`/api/screener/latest/${symbol}`);
  if (!response.ok) throw new Error('Failed to fetch screener results');
  return response.json();
};


export default function CandlestickPatternsPage() {
  const [activePatterns, setActivePatterns] = useState<StockPattern[]>([]);
  const [selectedStock, setSelectedStock] = useState("RELIANCE");
  const [marketType, setMarketType] = useState<MarketType>('indian');
  const [chartType, setChartType] = useState<'normal' | 'lightweight' | 'tradingview' | 'chartscanai'>('normal');
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [drawings, setDrawings] = useState<CustomDrawing[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [successRateThreshold, setSuccessRateThreshold] = useState(70);
  const { toast } = useToast();

  const indianStocks = [
    "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "WIPRO",
    "BAJFINANCE", "BHARTIARTL", "ASIANPAINT", "MARUTI"
  ];

  const internationalStocks = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META",
    "NVDA", "JPM", "V", "WMT"
  ];

  const cryptoData = [
    "BTC/USDT", "ETH/USDT", "BNB/USDT", "XRP/USDT", "ADA/USDT",
    "SOL/USDT", "DOT/USDT", "DOGE/USDT", "MATIC/USDT", "LINK/USDT"
  ];

  const getBasePrice = (symbol: string): number => {
    const prices: MarketPrices = {
      indian: {
        'RELIANCE': 2432.50, 'TCS': 3890.75, 'INFY': 1567.25,
        'HDFCBANK': 1678.90, 'ICICIBANK': 987.45, 'WIPRO': 456.78,
        'BAJFINANCE': 6789.30, 'BHARTIARTL': 876.54,
        'ASIANPAINT': 3456.78, 'MARUTI': 9876.54,
      },
      international: {
        'AAPL': 185.85, 'MSFT': 420.55, 'GOOGL': 145.75,
        'AMZN': 175.35, 'TSLA': 185.85, 'META': 465.20,
        'NVDA': 725.35, 'JPM': 185.45, 'V': 275.85, 'WMT': 175.45,
      },
      crypto: {
        'BTC/USDT': 48000, 'ETH/USDT': 2800, 'BNB/USDT': 320,
        'XRP/USDT': 0.55, 'ADA/USDT': 0.50, 'SOL/USDT': 95,
        'DOT/USDT': 15, 'DOGE/USDT': 0.08, 'MATIC/USDT': 0.85,
        'LINK/USDT': 18,
      }
    };
    return prices[marketType]?.[symbol] || 100;
  };

  const getAvailableSymbols = () => {
    const symbolMap = {
      indian: indianStocks,
      international: internationalStocks,
      crypto: cryptoData
    };
    return symbolMap[marketType] || indianStocks;
  };

  useEffect(() => {
    const currentDate = new Date();
    const basePrice = getBasePrice(selectedStock);
    const volatility = marketType === 'crypto' ? 0.02 : 0.01;

    const data: CandlestickData[] = Array.from({ length: 50 }).map((_, i) => {
      const date = new Date(currentDate);
      date.setMinutes(date.getMinutes() - (50 - i) * 15);

      const variance = Math.random() * (basePrice * volatility) - (basePrice * volatility / 2);
      const open = basePrice + variance;
      const high = open + Math.random() * (basePrice * volatility);
      const low = open - Math.random() * (basePrice * volatility);
      const close = (open + high + low) / 3 + (Math.random() - 0.5) * (basePrice * volatility / 2);

      return {
        time: date.getTime() / 1000,
        open,
        high,
        low,
        close,
      };
    });

    setChartData(data);
  }, [selectedStock, marketType]);

  const { data: activePatternsData = [], isLoading: patternsLoading } = useQuery({
    queryKey: ['/api/patterns/active', selectedStock],
    queryFn: () => fetchActivePatterns(selectedStock),
    refetchInterval: 5000, 
  });

  const { data: technicalIndicatorsData = [], isLoading: indicatorsLoading } = useQuery({
    queryKey: ['/api/indicators/latest', selectedStock],
    queryFn: () => fetchTechnicalIndicators(selectedStock),
    refetchInterval: 5000,
  });

  const { data: screenerResultsData = [], isLoading: screenerLoading } = useQuery({
    queryKey: ['/api/screener/latest', selectedStock],
    queryFn: () => fetchScreenerResults(selectedStock),
    refetchInterval: 5000,
  });

  const handleMarketTypeChange = (type: string) => {
    if (type === 'indian' || type === 'international' || type === 'crypto') {
      setMarketType(type as MarketType);
      const defaultSymbols = {
        indian: 'RELIANCE',
        international: 'AAPL',
        crypto: 'BTC/USDT'
      };
      setSelectedStock(defaultSymbols[type as keyof typeof defaultSymbols]);
    }
  };

  const handleDrawingComplete = (drawing: CustomDrawing) => {
    setDrawings(prev => [...prev, drawing]);
    toast({
      title: "Drawing Added",
      description: "Custom drawing has been added to the chart",
      variant: "default"
    });
  };

  const Tutorial = () => (
    <AnimatePresence>
      {showTutorial && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 bg-background/80 flex items-center justify-center z-50"
        >
          <Card className="w-[600px] p-6 space-y-4">
            <h3 className="text-2xl font-bold">Welcome to Pattern Recognition</h3>
            <div className="space-y-4">
              <p>🎯 Quick Start Guide:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Switch between Indian, International, and Crypto markets</li>
                <li>Use drawing tools to mark your own patterns</li>
                <li>Enable alerts for high-probability patterns</li>
                <li>View success rates and historical performance</li>
              </ul>
              <Button onClick={() => setShowTutorial(false)} className="w-full">
                Get Started
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-6 space-y-6">
      <Tutorial />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Live Pattern Recognition</h1>
        <div className="flex items-center gap-4">
          <ToggleGroup type="single" value={marketType} onValueChange={handleMarketTypeChange}>
            <ToggleGroupItem value="indian" aria-label="Indian">
              <BarChart2 className="h-4 w-4 mr-2" />
              Indian
            </ToggleGroupItem>
            <ToggleGroupItem value="international" aria-label="International">
              <Globe className="h-4 w-4 mr-2" />
              International
            </ToggleGroupItem>
            <ToggleGroupItem value="crypto" aria-label="Crypto">
              <Bitcoin className="h-4 w-4 mr-2" />
              Crypto
            </ToggleGroupItem>
          </ToggleGroup>

          <ToggleGroup
            type="single"
            value={chartType}
            onValueChange={(value: string) => {
              if (value === 'normal' || value === 'chartscanai' || value === 'tradingview') {
                setChartType(value as 'normal' | 'chartscanai' | 'tradingview');
              }
            }}
          >
            <ToggleGroupItem value="normal" aria-label="Normal Chart">
              <CandlestickChart className="h-4 w-4 mr-2" />
              Pattern Chart
            </ToggleGroupItem>
            <ToggleGroupItem value="chartscanai" aria-label="ChartScanAI">
              <Activity className="h-4 w-4 mr-2" />
              AI Analysis
            </ToggleGroupItem>
            <ToggleGroupItem value="tradingview" aria-label="TradingView">
              <BarChart2 className="h-4 w-4 mr-2" />
              TradingView
            </ToggleGroupItem>
          </ToggleGroup>

          <Select value={selectedStock} onValueChange={setSelectedStock}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableSymbols().map((asset) => (
                <SelectItem key={asset} value={asset}>
                  {asset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 animate-pulse text-green-500" />
            <span>Live Scanning</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">{selectedStock} Analysis</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="drawing-mode"
                  checked={isDrawingMode}
                  onCheckedChange={setIsDrawingMode}
                />
                <Label htmlFor="drawing-mode">Drawing Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="alerts"
                  checked={alertsEnabled}
                  onCheckedChange={setAlertsEnabled}
                />
                <Label htmlFor="alerts">Alerts</Label>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowTutorial(true)}>
                <Info className="w-4 h-4 mr-2" />
                Help
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <Label>Success Rate Alert Threshold: {successRateThreshold}%</Label>
            <Slider
              value={[successRateThreshold]}
              onValueChange={([value]) => setSuccessRateThreshold(value)}
              max={100}
              step={1}
            />
          </div>

          {chartType === 'normal' ? (
            <NormalChart data={chartData} />
          ) : chartType === 'chartscanai' ? (
            <ChartScanAIChart data={chartData} />
          ) : null}
        </Card>

        <Card className="p-6 overflow-auto max-h-[calc(500px+2rem)]">
          <h2 className="text-2xl font-semibold mb-4">Active Patterns</h2>

          {(patternsLoading || indicatorsLoading || screenerLoading) ? (
            <div className="flex items-center justify-center p-8">
              <Activity className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading data...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Technical Indicators</h3>
                <div className="grid grid-cols-2 gap-2">
                  {technicalIndicatorsData.map((indicator: any) => (
                    <div key={indicator.id} className="bg-accent/10 p-2 rounded">
                      <div className="text-sm font-medium">{indicator.indicator_type}</div>
                      <div className="text-lg">{parseFloat(indicator.value).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Probability Signals</h3>
                {screenerResultsData.map((result: any) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-accent/10 p-3 rounded-lg mb-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{result.screening_type}</span>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs",
                          parseFloat(result.probability_score) > 70 ? "bg-green-500/20 text-green-500" :
                            parseFloat(result.probability_score) > 40 ? "bg-yellow-500/20 text-yellow-500" :
                              "bg-red-500/20 text-red-500"
                        )}>
                          {parseFloat(result.probability_score).toFixed(1)}% Probability
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Entry:</span>
                        <div>${parseFloat(result.trigger_price).toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target:</span>
                        <div className="text-green-500">${parseFloat(result.target_price).toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Stop:</span>
                        <div className="text-red-500">${parseFloat(result.stop_loss).toFixed(2)}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {activePatternsData.map((pattern: any) => (
                <motion.div
                  key={pattern.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-accent/10 p-3 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{pattern.pattern_type}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs",
                        parseFloat(pattern.probability) > 70 ? "bg-green-500/20 text-green-500" :
                          parseFloat(pattern.probability) > 40 ? "bg-yellow-500/20 text-yellow-500" :
                            "bg-red-500/20 text-red-500"
                      )}>
                        {parseFloat(pattern.probability).toFixed(1)}% Confidence
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span>Timeframe: {pattern.timeframe}</span>
                    <span className="ml-2">•</span>
                    <span className="ml-2">Signal Time: {new Date(pattern.signal_time).toLocaleTimeString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}