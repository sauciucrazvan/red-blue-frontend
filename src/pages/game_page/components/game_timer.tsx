import { useEffect, useState } from "react";

function getInterpolatedColor(timer: number): string {
  const t = timer / 60;
  let r, g, b;
  if (t > 0.5) {
    const ratio = (t - 0.5) * 2;
    r = 59 + (139 - 59) * (1 - ratio);
    g = 130 + (92 - 130) * (1 - ratio);
    b = 246;
  } else {
    const ratio = t * 2;
    r = 139 + (239 - 139) * (1 - ratio);
    g = 92 + (68 - 92) * (1 - ratio);
    b = 246 + (68 - 246) * (1 - ratio);
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

export default function GameTimer({
  created_at,
  onHold,
}: {
  created_at: string;
  onHold: boolean;
}) {
  const [timer, setTimer] = useState<number>(60);

  useEffect(() => {
    const interval = setInterval(() => {
      if (onHold) return;

      const elapsed = Math.floor(
        (Date.now() - new Date(created_at).getTime()) / 1000
      );
      setTimer(Math.max(60 - elapsed, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [created_at, onHold]);

  return (
    <div className="flex justify-center w-full h-full">
      <div className="relative w-[5.5rem] h-[5.5rem] sm:w-40 sm:h-40">
        <svg
          className="absolute top-0 left-0 w-full h-full"
          viewBox="0 0 160 160"
        >
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke={getInterpolatedColor(timer)}
            strokeWidth="15"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 70}
            strokeDashoffset={2 * Math.PI * 70 * ((60 - timer) / 60)}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-lg sm:text-5xl font-bold text-white">
          {timer}
        </div>
      </div>
    </div>
  );
}
