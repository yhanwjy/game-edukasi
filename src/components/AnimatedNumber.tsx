"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  duration?: number;
}

export function AnimatedNumber({
  value,
  suffix = "",
  duration = 0.75,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        setDisplayValue(Math.round(latest));
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {displayValue.toLocaleString("id-ID")}
      {suffix}
    </span>
  );
}
