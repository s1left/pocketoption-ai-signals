import { useState, useEffect, useRef } from "react";

export function usePriceTicker(initialPrice: number = 1.0850) {
  const [price, setPrice] = useState(initialPrice);
  const priceRef = useRef(price);

  useEffect(() => {
    priceRef.current = price;
  }, [price]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate small random fluctuations (±0.00018)
      const change = (Math.random() - 0.5) * 0.00036;
      setPrice((prev) => +(prev + change).toFixed(5));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return price;
}
