import { FaStar } from "react-icons/fa6";

export default function PlayerCard({
  player,
  score,
}: {
  player: string;
  score: number;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl text-center shadow-md w-full md:max-w-xs text-white">
      <div className={`text-lg font-semibold inline-flex items-center gap-1`}>
        {localStorage.getItem("player_name") === player && (
          <FaStar className="text-yellow-500" />
        )}
        {player}
      </div>
      <div
        className={`text-2xl sm:text-3xl font-bold ${
          score > 0 ? "text-green-400" : "text-red-400"
        }`}
      >
        {score} pts
      </div>
    </div>
  );
}
