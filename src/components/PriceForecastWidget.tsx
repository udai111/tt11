import React from 'react';

interface PriceForecastWidgetProps {
  symbol: string;
}

const PriceForecastWidget = ({ symbol }: PriceForecastWidgetProps) => {
  return (
    <div className="w-full bg-white rounded-lg shadow mb-6">
      <iframe
        referrerPolicy="origin"
        width="100%"
        height="570"
        style={{
          background: "#FFFFFF",
          padding: "10px",
          border: "none",
          borderRadius: "5px",
          boxShadow: "0 2px 4px 0 rgba(0,0,0,.2)"
        }}
        src={`https://jika.io/embed/forecast-price-target?symbol=${symbol}&boxShadow=true&graphColor=1652f0&textColor=161c2d&backgroundColor=FFFFFF&fontFamily=Nunito&cookieconsent=0&privacy=0`}
      />
    </div>
  );
};

export default PriceForecastWidget;