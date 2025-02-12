import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Wallet, TrendingUp, ArrowUpRight, Gamepad2, TrendingDown } from "lucide-react";

const PortfolioManagement = () => {
  const [hasStartedGame, setHasStartedGame] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleStartGame = () => {
    setHasStartedGame(true);
    // In a real app, this would make an API call to create a new portfolio
  };

  if (!hasStartedGame) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <Gamepad2 className="w-12 h-12 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Welcome to Stock Market Game</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start your trading journey with ₹10,00,000 virtual money. Learn to trade without risking real money!
          </p>
          <Button onClick={handleStartGame} className="w-full max-w-sm">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Start Trading Game
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Trading Portfolio</h1>
          <p className="text-muted-foreground">Virtual Trading Account</p>
        </div>
        <Button>
          <Wallet className="w-4 h-4 mr-2" />
          Add Virtual Funds
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Portfolio Value</h3>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">₹10,00,000</p>
            <p className="text-sm text-muted-foreground">Starting Balance</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Cash Available</h3>
            <Wallet className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">₹10,00,000</p>
            <p className="text-sm text-muted-foreground">Available for trading</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Today's P&L</h3>
            <TrendingDown className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">₹0</p>
            <p className="text-sm text-muted-foreground">No trades yet</p>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Start Trading</h3>
            <p className="text-muted-foreground">
              Your portfolio is ready! Start by exploring stocks and making your first trade.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="holdings">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Holdings</h3>
            <p className="text-muted-foreground text-center py-8">
              No holdings yet. Start trading to build your portfolio!
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
            <p className="text-muted-foreground text-center py-8">
              Your transaction history will appear here once you start trading.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioManagement;