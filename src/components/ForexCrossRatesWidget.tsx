import React, { useEffect, useRef, memo } from 'react';
import { Card } from "@/components/ui/card";

const ForexCrossRatesWidget = memo(() => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "width": "100%",
        "height": 400,
        "currencies": [
          "EUR",
          "USD",
          "JPY",
          "GBP",
          "AUD",
          "CAD",
          "INR"
        ],
        "isTransparent": false,
        "colorTheme": "dark",
        "locale": "en",
        "backgroundColor": "#000000"
      }`;

    if (container.current) {
      container.current.appendChild(script);
    }
  }, []);

  return (
    <Card className="p-6 mb-6">
      <div className="tradingview-widget-container" ref={container}>
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </Card>
  );
});

ForexCrossRatesWidget.displayName = "ForexCrossRatesWidget";

export default ForexCrossRatesWidget;