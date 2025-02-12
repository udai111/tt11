import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  TrendingDown,
  BarChart,
  PieChart,
  AlertTriangle,
  Activity
} from 'lucide-react';

interface RiskMetrics {
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  var: number;
  cvar: number;
  beta: number;
  alpha: number;
  stressTest: {
    marketCrash: number;
    highVolatility: number;
    interestRateShock: number;
  };
}

const RiskAnalytics = () => {
  const [selectedPortfolio, setSelectedPortfolio] = useState('main');

  const { data: riskMetrics, isLoading } = useQuery<RiskMetrics>({
    queryKey: ['riskMetrics', selectedPortfolio],
    queryFn: async () => {
      const response = await fetch(`/api/risk-metrics?portfolio=${selectedPortfolio}`);
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
        <h1 className="text-4xl font-bold text-primary">Risk Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive risk management and analysis
        </p>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stress">Stress Testing</TabsTrigger>
          <TabsTrigger value="exposure">Risk Exposure</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Risk Ratios
              </h3>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Sharpe Ratio</span>
                    <span className={riskMetrics?.sharpeRatio ? (riskMetrics.sharpeRatio > 1 ? 'text-green-500' : 'text-red-500') : ''}>
                      {riskMetrics?.sharpeRatio?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sortino Ratio</span>
                    <span className={riskMetrics?.sortinoRatio ? (riskMetrics.sortinoRatio > 1 ? 'text-green-500' : 'text-red-500') : ''}>
                      {riskMetrics?.sortinoRatio?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Beta</span>
                    <span>{riskMetrics?.beta?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Alpha</span>
                    <span className={riskMetrics?.alpha ? (riskMetrics.alpha > 0 ? 'text-green-500' : 'text-red-500') : ''}>
                      {riskMetrics?.alpha ? `${(riskMetrics.alpha * 100).toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Risk Measures
              </h3>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Volatility</span>
                    <span>{riskMetrics?.volatility ? `${(riskMetrics.volatility * 100).toFixed(2)}%` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Max Drawdown</span>
                    <span className="text-red-500">
                      {riskMetrics?.maxDrawdown ? `${(riskMetrics.maxDrawdown * 100).toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Value at Risk</span>
                    <span>{riskMetrics?.var ? `${(riskMetrics.var * 100).toFixed(2)}%` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Conditional VaR</span>
                    <span>{riskMetrics?.cvar ? `${(riskMetrics.cvar * 100).toFixed(2)}%` : 'N/A'}</span>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Stress Test Results
              </h3>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Market Crash</span>
                    <span className="text-red-500">
                      {riskMetrics?.stressTest?.marketCrash ? `${(riskMetrics.stressTest.marketCrash * 100).toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>High Volatility</span>
                    <span className="text-yellow-500">
                      {riskMetrics?.stressTest?.highVolatility ? `${(riskMetrics.stressTest.highVolatility * 100).toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Interest Rate Shock</span>
                    <span className="text-orange-500">
                      {riskMetrics?.stressTest?.interestRateShock ? `${(riskMetrics.stressTest.interestRateShock * 100).toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stress">
          <Card className="p-4">
            <h3 className="text-lg font-semibold">Advanced Stress Testing</h3>
            <p className="text-muted-foreground mt-2">
              Visualization of portfolio performance under different stress scenarios
            </p>
            <div className="mt-4 h-96">
              {/* Add Stress Testing visualization here */}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="exposure">
          <Card className="p-4">
            <h3 className="text-lg font-semibold">Risk Exposure Analysis</h3>
            <p className="text-muted-foreground mt-2">
              Detailed breakdown of risk exposure across different assets and factors
            </p>
            <div className="mt-4">
              {/* Add Risk Exposure Analysis visualization here */}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskAnalytics;