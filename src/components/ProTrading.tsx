import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Position {
  id: number;
  symbol: string;
  side: "Buy" | "Sell";
  orderType: string;
  qty: number;
  entryPrice: number;
  margin: boolean;
  leverage: number;
  trailingStop: number | null;
  date: string;
}

interface Alert {
  id: number;
  symbol: string;
  price: number;
  note: string;
}

interface TradeLog {
  action: "OPEN" | "CLOSE";
  symbol: string;
  side?: string;
  qty: number;
  entryPrice?: number;
  closePrice?: number;
  time: string;
}

export default function ProTrading() {
  const [symbol, setSymbol] = useState("TESLA");
  const [orderType, setOrderType] = useState<"Market" | "Limit" | "Stop-Loss">("Market");
  const [side, setSide] = useState<"Buy" | "Sell">("Buy");
  const [quantity, setQuantity] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [marginEnabled, setMarginEnabled] = useState(false);
  const [leverage, setLeverage] = useState<number>(1);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tradeLogs, setTradeLogs] = useState<TradeLog[]>([]);
  const [realTimePrice, setRealTimePrice] = useState(235.50); // TESLA's sample price
  const [mockInterval, setMockInterval] = useState<NodeJS.Timeout | null>(null);
  const [demoMode, setDemoMode] = useState(true);
  const [trailingStop, setTrailingStop] = useState("");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [chartInterval, setChartInterval] = useState("15");
  const [advancedIndicators, setAdvancedIndicators] = useState({
    ma: false,
    rsi: false,
  });
  const [watchers, setWatchers] = useState<string[]>([]);
  const [orderIceberg, setOrderIceberg] = useState(false);
  const [orderOCO, setOrderOCO] = useState(false);
  const [partialCloseQty, setPartialCloseQty] = useState("");
  const [profitFactor, setProfitFactor] = useState(0);
  const [netMarginUsage, setNetMarginUsage] = useState(0);
  const [columnOrder, setColumnOrder] = useState([
    "symbol",
    "side",
    "orderType",
    "qty",
    "entryPrice",
    "margin",
    "PnL",
    "date",
    "actions",
  ]);

  useEffect(() => {
    if (mockInterval) clearInterval(mockInterval);
    const interval = setInterval(() => {
      setRealTimePrice((prev) => {
        const change = (Math.random() - 0.5) * 2;
        return parseFloat((prev + change).toFixed(2));
      });
    }, 3000);
    setMockInterval(interval);
    return () => clearInterval(interval);
  }, [symbol]);

  useEffect(() => {
    let totalWins = 0;
    let totalLosses = 0;
    let winsCount = 0;
    let lossesCount = 0;
    positions.forEach((pos) => {
      const pnl = (realTimePrice - pos.entryPrice) * pos.qty * (pos.side === "Buy" ? 1 : -1);
      if (pnl > 0) {
        totalWins += pnl;
        winsCount += 1;
      } else {
        totalLosses += Math.abs(pnl);
        lossesCount += 1;
      }
    });
    if (totalLosses === 0) {
      setProfitFactor(winsCount > 0 ? 9999 : 0);
    } else {
      setProfitFactor(parseFloat((totalWins / totalLosses).toFixed(2)));
    }
    let marginUse = 0;
    positions.forEach((pos) => {
      if (pos.margin) {
        marginUse += pos.qty * pos.entryPrice * (1 / pos.leverage);
      }
    });
    setNetMarginUsage(marginUse);
  }, [positions, realTimePrice]);

  const handleSubmitOrder = () => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return;
    let entryPrice = realTimePrice;
    if (orderType === "Limit" && limitPrice) entryPrice = parseFloat(limitPrice);
    let newPositions = [...positions];
    newPositions.push({
      symbol,
      side,
      orderType,
      qty,
      entryPrice,
      margin: marginEnabled,
      leverage,
      trailingStop: trailingStop ? parseFloat(trailingStop) : null,
      date: new Date().toLocaleString(),
      id: Date.now(),
    });
    setPositions(newPositions);
    let newLog = [...tradeLogs];
    newLog.push({
      action: "OPEN",
      symbol,
      side,
      qty,
      entryPrice,
      time: new Date().toLocaleString(),
    });
    setTradeLogs(newLog);
  };

  const handleClosePosition = (id: number, partial = false) => {
    let newPositions = [...positions];
    let index = newPositions.findIndex((p) => p.id === id);
    if (index === -1) return;
    let pos = newPositions[index];
    let closeQty = partial ? parseFloat(partialCloseQty) : pos.qty;
    if (!closeQty || closeQty <= 0 || closeQty > pos.qty) return;
    const closePrice = realTimePrice;
    let newLog = [...tradeLogs];
    newLog.push({
      action: "CLOSE",
      symbol: pos.symbol,
      side: pos.side,
      qty: closeQty,
      closePrice,
      time: new Date().toLocaleString(),
    });
    setTradeLogs(newLog);
    if (closeQty < pos.qty) {
      newPositions[index].qty = pos.qty - closeQty;
    } else {
      newPositions.splice(index, 1);
    }
    setPositions(newPositions);
  };

  const handleSetAlert = () => {
    let newAlerts = [...alerts];
    newAlerts.push({
      symbol,
      price: realTimePrice,
      note: "Alert set at current price",
      id: Date.now(),
    });
    setAlerts(newAlerts);
  };

  const toggleIndicators = (ind: "ma" | "rsi") => {
    setAdvancedIndicators({ ...advancedIndicators, [ind]: !advancedIndicators[ind] });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Ultra-Pro Trading Technology</h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Switch
            checked={demoMode}
            onCheckedChange={setDemoMode}
            id="demo-mode"
          />
          <Label htmlFor="demo-mode">Demo Mode</Label>
        </div>
        <Button onClick={() => setColumnOrder([...columnOrder].reverse())}>
          Reorder Columns
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Advanced Chart</h2>
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-4">
            <Select value={chartInterval} onValueChange={setChartInterval}>
              <SelectTrigger className="w-full md:w-auto">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 min</SelectItem>
                <SelectItem value="5">5 min</SelectItem>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="D">1 day</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={advancedIndicators.ma}
                  onCheckedChange={() => toggleIndicators("ma")}
                  id="ma-indicator"
                />
                <Label htmlFor="ma-indicator">MA</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={advancedIndicators.rsi}
                  onCheckedChange={() => toggleIndicators("rsi")}
                  id="rsi-indicator"
                />
                <Label htmlFor="rsi-indicator">RSI</Label>
              </div>
            </div>
          </div>

          <div className="w-full bg-white rounded-lg shadow mb-6 overflow-hidden">
            <iframe
              height="400"
              width="100%"
              src="https://ssltvc.investing.com/?pair_ID=160&height=400&width=100%&interval=300&plotStyle=candles&domain_ID=56&lang_ID=56&timezone_ID=20"
              style={{ border: 'none' }}
              className="w-full max-w-full"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Order Panel</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label>Symbol</Label>
                <Select value={symbol} onValueChange={setSymbol}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RELIANCE">RELIANCE</SelectItem>
                    <SelectItem value="TESLA">TESLA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Current Price</Label>
                <div className="text-lg font-semibold">${realTimePrice.toFixed(2)}</div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Side</Label>
                <Select value={side} onValueChange={(value: "Buy" | "Sell") => setSide(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select side" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buy">Buy</SelectItem>
                    <SelectItem value="Sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Order Type</Label>
                <Select
                  value={orderType}
                  onValueChange={(value: "Market" | "Limit" | "Stop-Loss") => setOrderType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Market">Market</SelectItem>
                    <SelectItem value="Limit">Limit</SelectItem>
                    <SelectItem value="Stop-Loss">Stop-Loss</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {orderType === "Limit" && (
                <div className="flex flex-col gap-2">
                  <Label>Limit Price</Label>
                  <Input
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                  />
                </div>
              )}

              {orderType === "Stop-Loss" && (
                <div className="flex flex-col gap-2">
                  <Label>Stop Price</Label>
                  <Input
                    type="number"
                    value={stopPrice}
                    onChange={(e) => setStopPrice(e.target.value)}
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Trailing Stop (%)</Label>
                <Input
                  type="number"
                  value={trailingStop}
                  onChange={(e) => setTrailingStop(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={marginEnabled}
                  onCheckedChange={setMarginEnabled}
                  id="margin-enabled"
                />
                <Label htmlFor="margin-enabled">Margin Trade</Label>
              </div>

              {marginEnabled && (
                <div className="flex flex-col gap-2">
                  <Label>Leverage</Label>
                  <Select
                    value={leverage.toString()}
                    onValueChange={(value) => setLeverage(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leverage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                      <SelectItem value="5">5x</SelectItem>
                      <SelectItem value="10">10x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={orderIceberg}
                  onCheckedChange={setOrderIceberg}
                  id="iceberg-order"
                />
                <Label htmlFor="iceberg-order">Iceberg Order</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={orderOCO}
                  onCheckedChange={setOrderOCO}
                  id="oco-order"
                />
                <Label htmlFor="oco-order">OCO (One-Cancels-Other)</Label>
              </div>

              <Button onClick={handleSubmitOrder}>Place Order</Button>
              <Button variant="outline" onClick={handleSetAlert}>
                Set Alert
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-x-auto">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Open Positions</h2>
            <div className="overflow-x-auto -mx-3 md:-mx-6">
              <div className="min-w-[800px] px-3 md:px-6">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      {columnOrder.map((col) => (
                        <th key={col} className="px-4 py-2 text-left">
                          {col === "symbol" && "Symbol"}
                          {col === "side" && "Side"}
                          {col === "orderType" && "Type"}
                          {col === "qty" && "Qty"}
                          {col === "entryPrice" && "Price"}
                          {col === "margin" && "Margin"}
                          {col === "PnL" && "PnL"}
                          {col === "date" && "Date"}
                          {col === "actions" && "Close"}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((pos) => {
                      const pnl =
                        (realTimePrice - pos.entryPrice) *
                        pos.qty *
                        (pos.side === "Buy" ? 1 : -1);
                      return (
                        <tr key={pos.id} className="border-b">
                          {columnOrder.includes("symbol") && (
                            <td className="px-4 py-2">{pos.symbol}</td>
                          )}
                          {columnOrder.includes("side") && (
                            <td className="px-4 py-2">{pos.side}</td>
                          )}
                          {columnOrder.includes("orderType") && (
                            <td className="px-4 py-2">{pos.orderType}</td>
                          )}
                          {columnOrder.includes("qty") && (
                            <td className="px-4 py-2">{pos.qty}</td>
                          )}
                          {columnOrder.includes("entryPrice") && (
                            <td className="px-4 py-2">${pos.entryPrice.toFixed(2)}</td>
                          )}
                          {columnOrder.includes("margin") && (
                            <td className="px-4 py-2">
                              {pos.margin ? `${pos.leverage}x` : "No"}
                            </td>
                          )}
                          {columnOrder.includes("PnL") && (
                            <td
                              className={cn(
                                "px-4 py-2",
                                pnl >= 0 ? "text-green-600" : "text-red-600"
                              )}
                            >
                              ${pnl.toFixed(2)}
                            </td>
                          )}
                          {columnOrder.includes("date") && (
                            <td className="px-4 py-2">{pos.date}</td>
                          )}
                          {columnOrder.includes("actions") && (
                            <td className="px-4 py-2">
                              <div className="flex flex-col gap-2">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleClosePosition(pos.id)}
                                >
                                  Close
                                </Button>
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    placeholder="Partial Qty"
                                    value={partialCloseQty}
                                    onChange={(e) => setPartialCloseQty(e.target.value)}
                                    className="w-20"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleClosePosition(pos.id, true)}
                                  >
                                    Partial
                                  </Button>
                                </div>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {positions.length === 0 && (
                      <tr>
                        <td
                          colSpan={columnOrder.length}
                          className="px-4 py-2 text-center"
                        >
                          No open positions
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-4 md:mt-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Alerts</h3>
            {alerts.length === 0 ? (
              <p>No alerts set.</p>
            ) : (
              <ul className="space-y-2">
                {alerts.map((al) => (
                  <li key={al.id}>
                    {al.symbol} at ${al.price.toFixed(2)} - {al.note}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Trade Logs</h3>
            {tradeLogs.length === 0 ? (
              <p>No logs yet.</p>
            ) : (
              <ul className="space-y-2">
                {tradeLogs.map((log, i) => (
                  <li key={i} className="text-sm">
                    [{log.time}] {log.action} {log.side || ""} {log.symbol} Qty:
                    {log.qty || ""}
                    {log.closePrice
                      ? ` closed at ${log.closePrice.toFixed(2)}`
                      : ` entry at ${log.entryPrice ? log.entryPrice.toFixed(2) : ""}`}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Watchers</h3>
            <Input
              type="text"
              placeholder="User to watch..."
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (
                  e.key === "Enter" &&
                  (e.target as HTMLInputElement).value.trim() !== ""
                ) {
                  setWatchers([
                    ...watchers,
                    (e.target as HTMLInputElement).value.trim(),
                  ]);
                  (e.target as HTMLInputElement).value = "";
                }
              }}
              className="mb-4"
            />
            <ul className="space-y-2">
              {watchers.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 md:mt-8">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">Stats</h3>
          <div className="space-y-2">
            <p>
              Profit Factor: {profitFactor}
              {profitFactor > 9998 ? " (No losses yet!)" : ""}
            </p>
            <p>Net Margin Usage: ${netMarginUsage.toFixed(2)}</p>
            <p>Demo Mode: {demoMode ? "ON" : "OFF"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}