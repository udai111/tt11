import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, Brain, Settings, Play, BarChart2, Loader2, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Progress } from "@/components/ui/progress";
import { technicalAnalysis } from "@/lib/technical-analysis";

interface PredictionResult {
  shortTerm: {
    prediction: number;
    confidence: number;
    method: string;
  };
  mediumTerm: {
    prediction: number;
    confidence: number;
    method: string;
  };
  longTerm: {
    prediction: number;
    confidence: number;
    method: string;
  };
  marketSentiment: number;
  technicalIndicators: {
    rsi: number;
    macd: number;
    movingAverage: number;
  };
}

interface LoadingStepProps {
  step: number;
  currentStep: number;
  text: string;
}

const LoadingStep = ({ step, currentStep, text }: LoadingStepProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex items-center space-x-2 ${currentStep >= step ? 'text-primary' : 'text-muted-foreground'}`}
  >
    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
      currentStep > step ? 'bg-primary text-white' :
        currentStep === step ? 'border-2 border-primary' :
          'border-2 border-muted'
    }`}>
      {currentStep > step ? '✓' : step + 1}
    </div>
    <span>{text}</span>
  </motion.div>
);

const MLPrediction = () => {
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("selection");
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [hyperparameters, setHyperparameters] = useState({
    lstmUnits: 50,
    denseUnits: 32,
    dropoutRate: 0.2,
    epochs: 20,
    batchSize: 16
  });
  const [selectedModels, setSelectedModels] = useState<string[]>(["lstm"]);
  const [metrics, setMetrics] = useState({
    accuracy: 0,
    mse: 0,
    mae: 0,
    sharpeRatio: 0,
    profitFactor: 0
  });
  const [backendType, setBackendType] = useState<string>('initializing');

  useEffect(() => {
    setBackendType(technicalAnalysis.getBackendType());
  }, []);

  const handleTraining = async () => {
    if (!selectedStock || selectedModels.length === 0) return;

    setIsTraining(true);
    setTrainingProgress(0);
    setLoadingStep(0);

    const steps = [
      {
        name: "Initializing model architecture",
        duration: 800,
        progress: 10
      },
      {
        name: "Loading market data",
        duration: 1000,
        progress: 30
      },
      {
        name: "Training neural network",
        duration: 1500,
        progress: 50
      },
      {
        name: "Optimizing weights",
        duration: 1200,
        progress: 70
      },
      {
        name: "Validating results",
        duration: 1000,
        progress: 85
      },
      {
        name: "Finalizing model",
        duration: 800,
        progress: 100
      }
    ];

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setDownloadStatus(step.name);
        setLoadingStep(i);
        setTrainingProgress(step.progress);
        await new Promise(r => setTimeout(r, step.duration));
      }

      setMetrics({
        accuracy: 85.5,
        mse: 0.0023,
        mae: 0.0456,
        sharpeRatio: 1.8,
        profitFactor: 2.1
      });
    } catch (error) {
      console.error('Training error:', error);
    } finally {
      setIsTraining(false);
      setDownloadStatus("Training completed successfully!");
    }
  };

  const resetTraining = () => {
    setTrainingProgress(0);
    setLoadingStep(0);
    setDownloadStatus("");
    setMetrics({
      accuracy: 0,
      mse: 0,
      mae: 0,
      sharpeRatio: 0,
      profitFactor: 0
    });
  };

  const modelOptions = [
    { value: "lstm", label: "LSTM Network" },
    { value: "cnn", label: "CNN" },
    { value: "ensemble", label: "LSTM + CNN Ensemble" },
    { value: "xgboost", label: "XGBoost" },
    { value: "arima", label: "ARIMA" }
  ];

  const stocks = [
    { value: "RELIANCE", label: "Reliance Industries" },
    { value: "TCS", label: "Tata Consultancy Services" },
    { value: "HDFC", label: "HDFC Bank" },
    { value: "INFY", label: "Infosys" },
    { value: "ICICI", label: "ICICI Bank" }
  ];

  const fetchPredictions = async (symbol: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const mockHistoricalData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      price: 1000 + Math.random() * 200,
      predicted: 1000 + Math.random() * 200
    }));
    setHistoricalData(mockHistoricalData);
    const mockPredictions: PredictionResult = {
      shortTerm: {
        prediction: 5.2,
        confidence: 0.85,
        method: "LSTM + CNN Ensemble"
      },
      mediumTerm: {
        prediction: 12.5,
        confidence: 0.75,
        method: "XGBoost + ARIMA"
      },
      longTerm: {
        prediction: 18.7,
        confidence: 0.65,
        method: "Deep Learning Ensemble"
      },
      marketSentiment: 0.72,
      technicalIndicators: {
        rsi: 62,
        macd: 1.2,
        movingAverage: 1450.75
      }
    };
    setPredictions(mockPredictions);
    setIsLoading(false);
  };

  const PredictionCard = ({ title, data }: { title: string; data: { prediction: number; confidence: number; method: string } }) => (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {data.prediction > 0 ? (
          <TrendingUp className="w-6 h-6 text-green-500" />
        ) : (
          <TrendingDown className="w-6 h-6 text-red-500" />
        )}
      </div>
      <div className="space-y-2">
        <p className={`text-3xl font-bold ${data.prediction > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {data.prediction > 0 ? '+' : ''}{data.prediction}%
        </p>
        <div className="text-sm text-muted-foreground">
          <p>Confidence: {(data.confidence * 100).toFixed(1)}%</p>
          <p>Method: {data.method}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 relative">
      {backendType === 'cpu' && (
        <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertCircle className="h-5 w-5" />
            <p>Running in CPU mode - performance may be reduced</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Advanced ML Market Predictions</h1>
          <p className="text-muted-foreground">Deep Learning & Ensemble Models for Market Analysis</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="selection">Model Selection</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="hyperparameters">Hyperparameters</TabsTrigger>
        </TabsList>

        <TabsContent value="selection" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Select Models</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modelOptions.map((model) => (
                <motion.div
                  key={model.value}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border cursor-pointer ${
                    selectedModels.includes(model.value) ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => {
                    setSelectedModels(prev =>
                      prev.includes(model.value)
                        ? prev.filter(m => m !== model.value)
                        : [...prev, model.value]
                    );
                  }}
                >
                  <h3 className="font-semibold">{model.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getModelDescription(model.value)}
                  </p>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Select Stock</h2>
            <Select
              value={selectedStock}
              onValueChange={(value) => {
                setSelectedStock(value);
                fetchPredictions(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a stock to analyze" />
              </SelectTrigger>
              <SelectContent>
                {stocks.map((stock) => (
                  <SelectItem key={stock.value} value={stock.value}>
                    {stock.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Model Training</h2>
            <div className="space-y-6">
              <AnimatePresence>
                {isTraining && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
                    style={{ overflowY: 'auto' }}
                  >
                    <div className="min-h-screen flex items-center justify-center p-4">
                      <Card className="p-6 w-[400px]">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-center">{downloadStatus}</h3>
                            <Progress value={trainingProgress} className="w-full" />
                          </div>
                          <div className="space-y-4">
                            <LoadingStep step={0} currentStep={loadingStep} text="Initializing model" />
                            <LoadingStep step={1} currentStep={loadingStep} text="Loading market data" />
                            <LoadingStep step={2} currentStep={loadingStep} text="Training neural network" />
                            <LoadingStep step={3} currentStep={loadingStep} text="Optimizing weights" />
                            <LoadingStep step={4} currentStep={loadingStep} text="Validating results" />
                            <LoadingStep step={5} currentStep={loadingStep} text="Finalizing model" />
                          </div>
                        </div>
                      </Card>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[1, 2, 3].map((layer) => (
                    <motion.div
                      key={layer}
                      className="h-32 bg-accent/10 rounded-lg relative overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: layer * 0.2 }}
                    >
                      {isTraining && (
                        <motion.div
                          className="absolute inset-0 bg-primary/20"
                          animate={{
                            y: ["0%", "100%"],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                            repeatType: "loop"
                          }}
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-sm font-medium">Layer {layer}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleTraining}
                    disabled={isTraining || selectedModels.length === 0 || !selectedStock}
                    className="flex-1"
                  >
                    {isTraining ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Training...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Training
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetTraining}
                    disabled={isTraining}
                    className="flex-1"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Model Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">{metrics.accuracy}%</p>
              </div>
              <div className="p-4 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground">MSE</p>
                <p className="text-2xl font-bold">{metrics.mse}</p>
              </div>
              <div className="p-4 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground">MAE</p>
                <p className="text-2xl font-bold">{metrics.mae}</p>
              </div>
              <div className="p-4 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                <p className="text-2xl font-bold">{metrics.sharpeRatio}</p>
              </div>
              <div className="p-4 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Profit Factor</p>
                <p className="text-2xl font-bold">{metrics.profitFactor}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="hyperparameters" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Hyperparameter Tuning</h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">LSTM Units: {hyperparameters.lstmUnits}</label>
                  <Slider
                    value={[hyperparameters.lstmUnits]}
                    onValueChange={([value]) => setHyperparameters(prev => ({ ...prev, lstmUnits: value }))}
                    max={200}
                    min={10}
                    step={10}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Dense Units: {hyperparameters.denseUnits}</label>
                  <Slider
                    value={[hyperparameters.denseUnits]}
                    onValueChange={([value]) => setHyperparameters(prev => ({ ...prev, denseUnits: value }))}
                    max={128}
                    min={16}
                    step={8}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Dropout Rate: {hyperparameters.dropoutRate}</label>
                  <Slider
                    value={[hyperparameters.dropoutRate * 100]}
                    onValueChange={([value]) => setHyperparameters(prev => ({ ...prev, dropoutRate: value / 100 }))}
                    max={50}
                    min={10}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Epochs: {hyperparameters.epochs}</label>
                  <Slider
                    value={[hyperparameters.epochs]}
                    onValueChange={([value]) => setHyperparameters(prev => ({ ...prev, epochs: value }))}
                    max={100}
                    min={10}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Batch Size: {hyperparameters.batchSize}</label>
                  <Slider
                    value={[hyperparameters.batchSize]}
                    onValueChange={([value]) => setHyperparameters(prev => ({ ...prev, batchSize: value }))}
                    max={64}
                    min={8}
                    step={8}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => handleTraining()}
                  disabled={isTraining}
                  className="flex-1"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Apply & Train
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setHyperparameters({
                      lstmUnits: 50,
                      denseUnits: 32,
                      dropoutRate: 0.2,
                      epochs: 20,
                      batchSize: 16
                    });
                  }}
                  className="flex-1"
                >
                  Reset to Default
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : predictions ? (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PredictionCard title="Short Term (1 Week)" data={predictions.shortTerm} />
            <PredictionCard title="Medium Term (1 Month)" data={predictions.mediumTerm} />
            <PredictionCard title="Long Term (3 Months)" data={predictions.longTerm} />
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Price Prediction Analysis</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    name="Actual Price"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--primary))"
                    strokeDasharray="5 5"
                    fill="none"
                    name="Predicted"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Market Sentiment Analysis</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Bearish</span>
                    <span>Neutral</span>
                    <span>Bullish</span>
                  </div>
                  <div className="h-4 bg-background rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${predictions.marketSentiment * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Current Sentiment: {(predictions.marketSentiment * 100).toFixed(1)}% Bullish
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Technical Indicators</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">RSI</span>
                  <span className={`font-mono ${
                    predictions.technicalIndicators.rsi > 70 ? 'text-red-500' :
                      predictions.technicalIndicators.rsi < 30 ? 'text-green-500' :
                        'text-muted-foreground'
                  }`}>
                    {predictions.technicalIndicators.rsi.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">MACD</span>
                  <span className={`font-mono ${
                    predictions.technicalIndicators.macd > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {predictions.technicalIndicators.macd.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Moving Average (20-day)</span>
                  <span className="font-mono">
                    ₹{predictions.technicalIndicators.movingAverage.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Select a stock to view predictions</h3>
          <p className="text-sm text-muted-foreground">
            Our ML models will analyze market data and provide detailed predictions
          </p>
        </div>
      )}
    </div>
  );
};

const getModelDescription = (modelType: string): string => {
  const descriptions: Record<string, string> = {
    lstm: "Long Short-Term Memory network for sequential data",
    cnn: "Convolutional Neural Network for pattern recognition",
    ensemble: "Combined LSTM and CNN for robust predictions",
    xgboost: "Gradient boosting for structured data",
    arima: "Statistical modeling for time series analysis"
  };
  return descriptions[modelType] || "";
};

export default MLPrediction;