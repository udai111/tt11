import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Activity, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const MarketAnalysis = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");

  const { data: marketData, isLoading } = useQuery({
    queryKey: ['marketStatus'],
    queryFn: async () => {
      const response = await fetch('/api/market-status');
      return response.json();
    }
  });

  return (
    <div className="p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-4xl font-bold text-primary">
          Quantum Trading Interface
        </h1>
        <p className="text-muted-foreground">
          Advanced Market Analysis
        </p>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="prediction">AI Prediction</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Market Status
              </h3>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="mt-4 space-y-2">
                  <p>Symbol: {selectedSymbol}</p>
                  <p>Last Price: ${marketData?.price}</p>
                  <p>Change: {marketData?.change}%</p>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trend Analysis
              </h3>
              <div className="mt-4">
                <p>Trend: Bullish</p>
                <p>Strength: High</p>
                <p>Volume: Above Average</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical">
          <Card className="p-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Technical Indicators
            </h3>
            <div className="mt-4 space-y-2">
              <p>RSI: 65</p>
              <p>MACD: Bullish</p>
              <p>Moving Averages: Above 200 MA</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="prediction">
          <Card className="p-4">
            <h3 className="text-lg font-semibold">AI Market Prediction</h3>
            <div className="mt-4">
              <p>Direction: Upward</p>
              <p>Confidence: 85%</p>
              <p>Time Frame: Short Term</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketAnalysis;