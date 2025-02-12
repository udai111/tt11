import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Settings, 
  Play, 
  Pause, 
  ChartLine,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const TRBot = () => {
  const [isActive, setIsActive] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('MACD_Cross');
  
  const strategies = [
    { id: 'MACD_Cross', name: 'MACD Crossover', profit: '+12.5%' },
    { id: 'RSI_Bounce', name: 'RSI Bounce', profit: '+8.2%' },
    { id: 'BB_Trend', name: 'Bollinger Trend', profit: '+15.1%' }
  ];

  const stats = [
    { label: '24h Volume', value: '$1.2M', up: true },
    { label: 'Win Rate', value: '68%', up: true },
    { label: 'Avg Trade', value: '$425', up: false }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8" />
            <h1 className="text-2xl font-bold">TR Bot 🤖</h1>
          </div>
          <p className="mt-2 text-blue-100">Automated Trading Intelligence</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  {stat.up ? (
                    <ArrowUpRight className="text-green-500 h-5 w-5" />
                  ) : (
                    <ArrowDownRight className="text-red-500 h-5 w-5" />
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Strategy Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="col-span-1 p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Trading Strategies</h2>
              <Settings className="h-5 w-5 text-gray-500" />
            </div>
            <div className="space-y-4">
              {strategies.map((strategy) => (
                <motion.div
                  key={strategy.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedStrategy === strategy.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50 hover:bg-blue-50'
                  }`}
                  onClick={() => setSelectedStrategy(strategy.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{strategy.name}</h3>
                      <p className="text-sm text-gray-500">24h Performance</p>
                    </div>
                    <span className="text-green-500 font-bold">{strategy.profit}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <Button
              className={`w-full mt-6 ${
                isActive
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? (
                <><Pause className="h-4 w-4 mr-2" /> Stop Bot</>
              ) : (
                <><Play className="h-4 w-4 mr-2" /> Start Bot</>
              )}
            </Button>
          </Card>

          {/* Live Trading View */}
          <Card className="col-span-1 lg:col-span-2 p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Live Trading</h2>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Updated 5s ago</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium">Current Strategy</h3>
                  <p className="text-sm text-gray-500">{
                    strategies.find(s => s.id === selectedStrategy)?.name
                  }</p>
                </div>
                <ChartLine className="h-5 w-5 text-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Position Size</p>
                  <p className="text-lg font-bold">$10,000</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Profit</p>
                  <p className="text-lg font-bold text-green-500">+$1,250</p>
                </div>
              </div>
            </div>
            {/* Trading Activity Log */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Buy BTC</p>
                    <p className="text-sm text-gray-500">0.05 BTC @ $42,150</p>
                  </div>
                </div>
                <span className="text-green-500">+$350</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">Sell ETH</p>
                    <p className="text-sm text-gray-500">2.5 ETH @ $2,250</p>
                  </div>
                </div>
                <span className="text-red-500">-$120</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TRBot;
