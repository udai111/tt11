import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
from scipy import stats
import talib as ta
from sklearn.cluster import KMeans
from statsmodels.tsa.stattools import adfuller
import ccxt

class MarketAnalysisService:
    def __init__(self):
        self.exchange = ccxt.binance()
        self.cache = {}
        
    async def analyze_price_action(self, symbol: str, timeframe: str = '1d') -> Dict[str, Any]:
        """Analyze price action patterns and trends"""
        try:
            ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe)
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            
            # Calculate key levels
            pivots = self._calculate_pivot_points(df)
            
            # Identify candlestick patterns
            patterns = self._identify_candlestick_patterns(df)
            
            # Calculate trend strength
            trend = self._calculate_trend_strength(df)
            
            return {
                "status": "success",
                "pivots": pivots,
                "patterns": patterns,
                "trend": trend
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def analyze_volume_profile(self, symbol: str, timeframe: str = '1d') -> Dict[str, Any]:
        """Analyze volume profile and identify key levels"""
        try:
            ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe)
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            
            # Calculate Volume Profile
            price_volume = pd.DataFrame({
                'price': df['close'],
                'volume': df['volume']
            })
            
            # Use KMeans to identify volume clusters
            kmeans = KMeans(n_clusters=5)
            price_volume['cluster'] = kmeans.fit_predict(price_volume[['price', 'volume']])
            
            # Identify high volume nodes
            volume_nodes = []
            for cluster in range(5):
                cluster_data = price_volume[price_volume['cluster'] == cluster]
                volume_nodes.append({
                    'price_level': cluster_data['price'].mean(),
                    'volume': cluster_data['volume'].sum()
                })
                
            return {
                "status": "success",
                "volume_nodes": volume_nodes,
                "profile": price_volume.to_dict('records')
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def detect_market_regime(self, symbol: str) -> Dict[str, Any]:
        """Detect current market regime using multiple indicators"""
        try:
            ohlcv = self.exchange.fetch_ohlcv(symbol, '1d')
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            
            # Calculate volatility regime
            returns = df['close'].pct_change()
            volatility = returns.rolling(20).std() * np.sqrt(252)
            current_vol = volatility.iloc[-1]
            
            # Calculate trend regime
            sma_20 = df['close'].rolling(20).mean()
            sma_50 = df['close'].rolling(50).mean()
            trend = "bullish" if sma_20.iloc[-1] > sma_50.iloc[-1] else "bearish"
            
            # Test for mean reversion
            adf_result = adfuller(df['close'])
            mean_reverting = adf_result[1] < 0.05
            
            return {
                "status": "success",
                "volatility_regime": "high" if current_vol > volatility.mean() + volatility.std() else "low",
                "trend_regime": trend,
                "mean_reverting": mean_reverting
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def analyze_institutional_flow(self, symbol: str) -> Dict[str, Any]:
        """Analyze institutional trading flows"""
        try:
            trades = self.exchange.fetch_trades(symbol)
            df = pd.DataFrame(trades)
            
            # Identify large trades
            large_trades = df[df['amount'] > df['amount'].quantile(0.95)]
            
            # Calculate buy/sell imbalance
            buy_volume = large_trades[large_trades['side'] == 'buy']['amount'].sum()
            sell_volume = large_trades[large_trades['side'] == 'sell']['amount'].sum()
            
            return {
                "status": "success",
                "buy_volume": buy_volume,
                "sell_volume": sell_volume,
                "imbalance": (buy_volume - sell_volume) / (buy_volume + sell_volume),
                "large_trades": len(large_trades)
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def _calculate_pivot_points(self, df: pd.DataFrame) -> Dict[str, float]:
        """Calculate pivot points and support/resistance levels"""
        pivot = (df['high'].iloc[-1] + df['low'].iloc[-1] + df['close'].iloc[-1]) / 3
        r1 = 2 * pivot - df['low'].iloc[-1]
        s1 = 2 * pivot - df['high'].iloc[-1]
        r2 = pivot + (df['high'].iloc[-1] - df['low'].iloc[-1])
        s2 = pivot - (df['high'].iloc[-1] - df['low'].iloc[-1])
        
        return {
            "pivot": pivot,
            "r1": r1,
            "r2": r2,
            "s1": s1,
            "s2": s2
        }
    
    def _identify_candlestick_patterns(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Identify candlestick patterns"""
        patterns = []
        
        # Check for doji
        body = abs(df['close'] - df['open'])
        wick_up = df['high'] - df[['open', 'close']].max(axis=1)
        wick_down = df[['open', 'close']].min(axis=1) - df['low']
        
        is_doji = (body < 0.1 * (wick_up + wick_down))
        
        if is_doji.iloc[-1]:
            patterns.append({"name": "doji", "position": "current"})
        
        # Add more pattern recognition logic here
        return patterns
    
    def _calculate_trend_strength(self, df: pd.DataFrame) -> Dict[str, float]:
        """Calculate trend strength using multiple metrics"""
        # ADX
        adx = ta.ADX(df['high'], df['low'], df['close'])
        
        # Trending vs Ranging
        atr = ta.ATR(df['high'], df['low'], df['close'])
        
        return {
            "adx": adx.iloc[-1],
            "atr": atr.iloc[-1],
            "trending": adx.iloc[-1] > 25
        }
