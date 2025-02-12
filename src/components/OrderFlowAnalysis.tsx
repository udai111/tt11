import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  BarChart2,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderFlow {
  buyVolume: number;
  sellVolume: number;
  imbalance: number;
  largeOrders: Array<{
    price: number;
    volume: number;
    side: 'buy' | 'sell';
    timestamp: string;
  }>;
  volumeProfile: Array<{
    price: number;
    volume: number;
    dominantSide: 'buy' | 'sell';
  }>;
  vwap: number;
  lastUpdate: string;
}

const OrderFlowAnalysis = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1m');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: orderFlow, isLoading } = useQuery<OrderFlow>({
    queryKey: ['orderFlow', selectedSymbol, timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/order-flow?symbol=${selectedSymbol}&timeframe=${timeframe}`);
      return response.json();
    },
    refetchInterval: autoRefresh ? 1000 : false,
  });

  return (
    <div className="p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-primary">Order Flow Analysis</h1>
            <p className="text-muted-foreground">Real-time order flow and volume analysis</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Symbol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AAPL">AAPL</SelectItem>
                <SelectItem value="GOOGL">GOOGL</SelectItem>
                <SelectItem value="MSFT">MSFT</SelectItem>
                <SelectItem value="AMZN">AMZN</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1m</SelectItem>
                <SelectItem value="5m">5m</SelectItem>
                <SelectItem value="15m">15m</SelectItem>
                <SelectItem value="1h">1h</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="flex items-center gap-2"
            >
              <RefreshCcw className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`} />
              {autoRefresh ? "Auto-refresh On" : "Auto-refresh Off"}
            </Button>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="orderFlow" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orderFlow">Order Flow</TabsTrigger>
          <TabsTrigger value="volumeProfile">Volume Profile</TabsTrigger>
          <TabsTrigger value="largeOrders">Large Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="orderFlow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Buy/Sell Pressure
              </h3>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Buy Volume</span>
                    <span className="text-green-500 flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" />
                      {orderFlow?.buyVolume.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sell Volume</span>
                    <span className="text-red-500 flex items-center gap-1">
                      <ArrowDownRight className="w-4 h-4" />
                      {orderFlow?.sellVolume.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Imbalance</span>
                    <span className={orderFlow?.imbalance && orderFlow.imbalance > 0 ? 'text-green-500' : 'text-red-500'}>
                      {orderFlow?.imbalance ? (orderFlow.imbalance * 100).toFixed(2) : 0}%
                    </span>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    Last Update: {orderFlow?.lastUpdate ? new Date(orderFlow.lastUpdate).toLocaleTimeString() : 'N/A'}
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                VWAP Analysis
              </h3>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="mt-4">
                  <p className="text-lg font-semibold">
                    VWAP: ${orderFlow?.vwap ? orderFlow.vwap.toFixed(2) : 'N/A'}
                  </p>
                  <div className="h-40 mt-4">
                    {/* VWAP Chart Component */}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="volumeProfile">
          <Card className="p-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Volume Profile
            </h3>
            <div className="mt-4">
              {orderFlow?.volumeProfile ? (
                <div className="space-y-2">
                  {orderFlow.volumeProfile.map((level, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="w-20">${level.price.toFixed(2)}</span>
                      <div className="flex-1 bg-secondary h-6 rounded-sm overflow-hidden">
                        <div
                          className={`h-full ${level.dominantSide === 'buy' ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${(level.volume / Math.max(...orderFlow.volumeProfile.map(l => l.volume))) * 100}%` }}
                        />
                      </div>
                      <span className="w-24 text-right">{level.volume.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No volume profile data available</p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="largeOrders">
          <Card className="p-4">
            <h3 className="text-lg font-semibold">Large Orders Detection</h3>
            <div className="mt-4">
              {orderFlow?.largeOrders && orderFlow.largeOrders.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2">Time</th>
                      <th className="text-left py-2">Price</th>
                      <th className="text-left py-2">Volume</th>
                      <th className="text-left py-2">Side</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderFlow.largeOrders.map((order, index) => (
                      <tr key={index} className="border-t">
                        <td className="py-2">{new Date(order.timestamp).toLocaleTimeString()}</td>
                        <td className="py-2">${order.price.toFixed(2)}</td>
                        <td className="py-2">{order.volume.toLocaleString()}</td>
                        <td className={`py-2 ${order.side === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                          {order.side.toUpperCase()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No large orders detected</p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderFlowAnalysis;