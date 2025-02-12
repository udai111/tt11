import { Switch, Route, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "styled-components";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import theme from "./theme";
import Sidebar from "./components/Sidebar";
import QuantumDashboard from "./components/QuantumDashboard";
import MLPrediction from "./components/MLPrediction";
import BacktestPanel from "./components/BacktestPanel";
import TradingViewSection from "./components/TradingViewSection";
import MarketAnalysis from "./components/MarketAnalysis";
import ProTrading from "./components/ProTrading";
import TRAlgoBot from "./components/TRAlgoBot";
import StrategyBuilder from "./components/StrategyBuilder";
import PortfolioManagement from "./components/PortfolioManagement";
import MarketOverview from "./components/MarketOverview";
import MagicForecastPanel from "./components/MagicForecastPanel";
import IntradayPatternScanner from "./components/IntradayPatternScanner";
import OrderFlowAnalysis from "./components/OrderFlowAnalysis";
import RiskAnalytics from "./components/RiskAnalytics";
import AlertsManager from "./components/AlertsManager";
import { performanceManager } from "@/lib/performance-manager";
import { Component, Suspense, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import { RouteComponentProps } from "wouter";

const MagicForecastPanelRoute = () => {
  return <MagicForecastPanel stock="" onClose={() => {}} />;
};


interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
  retryCount: number;
}

// Enhanced error boundary with retry mechanism
class ErrorBoundary extends Component<{ children: React.ReactNode }, ErrorState> {
  state: ErrorState = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('Error details:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    const maxRetries = 3;
    if (this.state.retryCount < maxRetries) {
      this.setState((prevState: ErrorState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const maxRetries = 3;

    if (hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-4">
            {error?.message || 'An unexpected error occurred'}
          </p>
          {retryCount < maxRetries ? (
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 mb-2"
            >
              Retry ({maxRetries - retryCount} attempts remaining)
            </button>
          ) : null}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Enhanced loading spinner with timeout
const LoadingSpinner = ({ timeout = 10000 }: { timeout?: number }) => {
  const [showTimeout, setShowTimeout] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
      toast({
        title: "Loading taking longer than expected",
        description: "Please check your connection or try refreshing the page.",
        variant: "default"
      });
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mb-4"></div>
      {showTimeout && (
        <p className="text-muted-foreground text-sm">
          Still loading... You may want to refresh the page.
        </p>
      )}
    </div>
  );
};

function App(): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('App initializing...');
    try {
      const timer = setTimeout(() => {
        console.log('App initialized');
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error during initialization:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initPerformance = async () => {
      await performanceManager.detectCapabilities();
      const settings = performanceManager.getRecommendedSettings();
      performanceManager.updateSettings(settings);
    };
    initPerformance();
  }, []);

  const base = import.meta.env.PROD ? '/trgfin' : '';
  console.log('Using base path:', base);

  if (isLoading) {
    return <LoadingSpinner timeout={5000} />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <Router base={base}>
            <div className="min-h-screen bg-background flex flex-col">
              <div className="flex flex-1 relative overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto min-h-screen p-2 md:p-4 bg-background">
                  <Suspense fallback={<LoadingSpinner timeout={10000} />}>
                    <Switch>
                      <Route path="/" component={QuantumDashboard} />
                      <Route path="/market-overview" component={MarketOverview} />
                      <Route path="/pro-trading" component={ProTrading} />
                      <Route path="/algo-bot" component={TRAlgoBot} />
                      <Route path="/ml-predictions" component={MLPrediction} />
                      <Route path="/backtest" component={BacktestPanel} />
                      <Route path="/charts" component={TradingViewSection} />
                      <Route path="/market-analysis" component={MarketAnalysis} />
                      <Route path="/strategy-builder" component={StrategyBuilder} />
                      <Route path="/portfolio" component={PortfolioManagement} />
                      <Route path="/magic-forecast" component={MagicForecastPanelRoute} />
                      <Route path="/pattern-scanner" component={IntradayPatternScanner} />
                      <Route path="/order-flow" component={OrderFlowAnalysis} />
                      <Route path="/risk-analytics" component={RiskAnalytics} />
                      <Route path="/alerts" component={AlertsManager} />
                      <Route component={NotFound} />
                    </Switch>
                  </Suspense>
                </main>
              </div>
              <footer className="mt-auto border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex flex-col items-center gap-4 py-4 md:h-24 md:flex-row md:py-0">
                  <div className="flex flex-col items-center gap-4 px-4 md:flex-row md:gap-8 md:px-0">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                      Built by <span className="font-semibold">Tanuj Raj Gangwar</span>
                    </p>
                  </div>
                </div>
              </footer>
              <Toaster />
            </div>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;