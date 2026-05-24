import React, { useEffect, useRef, memo } from "react";

interface TradingViewWidgetProps {
  symbol: string;
}

function TradingViewWidgetComponent({ symbol }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "1",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      backgroundColor: "rgba(10, 10, 10, 1)",
      gridColor: "rgba(26, 26, 26, 1)",
      hide_top_toolbar: false,
      hide_legend: true,
      save_image: false,
      studies: ["RSI@tv-basicstudies"],
      support_host: "https://www.tradingview.com",
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol]);

  return (
    <div className="w-full h-full min-h-[400px]" ref={containerRef} />
  );
}

export const TradingViewWidget = memo(TradingViewWidgetComponent);
