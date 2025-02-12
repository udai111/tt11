import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MagicForecastPanelProps {
  stock: {
    name: string;
    price: number;
  };
  onClose: () => void;
}

const MagicForecastPanel = ({ stock, onClose }: MagicForecastPanelProps) => {
  // Mock calculations for demonstration
  const currentPrice = stock.price;
  const forecastNextDay = currentPrice * 1.01;
  const forecastNextWeek = currentPrice * 1.03;
  const forecastNextMonth = currentPrice * 1.1;
  const forecastNextYear = currentPrice * 1.5;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 bg-black/20 flex items-end justify-end p-6 z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <Card className="w-80 bg-card shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">Forecast: {stock.name}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Price:</span>
                <span className="text-sm font-mono">₹{currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Next Day:</span>
                <span className="text-sm font-mono text-green-500">₹{forecastNextDay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">1 Week:</span>
                <span className="text-sm font-mono text-green-500">₹{forecastNextWeek.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">1 Month:</span>
                <span className="text-sm font-mono text-green-500">₹{forecastNextMonth.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">1 Year:</span>
                <span className="text-sm font-mono text-green-500">₹{forecastNextYear.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Forecast based on historical trends and market analysis.
                These are simulated values for demonstration.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default MagicForecastPanel;