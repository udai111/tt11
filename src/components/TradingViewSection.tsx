import React, { useEffect, useRef, memo } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart2, Maximize2, Minimize2, Activity, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TradingViewWidgetProps {
  className?: string;
}

const LoadingIndicator = ({ type }: { type: 'pulse' | 'spin' }) => {
  return (
    <div className="inline-flex items-center justify-center">
      {type === 'pulse' ? (
        <div className="relative">
          <Activity className="h-4 w-4 text-primary" />
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
        </div>
      ) : (
        <div className="relative">
          <RefreshCw className="h-4 w-4 text-primary animate-spin [animation-duration:2s]" />
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

const TradingViewWidget = memo(({ className }: TradingViewWidgetProps) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "NASDAQ:AAPL",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "withdateranges": true,
        "range": "YTD",
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "details": true,
        "hotlist": true,
        "calendar": false,
        "show_popup_button": true,
        "popup_width": "1000",
        "popup_height": "650",
        "support_host": "https://www.tradingview.com"
      }`;

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        const script = container.current.querySelector('script');
        if (script) {
          script.remove();
        }
      }
    };
  }, []);

  return (
    <div className={cn("tradingview-widget-container", className)} ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full" />
    </div>
  );
});

TradingViewWidget.displayName = 'TradingViewWidget';

const TradingViewSection = () => {
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [selectedIndicator, setSelectedIndicator] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  useEffect(() => {
    const event = new CustomEvent('tradingview-fullscreen', { detail: { isFullScreen } });
    window.dispatchEvent(event);
  }, [isFullScreen]);

  const indicators = [
    { name: "RSI", value: "65.2", status: "neutral", loading: 'pulse' as const },
    { name: "MACD", value: "Bullish", status: "positive", loading: 'spin' as const },
    { name: "Moving Averages", value: "Strong Buy", status: "positive", loading: 'pulse' as const },
    { name: "Bollinger Bands", value: "Upper Touch", status: "positive", loading: 'spin' as const },
    { name: "Stochastic", value: "78.5", status: "neutral", loading: 'pulse' as const },
    { name: "Volume", value: "Above Avg", status: "positive", loading: 'spin' as const }
  ];

  const renderChart = () => (
    <Card className="p-6 mb-6 relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="hover:bg-accent"
        >
          {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
      </div>
      <div className={cn("w-full", isFullScreen ? "h-screen" : "h-[600px]")}>
        <TradingViewWidget className="h-full" />
      </div>
    </Card>
  );

  const renderIndicators = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {indicators.map((indicator) => (
        <motion.div
          key={indicator.name}
          whileHover={{ scale: 1.02 }}
          className="card"
          onClick={() => setSelectedIndicator(indicator.name)}
        >
          <Card className={cn(
            "p-4 cursor-pointer transition-colors",
            selectedIndicator === indicator.name && "ring-2 ring-primary"
          )}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <LoadingIndicator type={indicator.loading} />
                <Label className="text-sm font-medium">{indicator.name}</Label>
              </div>
              <span className={cn(
                "px-2 py-1 rounded text-xs font-semibold",
                indicator.status === "positive" && "bg-green-500/20 text-green-500",
                indicator.status === "negative" && "bg-red-500/20 text-red-500",
                indicator.status === "neutral" && "bg-yellow-500/20 text-yellow-500"
              )}>
                {indicator.value}
              </span>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-background z-50">
        <div className="h-screen w-screen">
          {renderChart()}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Advanced Market Analysis</h2>
          {isLoading && <LoadingIndicator type="spin" />}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart2 className="h-4 w-4 mr-2" />
            Add Indicator
          </Button>
        </div>
      </div>

      {renderIndicators()}
      {renderChart()}

      {/* New Gangster Theme Section */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-red-500 mb-2 uppercase tracking-wider">Intraday Warriors</h3>
            <p className="text-xl font-bold text-gray-300 mb-4">THE GANGWARS WILL BE BACK</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <LoadingIndicator type="pulse" />
                  <span className="text-red-400 font-semibold">Battle Zone</span>
                </div>
                <span className="text-2xl font-bold text-gray-100">$152.30</span>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <LoadingIndicator type="spin" />
                  <span className="text-red-400 font-semibold">War Chest</span>
                </div>
                <span className="text-2xl font-bold text-gray-100">$1.2M</span>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <LoadingIndicator type="pulse" />
                  <span className="text-red-400 font-semibold">Territory</span>
                </div>
                <span className="text-2xl font-bold text-gray-100">+25.8%</span>
              </div>
            </div>
          </div>
          <div className="w-32 h-32 relative ml-6">
            <img 
              src="/attached_assets/bearded-and-mustached-gangster-skull-vector-23488981.jpg" 
              alt="Gangster Skull"
              className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,0,0,0.3)]"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Market Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-card">
            <div className="flex items-center gap-2">
              <LoadingIndicator type="pulse" />
              <Label>Support Levels</Label>
            </div>
            <div className="text-lg font-semibold text-red-500">$152.30</div>
            <div className="text-sm text-muted-foreground">Strong support zone</div>
          </div>
          <div className="p-4 rounded-lg bg-card">
            <div className="flex items-center gap-2">
              <LoadingIndicator type="spin" />
              <Label>Resistance Levels</Label>
            </div>
            <div className="text-lg font-semibold text-green-500">$158.45</div>
            <div className="text-sm text-muted-foreground">Key resistance area</div>
          </div>
          <div className="p-4 rounded-lg bg-card">
            <div className="flex items-center gap-2">
              <LoadingIndicator type="pulse" />
              <Label>Market Sentiment</Label>
            </div>
            <div className="text-lg font-semibold text-green-500">Bullish</div>
            <div className="text-sm text-muted-foreground">Strong uptrend continuation</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TradingViewSection;