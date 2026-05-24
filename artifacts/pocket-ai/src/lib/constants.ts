export const OTC_PAIRS = [
  "EUR/USD (OTC)", "GBP/USD (OTC)", "AUD/USD (OTC)", "USD/JPY (OTC)", "USD/CAD (OTC)",
  "NZD/USD (OTC)", "EUR/GBP (OTC)", "GBP/JPY (OTC)", "USD/CHF (OTC)", "EUR/JPY (OTC)",
  "AUD/CAD (OTC)", "EUR/AUD (OTC)", "AUD/JPY (OTC)", "CAD/JPY (OTC)", "CHF/JPY (OTC)",
  "GBP/AUD (OTC)", "GBP/CAD (OTC)", "GBP/CHF (OTC)", "EUR/CAD (OTC)", "EUR/CHF (OTC)",
  "NZD/CAD (OTC)", "NZD/CHF (OTC)", "NZD/JPY (OTC)"
];

export const FOREX_PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "EUR/GBP", "EUR/JPY",
  "GBP/JPY", "USD/CHF", "AUD/JPY", "EUR/AUD", "EUR/CAD"
];

export const CRYPTO_PAIRS = [
  "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT"
];

export const COMMODITIES_PAIRS = [
  "Gold (XAU/USD)", "Silver (XAG/USD)", "Oil (WTI)"
];

export const ALL_PAIRS = [
  ...OTC_PAIRS, ...FOREX_PAIRS, ...CRYPTO_PAIRS, ...COMMODITIES_PAIRS
];

export const PAIR_TO_TV_SYMBOL: Record<string, string> = {
  "EUR/USD": "FX:EURUSD",
  "EUR/USD (OTC)": "FX:EURUSD",
  "GBP/USD": "FX:GBPUSD",
  "GBP/USD (OTC)": "FX:GBPUSD",
  "AUD/USD": "FX:AUDUSD",
  "AUD/USD (OTC)": "FX:AUDUSD",
  "USD/JPY": "FX:USDJPY",
  "USD/JPY (OTC)": "FX:USDJPY",
  "USD/CAD": "FX:USDCAD",
  "USD/CAD (OTC)": "FX:USDCAD",
  "NZD/USD": "FX:NZDUSD",
  "NZD/USD (OTC)": "FX:NZDUSD",
  "EUR/GBP": "FX:EURGBP",
  "EUR/GBP (OTC)": "FX:EURGBP",
  "EUR/JPY": "FX:EURJPY",
  "EUR/JPY (OTC)": "FX:EURJPY",
  "GBP/JPY": "FX:GBPJPY",
  "GBP/JPY (OTC)": "FX:GBPJPY",
  "USD/CHF": "FX:USDCHF",
  "USD/CHF (OTC)": "FX:USDCHF",
  "AUD/CAD": "FX:AUDCAD",
  "AUD/CAD (OTC)": "FX:AUDCAD",
  "EUR/AUD": "FX:EURAUD",
  "EUR/AUD (OTC)": "FX:EURAUD",
  "AUD/JPY": "FX:AUDJPY",
  "AUD/JPY (OTC)": "FX:AUDJPY",
  "CAD/JPY": "FX:CADJPY",
  "CAD/JPY (OTC)": "FX:CADJPY",
  "CHF/JPY": "FX:CHFJPY",
  "CHF/JPY (OTC)": "FX:CHFJPY",
  "GBP/AUD": "FX:GBPAUD",
  "GBP/AUD (OTC)": "FX:GBPAUD",
  "GBP/CAD": "FX:GBPCAD",
  "GBP/CAD (OTC)": "FX:GBPCAD",
  "GBP/CHF": "FX:GBPCHF",
  "GBP/CHF (OTC)": "FX:GBPCHF",
  "EUR/CAD": "FX:EURCAD",
  "EUR/CAD (OTC)": "FX:EURCAD",
  "EUR/CHF": "FX:EURCHF",
  "EUR/CHF (OTC)": "FX:EURCHF",
  "NZD/CAD": "FX:NZDCAD",
  "NZD/CAD (OTC)": "FX:NZDCAD",
  "NZD/CHF": "FX:NZDCHF",
  "NZD/CHF (OTC)": "FX:NZDCHF",
  "NZD/JPY": "FX:NZDJPY",
  "NZD/JPY (OTC)": "FX:NZDJPY",
  "BTC/USDT": "BINANCE:BTCUSDT",
  "ETH/USDT": "BINANCE:ETHUSDT",
  "SOL/USDT": "BINANCE:SOLUSDT",
  "BNB/USDT": "BINANCE:BNBUSDT",
  "XRP/USDT": "BINANCE:XRPUSDT",
  "Gold (XAU/USD)": "OANDA:XAUUSD",
  "Silver (XAG/USD)": "OANDA:XAGUSD",
  "Oil (WTI)": "USOIL"
};

export const ADMIN_ID = "8950661719";

export type SignalRequestExpiry = "30s" | "1m" | "2m" | "5m";
export type BatchSignalRequestExpiry = "30s" | "1m" | "2m" | "5m";
