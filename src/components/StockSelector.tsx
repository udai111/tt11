import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import MagicForecastPanel from './MagicForecastPanel';

type MarketType = 'indian' | 'us' | 'crypto' | 'forex';

interface StockData {
  symbol: string;
  price: number;
}

const MARKET_SYMBOLS: Record<MarketType, StockData[]> = {
  indian: [
    { symbol: 'INFY', price: 1567.50 },
    { symbol: 'TCS', price: 3890.75 },
    { symbol: 'RELIANCE', price: 2345.60 },
    { symbol: 'HDFCBANK', price: 1678.25 },
    { symbol: 'WIPRO', price: 456.80 }
  ],
  us: [
    { symbol: 'AAPL', price: 189.30 },
    { symbol: 'GOOG', price: 2756.80 },
    { symbol: 'MSFT', price: 345.67 },
    { symbol: 'AMZN', price: 3245.90 },
    { symbol: 'TSLA', price: 789.45 },
    { symbol: 'META', price: 467.89 },
    { symbol: 'NVDA', price: 678.34 }
  ],
  crypto: [
    { symbol: 'BTCUSD', price: 48567.90 },
    { symbol: 'ETHUSD', price: 2789.45 },
    { symbol: 'BNBUSD', price: 345.67 },
    { symbol: 'SOLUSD', price: 123.45 },
    { symbol: 'ADAUSD', price: 2.34 }
  ],
  forex: [
    { symbol: 'USDINR', price: 82.45 },
    { symbol: 'EURUSD', price: 1.1234 },
    { symbol: 'GBPUSD', price: 1.2567 },
    { symbol: 'USDJPY', price: 148.67 },
    { symbol: 'AUDUSD', price: 0.7456 }
  ]
};

interface StockSelectorProps {
  onStockChange: (symbol: string) => void;
}

export default function StockSelector({ onStockChange }: StockSelectorProps) {
  const [market, setMarket] = useState<MarketType>('us');
  const [selectedStock, setSelectedStock] = useState<StockData>(MARKET_SYMBOLS[market][0]);
  const [showForecast, setShowForecast] = useState(false);

  const handleMarketChange = (value: MarketType) => {
    setMarket(value);
    const newStock = MARKET_SYMBOLS[value][0];
    setSelectedStock(newStock);
    onStockChange(newStock.symbol);
    setShowForecast(true);  // Show forecast panel on market change
  };

  const handleSymbolChange = (symbol: string) => {
    const stock = MARKET_SYMBOLS[market].find(s => s.symbol === symbol) || MARKET_SYMBOLS[market][0];
    setSelectedStock(stock);
    onStockChange(stock.symbol);
    setShowForecast(true);  // Show forecast panel on symbol change
  };

  return (
    <div className="relative">
      <div className="flex gap-4">
        <Select onValueChange={handleMarketChange} value={market}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select market" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us">US Market</SelectItem>
            <SelectItem value="indian">Indian Market</SelectItem>
            <SelectItem value="crypto">Cryptocurrency</SelectItem>
            <SelectItem value="forex">Forex</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={handleSymbolChange} value={selectedStock.symbol}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select symbol" />
          </SelectTrigger>
          <SelectContent>
            {MARKET_SYMBOLS[market].map((stock) => (
              <SelectItem key={stock.symbol} value={stock.symbol}>
                {stock.symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showForecast && (
        <MagicForecastPanel
          stock={{
            name: selectedStock.symbol,
            price: selectedStock.price
          }}
          onClose={() => setShowForecast(false)}
        />
      )}
    </div>
  );
}