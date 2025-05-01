import { useEffect, useState } from "react";

const GameTimer = ({ data }: { data: any }) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(60);

  const calculateTimeRemaining = (createdAt: string) => {
    const createdDate = new Date(createdAt).getTime(),
      currentDate = new Date().getTime();

    const elapsedSeconds = Math.floor((currentDate - createdDate) / 1000);

    return 60 - elapsedSeconds;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (data && data.game_state && data.game_state === "waiting") return;

      if (data && data.rounds && data.rounds[data.current_round - 1]) {
        const remainingTime = calculateTimeRemaining(
          data.rounds[data.current_round - 1].created_at
        );

        setTimeRemaining(remainingTime);

        if (remainingTime <= 0) {
          setTimeRemaining(60);
        }
      }

      if (data && data.game_state && data.game_state === "finished")
        clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  return (
    <div className="text-sm font-outfit text-gray-300">
      {/* {timeRemaining > 0 ? timeRemaining : "0"} */}
      01:00 left
    </div>
  );
};

export default GameTimer;
