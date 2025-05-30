import { useEffect, useState } from "react";
import AnimatedDots from "../../../components/AnimatedDots";
import { API_URL } from "../../../config";

export default function PublicGamesTable({
  onJoin,
}: {
  onClose: () => void;
  onJoin: (code: string) => void;
}) {
  const [games, setGames] = useState<{ code: string; player1_name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetch(API_URL + "api/v1/games/public")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch public games");
        return res.json();
      })
      .then((data) => {
        setGames(data.games || []);
        setLoading(false);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Error loading games");
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <AnimatedDots />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 text-center py-4">{error}</div>;
  }

  if (!games.length) {
    return (
      <div className="text-center text-gray-200 py-4">
        No public games available.
      </div>
    );
  }

  return (
    <table className="w-full text-center border border-white/20 text-sm mb-2">
      <thead className="bg-white/10">
        <tr>
          <th className="py-2">Opponent</th>
          <th className="py-2">Options</th>
        </tr>
      </thead>
      <tbody>
        {games.map((game) => (
          <tr key={game.code} className="bg-white/5">
            <td className="py-2">{game.player1_name}</td>
            <td className="py-2">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded"
                onClick={() => onJoin(game.code)}
              >
                Join
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
