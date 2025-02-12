import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

const TradingViewWidget = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-background z-50">
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullScreen(false)}
            className="hover:bg-accent"
          >
            <Minimize2 className="h-5 w-5" />
          </Button>
        </div>
        <div className="h-screen w-screen p-4">
          <iframe 
            height="100%" 
            width="100%" 
            src="https://ssltvc.investing.com/?pair_ID=160&height=480&width=650&interval=300&plotStyle=area&domain_ID=56&lang_ID=56&timezone_ID=20"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow mb-6 relative">
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFullScreen(true)}
          className="hover:bg-accent"
        >
          <Maximize2 className="h-5 w-5" />
        </Button>
      </div>
      <iframe 
        height="480" 
        width="100%" 
        src="https://ssltvc.investing.com/?pair_ID=160&height=480&width=650&interval=300&plotStyle=area&domain_ID=56&lang_ID=56&timezone_ID=20"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default TradingViewWidget;