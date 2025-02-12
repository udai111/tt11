import { useEffect, useRef, useState } from 'react';

interface ChartProps {
  data: Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }>;
  onPatternDetected?: (pattern: string) => void;
}

export function CandlestickChart({ data, onPatternDetected }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPrice, setHoveredPrice] = useState<string | null>(null);

  useEffect(() => {
    const drawChart = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size with high DPI support
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Clear canvas
      ctx.fillStyle = '#131722';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
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

      // Calculate price range
      const prices = data.flatMap(d => [d.high, d.low]);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice;
      const padding = priceRange * 0.1;

      // Chart dimensions
      const candleWidth = (canvas.width / data.length) * 0.8;
      const spacing = (canvas.width / data.length) * 0.2;

      // Helper function for price to y-coordinate conversion
      const getY = (price: number) => 
        ((maxPrice + padding - price) / (priceRange + 2 * padding)) * canvas.height;

      // Draw candlesticks and detect patterns
      data.forEach((candle, i) => {
        const x = (candleWidth + spacing) * i;

        // Draw candle
        const isGreen = candle.close > candle.open;
        ctx.fillStyle = isGreen ? '#26a69a' : '#ef5350';
        ctx.strokeStyle = isGreen ? '#26a69a' : '#ef5350';

        const openY = getY(candle.open);
        const closeY = getY(candle.close);
        const highY = getY(candle.high);
        const lowY = getY(candle.low);

        // Draw body
        ctx.fillRect(
          x,
          Math.min(openY, closeY),
          candleWidth,
          Math.abs(closeY - openY) || 1
        );

        // Draw wicks
        ctx.beginPath();
        ctx.moveTo(x + candleWidth / 2, highY);
        ctx.lineTo(x + candleWidth / 2, Math.min(openY, closeY));
        ctx.moveTo(x + candleWidth / 2, Math.max(openY, closeY));
        ctx.lineTo(x + candleWidth / 2, lowY);
        ctx.stroke();

        // Pattern Detection
        if (i >= 3) {
          // Bullish Engulfing
          if (
            data[i-1].close < data[i-1].open && // Previous red candle
            candle.close > candle.open && // Current green candle
            candle.open < data[i-1].close && // Current opens below prev close
            candle.close > data[i-1].open // Current closes above prev open
          ) {
            onPatternDetected?.('Bullish Engulfing');
            // Draw marker
            ctx.fillStyle = '#26a69a';
            ctx.beginPath();
            ctx.moveTo(x + candleWidth / 2, lowY + 20);
            ctx.lineTo(x + candleWidth / 2 - 5, lowY + 25);
            ctx.lineTo(x + candleWidth / 2 + 5, lowY + 25);
            ctx.closePath();
            ctx.fill();
          }

          // Bearish Engulfing
          if (
            data[i-1].close > data[i-1].open && // Previous green candle
            candle.close < candle.open && // Current red candle
            candle.open > data[i-1].close && // Current opens above prev close
            candle.close < data[i-1].open // Current closes below prev open
          ) {
            onPatternDetected?.('Bearish Engulfing');
            // Draw marker
            ctx.fillStyle = '#ef5350';
            ctx.beginPath();
            ctx.moveTo(x + candleWidth / 2, highY - 20);
            ctx.lineTo(x + candleWidth / 2 - 5, highY - 25);
            ctx.lineTo(x + candleWidth / 2 + 5, highY - 25);
            ctx.closePath();
            ctx.fill();
          }
        }
      });

      // Add price labels
      ctx.fillStyle = '#d1d4dc';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      for (let i = 0; i <= gridLines; i++) {
        const price = minPrice + (priceRange * (i / gridLines));
        const y = (canvas.height / gridLines) * i;
        ctx.fillText(price.toFixed(2), 10, y - 5);
      }
    };

    drawChart();

    // Handle hover interaction
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const candleWidth = (canvas.width / data.length) * 0.8;
      const spacing = (canvas.width / data.length) * 0.2;
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

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
    }

    // Handle resize
    const handleResize = () => {
      drawChart();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas?.removeEventListener('mousemove', handleMouseMove);
    };
  }, [data, onPatternDetected]);

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        className="w-full h-[600px]"
        style={{ backgroundColor: '#131722' }}
      />
      {hoveredPrice && (
        <div className="absolute top-4 right-4 bg-background/90 p-2 rounded shadow">
          {hoveredPrice}
        </div>
      )}
    </div>
  );
}