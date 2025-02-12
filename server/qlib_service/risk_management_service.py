import numpy as np
import pandas as pd
from typing import Dict, List, Any
from scipy.optimize import minimize
import empyrical as ep
import cvxpy as cp

class RiskManagementService:
    def __init__(self):
        self.risk_metrics = {}
        self.portfolio_weights = {}
        
    async def optimize_portfolio(self, 
                               returns: pd.DataFrame, 
                               risk_aversion: float = 1.0,
                               constraints: Dict[str, Any] = None) -> Dict[str, Any]:
        """Optimize portfolio using mean-variance optimization"""
        try:
            # Calculate expected returns and covariance
            mu = returns.mean()
            sigma = returns.cov()
            
            # Define variables
            n = len(returns.columns)
            w = cp.Variable(n)
            
            # Define objective function (maximize Sharpe ratio)
            ret = mu @ w
            risk = cp.quad_form(w, sigma)
            objective = cp.Maximize(ret - risk_aversion * risk)
            
            # Define constraints
            constraints = [
                cp.sum(w) == 1,  # Full investment
                w >= 0,  # Long only
            ]
            
            # Add custom constraints if provided
            if constraints and "max_weight" in constraints:
                constraints.append(w <= constraints["max_weight"])
            
            # Solve optimization problem
            prob = cp.Problem(objective, constraints)
            prob.solve()
            
            # Store optimized weights
            self.portfolio_weights = pd.Series(w.value, index=returns.columns)
            
            return {
                "status": "success",
                "weights": self.portfolio_weights.to_dict(),
                "expected_return": float(ret.value),
                "expected_risk": float(np.sqrt(risk.value)),
                "sharpe_ratio": float(ret.value / np.sqrt(risk.value))
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def calculate_risk_metrics(self, 
                                   returns: pd.DataFrame,
                                   weights: Dict[str, float] = None) -> Dict[str, Any]:
        """Calculate comprehensive risk metrics"""
        try:
            if weights is None:
                weights = self.portfolio_weights
            
            portfolio_returns = returns.dot(pd.Series(weights))
            
            metrics = {
                "volatility": ep.annual_volatility(portfolio_returns),
                "sharpe_ratio": ep.sharpe_ratio(portfolio_returns),
                "sortino_ratio": ep.sortino_ratio(portfolio_returns),
                "max_drawdown": ep.max_drawdown(portfolio_returns),
                "value_at_risk": self._calculate_var(portfolio_returns),
                "expected_shortfall": self._calculate_cvar(portfolio_returns),
                "beta": ep.beta(portfolio_returns, returns.mean(axis=1)),
                "alpha": ep.alpha(portfolio_returns, returns.mean(axis=1)),
                "tail_ratio": ep.tail_ratio(portfolio_returns)
            }
            
            self.risk_metrics = metrics
            return {"status": "success", "metrics": metrics}
            
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def stress_test_portfolio(self, 
                                  returns: pd.DataFrame,
                                  scenarios: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Perform stress testing under different scenarios"""
        try:
            results = {}
            
            for scenario in scenarios:
                # Apply scenario adjustments
                adjusted_returns = self._apply_scenario(returns, scenario)
                
                # Calculate metrics under scenario
                scenario_metrics = await self.calculate_risk_metrics(adjusted_returns)
                results[scenario["name"]] = scenario_metrics["metrics"]
            
            return {
                "status": "success",
                "scenario_results": results
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def _calculate_var(self, returns: pd.Series, confidence: float = 0.95) -> float:
        """Calculate Value at Risk"""
        return float(np.percentile(returns, (1 - confidence) * 100))
    
    def _calculate_cvar(self, returns: pd.Series, confidence: float = 0.95) -> float:
        """Calculate Conditional Value at Risk (Expected Shortfall)"""
        var = self._calculate_var(returns, confidence)
        return float(returns[returns <= var].mean())
    
    def _apply_scenario(self, returns: pd.DataFrame, scenario: Dict[str, Any]) -> pd.DataFrame:
        """Apply stress test scenario to returns"""
        adjusted_returns = returns.copy()
        
        if scenario.get("type") == "shock":
            adjusted_returns = adjusted_returns * (1 + scenario.get("magnitude", 0))
        elif scenario.get("type") == "trend":
            adjusted_returns = adjusted_returns + scenario.get("drift", 0)
        elif scenario.get("type") == "volatility":
            adjusted_returns = adjusted_returns * np.sqrt(scenario.get("factor", 1))
            
        return adjusted_returns
