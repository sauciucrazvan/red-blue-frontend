import React, { useEffect, useState } from "react";

const AnimatedDots: React.FC = () => {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev < 3 ? prev + 1 : 0));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <span>{".".repeat(dotCount)}</span>;
};

export default AnimatedDots;
