import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Share2, Save, Play, BarChart2, Brain, Workflow, Medal, Upload, Download, Users, Gift, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface BacktestResult {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  returns: number;
  score: number;
  mlInsights: {
    predictionAccuracy: number;
    nextMovePrediction: string;
    confidenceScore: number;
    riskAssessment: string;
  };
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  strategyName: string;
  returns: number;
  score: number;
  trades: number;
  achievements: string[];
  rating: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const StrategyBuilder = () => {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("builder");
  const [strategyName, setStrategyName] = useState("");
  const [timeframe, setTimeframe] = useState("1h");
  const [indicators, setIndicators] = useState<string[]>([]);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [communityRating, setCommunityRating] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "first_strategy",
      name: "Strategy Creator",
      description: "Created your first trading strategy",
      icon: "🎯",
      unlocked: false
    },
    {
      id: "high_returns",
      name: "Master Trader",
      description: "Achieved over 100% returns in backtesting",
      icon: "💰",
      unlocked: false
    },
    {
      id: "community_star",
      name: "Community Star",
      description: "Strategy rated 5 stars by the community",
      icon: "⭐",
      unlocked: false
    }
  ]);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    {
      rank: 1,
      username: "trading_master",
      strategyName: "Golden Cross Pro",
      returns: 156.7,
      score: 98.5,
      trades: 234,
      achievements: ["Master Trader", "Community Star"],
      rating: 4.9
    },
    {
      rank: 2,
      username: "algo_trader",
      strategyName: "RSI Reversal Elite",
      returns: 134.2,
      score: 95.8,
      trades: 189,
      achievements: ["Strategy Creator"],
      rating: 4.7
    }
  ]);

  const [conditions, setConditions] = useState([
    { indicator: "", operator: "", value: "" }
  ]);

  const indicators_list = [
    "RSI", "MACD", "Moving Average", "Bollinger Bands",
    "Stochastic", "ATR", "OBV", "Ichimoku Cloud",
    "ML Prediction", "Sentiment Analysis", "Volume Profile",
    "Market Regime"
  ];

  const operators = ["crosses above", "crosses below", "is greater than", "is less than"];

  const addCondition = () => {
    setConditions([...conditions, { indicator: "", operator: "", value: "" }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const runBacktest = async () => {
    // Simulated ML-enhanced backtest results
    const result: BacktestResult = {
      totalTrades: 156,
      winRate: 68.5,
      profitFactor: 2.1,
      sharpeRatio: 1.8,
      maxDrawdown: 12.3,
      returns: 89.4,
      score: 87.6,
      mlInsights: {
        predictionAccuracy: 78.5,
        nextMovePrediction: "Bullish breakout likely",
        confidenceScore: 0.85,
        riskAssessment: "Medium-Low Risk"
      }
    };

    setBacktestResult(result);
    // Unlock achievement if returns are high
    if (result.returns > 100) {
      unlockAchievement("high_returns");
    }

    toast({
      title: "Backtest Completed",
      description: "Strategy performance analysis and ML insights are ready",
      variant: "default"
    });
  };

  const unlockAchievement = (achievementId: string) => {
    setAchievements(achievements.map(achievement =>
      achievement.id === achievementId
        ? { ...achievement, unlocked: true }
        : achievement
    ));

    toast({
      title: "Achievement Unlocked! 🏆",
      description: `Congratulations! You've earned a new achievement: ${achievements.find(a => a.id === achievementId)?.name}`,
      variant: "default"
    });
  };

  const saveStrategy = () => {
    // Unlock first strategy achievement
    unlockAchievement("first_strategy");

    toast({
      title: "Strategy Saved",
      description: "Your strategy has been saved and added to the leaderboard",
      variant: "default"
    });
  };

  const exportStrategy = () => {
    const strategyConfig = {
      name: strategyName,
      timeframe,
      conditions,
      backtestResult
    };

    const blob = new Blob([JSON.stringify(strategyConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${strategyName.toLowerCase().replace(/\s+/g, '_')}_strategy.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Strategy Exported",
      description: "Your strategy configuration has been downloaded",
      variant: "default"
    });
  };

  const importStrategy = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          setStrategyName(config.name);
          setTimeframe(config.timeframe);
          setConditions(config.conditions);
          setBacktestResult(config.backtestResult);

          toast({
            title: "Strategy Imported",
            description: "Strategy configuration loaded successfully",
            variant: "default"
          });
        } catch (error) {
          toast({
            title: "Import Error",
            description: "Failed to import strategy configuration",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setLocation('/trading')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trading
        </Button>
        <h2 className="text-2xl font-bold">AI-Powered Strategy Builder</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            Strategy Builder
          </TabsTrigger>
          <TabsTrigger value="backtest" className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            ML Insights
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Global Leaderboard
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Strategy Marketplace
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Medal className="w-4 h-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between">
                  <div className="w-1/2 space-y-4">
                    <div>
                      <Label>Strategy Name</Label>
                      <Input
                        value={strategyName}
                        onChange={(e) => setStrategyName(e.target.value)}
                        placeholder="Enter strategy name"
                      />
                    </div>

                    <div>
                      <Label>Timeframe</Label>
                      <Select value={timeframe} onValueChange={setTimeframe}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                          {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
                            <SelectItem key={tf} value={tf}>
                              {tf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="w-1/3 space-y-2">
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4" />
                        <span className="font-semibold">AI Recommendation</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Based on current market conditions, consider adding momentum indicators for better performance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Entry Conditions</Label>
                  {conditions.map((condition, index) => (
                    <div key={index} className="flex gap-4">
                      <Select
                        value={condition.indicator}
                        onValueChange={(value) => {
                          const newConditions = [...conditions];
                          newConditions[index].indicator = value;
                          setConditions(newConditions);
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select indicator" />
                        </SelectTrigger>
                        <SelectContent>
                          {indicators_list.map((ind) => (
                            <SelectItem key={ind} value={ind}>
                              {ind}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={condition.operator}
                        onValueChange={(value) => {
                          const newConditions = [...conditions];
                          newConditions[index].operator = value;
                          setConditions(newConditions);
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map((op) => (
                            <SelectItem key={op} value={op}>
                              {op}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        value={condition.value}
                        onChange={(e) => {
                          const newConditions = [...conditions];
                          newConditions[index].value = e.target.value;
                          setConditions(newConditions);
                        }}
                        placeholder="Value"
                        className="w-[150px]"
                      />

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeCondition(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}

                  <Button onClick={addCondition} variant="outline">
                    Add Condition
                  </Button>
                </div>

                <div className="flex gap-4">
                  <Button onClick={runBacktest} className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Run ML Backtest
                  </Button>
                  <Button onClick={saveStrategy} variant="outline" className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Strategy
                  </Button>
                  <Button onClick={exportStrategy} variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={importStrategy}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="outline" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Import
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backtest">
          <Card>
            <CardContent className="p-6">
              {backtestResult ? (
                <div className="space-y-6">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Total Trades</Label>
                      <div className="text-2xl font-bold">{backtestResult.totalTrades}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Win Rate</Label>
                      <div className="text-2xl font-bold text-green-500">
                        {backtestResult.winRate}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Returns</Label>
                      <div className="text-2xl font-bold text-green-500">
                        {backtestResult.returns}%
                      </div>
                    </div>
                  </div>

                  {/* ML Insights */}
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      AI Analysis
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Prediction Accuracy</p>
                        <p className="text-xl font-bold">{backtestResult.mlInsights.predictionAccuracy}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next Move Prediction</p>
                        <p className="text-xl font-bold">{backtestResult.mlInsights.nextMovePrediction}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Confidence Score</p>
                        <p className="text-xl font-bold">{(backtestResult.mlInsights.confidenceScore * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Risk Assessment</p>
                        <p className="text-xl font-bold">{backtestResult.mlInsights.riskAssessment}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  Run a backtest to see ML-powered insights
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Rank</th>
                      <th className="text-left py-2">User</th>
                      <th className="text-left py-2">Strategy</th>
                      <th className="text-left py-2">Returns</th>
                      <th className="text-left py-2">Score</th>
                      <th className="text-left py-2">Rating</th>
                      <th className="text-left py-2">Achievements</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr key={entry.rank} className="border-b">
                        <td className="py-2">#{entry.rank}</td>
                        <td className="py-2">{entry.username}</td>
                        <td className="py-2">{entry.strategyName}</td>
                        <td className="py-2 text-green-500">+{entry.returns}%</td>
                        <td className="py-2">{entry.score}</td>
                        <td className="py-2">⭐ {entry.rating.toFixed(1)}</td>
                        <td className="py-2">
                          {entry.achievements.map((achievement, i) => (
                            <span key={i} className="inline-block bg-primary/10 text-xs rounded px-2 py-1 mr-1">
                              {achievement}
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {leaderboard.map((strategy) => (
                  <div key={strategy.rank} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">{strategy.strategyName}</h3>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">⭐</span>
                        {strategy.rating.toFixed(1)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      by {strategy.username}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-green-500">+{strategy.returns}% returns</span>
                      <Button variant="outline" size="sm">
                        <Gift className="w-4 h-4 mr-2" />
                        Purchase
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${
                      achievement.unlocked ? 'bg-primary/5 border-primary' : 'opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    {achievement.unlocked && (
                      <div className="mt-2 text-xs text-primary">
                        ✓ Unlocked
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrategyBuilder;