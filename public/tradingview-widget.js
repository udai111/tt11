function initTradingView() {
  if (typeof TradingView !== 'undefined') {
    new TradingView.widget({
      "width": "100%",
      "height": 400,
      "symbol": "NASDAQ:TSLA",
      "interval": "15",
      "timezone": "America/New_York",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "toolbar_bg": "#f1f3f6",
      "enable_publishing": false,
      "withdateranges": true,
      "hide_side_toolbar": false,
      "allow_symbol_change": true,
      "container_id": "tradingview_advanced_chart"
    });
  }
}

if (document.readyState === 'complete') {
  initTradingView();
} else {
  window.addEventListener('load', initTradingView);
}