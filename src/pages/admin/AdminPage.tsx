import { useEffect, useState } from "react";
import { API_URL } from "../../config";
import toast from "react-hot-toast";
import AnimatedDots from "../../components/AnimatedDots";
import GameSummary from "../../components/GameSummary";
import GameStatusBadge from "./components/GameStatusBadge";
import { MdAlignHorizontalLeft, MdSettings } from "react-icons/md";

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedGamestate, setSelectedGamestate] = useState<string | null>(
    null
  );

  const game_states = ["active", "abandoned", "finished", "pause", "waiting"];
  const page_sizes = [10, 20, 30];

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      window.location.href = "/admin/login";
    }
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) throw new Error("Invalid token.");

        const res = await fetch(
          `${API_URL}api/v1/games?admin_token=${token}&page_size=10&page=${page}` +
            (selectedGamestate ? `&game_state=${selectedGamestate}` : "") +
            (pageSize ? `&page_size=${pageSize}` : "")
        );

        if (!res.ok) {
          throw new Error(res.statusText);
        }

        const data = await res.json();
        setData(data);

        if (typeof data.found_games === "number") {
          setTotalPages(
            Math.floor(data.found_games / 10) +
              (data.found_games % 10 === 0 ? 0 : 1)
          );
        }
      } catch (err: any) {
        toast.error("Failed to fetch games!", {
          position: "bottom-right",
        });
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [page, pageSize, selectedGamestate]);

  const cleanup = async () => {
    setLoading(true);

    // point to the cleanup endpoint
    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error("Invalid token.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}api/v1/admin/cleanup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ admin_token: token }),
      });

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      await res.json();
      toast.success("Cleanup successful!", {
        position: "bottom-right",
      });
    } catch (err: any) {
      toast.error("Failed to cleanup games!", {
        position: "bottom-right",
      });
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen h-full bg-gray-900 py-4">
        <h1 className="font-outfit text-4xl font-extrabold text-center mt-6 mb-4 bg-gradient-to-br from-[#D10000] from-50% to-[#027DFF] to-65% bg-clip-text text-transparent">
          RED & BLUE.
        </h1>
        <p className="text-gray-200 hover:text-gray-100">
          Welcome to the admin page!
        </p>
        <div className="pt-4"></div>
        <div className="mb-2 bg-gray-800 w-[95%] max-w-3xl p-4 rounded-md text-white flex flex-col">
          <b className="text-xl inline-flex gap-1 items-center">
            <MdSettings /> Actions
          </b>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded mt-2"
              onClick={cleanup}
            >
              Database Cleanup
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mt-2"
              onClick={() => {
                localStorage.removeItem("admin_token");
                window.location.href = "/admin/login";
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-2 bg-gray-800 w-[95%] max-w-3xl p-4 rounded-md text-white flex flex-col">
          <b className="text-xl inline-flex gap-1 items-center">
            <MdAlignHorizontalLeft /> Filters
          </b>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <div className="flex flex-col flex-1">
              <label
                className="text-sm text-gray-300 mb-1"
                htmlFor="game-state-filter"
              >
                Game State
                <span className="block text-xs text-gray-400">
                  Filter games by their current state
                </span>
              </label>
              <select
                id="game-state-filter"
                className="bg-gray-700 text-white font-bold py-2 px-4 rounded"
                onChange={(e) => {
                  setSelectedGamestate(e.target.value);
                  setPage(1);
                }}
                value={selectedGamestate || ""}
              >
                <option value="">All</option>
                {game_states.map((state) => (
                  <option key={state} value={state}>
                    {state.charAt(0).toUpperCase() + state.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col flex-1">
              <label
                className="text-sm text-gray-300 mb-1"
                htmlFor="page-size-filter"
              >
                Page Size
                <span className="block text-xs text-gray-400">
                  Number of games per page
                </span>
              </label>
              <select
                id="page-size-filter"
                className="bg-gray-700 text-white font-bold py-2 px-4 rounded"
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
                  setPage(1);
                }}
                value={pageSize}
              >
                {page_sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col flex-1 justify-end">
              <label className="text-sm text-gray-300 mb-1 invisible select-none">
                Clear Filters
              </label>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                  setSelectedGamestate(null);
                  setPageSize(10);
                  setPage(1);
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-white">
            Loading games
            <AnimatedDots />
          </p>
        ) : data ? (
          <>
            <div className="w-[95%] max-w-3xl overflow-x-auto rounded-lg">
              <table className="min-w-[600px] w-full bg-gray-800 text-white text-center rounded-lg overflow-hidden">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left hidden md:table-cell">
                      Game ID
                    </th>
                    <th className="px-4 py-2 text-left">Players</th>
                    <th className="px-4 py-2 text-left">Current State</th>
                    <th className="px-4 py-2 text-left">Join Code</th>
                    <th className="px-4 py-2 text-left">Played on</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data["games"].map((game: any) => (
                    <tr key={game.id} className="border-t border-gray-700">
                      <td className="px-4 py-2 hidden md:table-cell">
                        {game.id}
                      </td>
                      <td className="px-4 py-2">
                        {game.player1_name} ({game.player1_score}) vs{" "}
                        {game.player2_name} ({game.player2_score})
                      </td>
                      <td className="px-4 py-2">
                        <GameStatusBadge status={game.game_state} />
                      </td>
                      <td className="px-4 py-2 font-semibold">{game.code}</td>
                      <td className="px-4 py-2">
                        {new Date(game.created_at + "Z").toLocaleString()}
                      </td>
                      <td>
                        <button
                          className="hover:underline"
                          onClick={() => setSelectedGame(game)}
                        >
                          Summary
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-4">
              <button
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
                onClick={handlePrev}
                disabled={page === 1}
              >
                Prev
              </button>
              <span className="text-white">
                Page {page} of {totalPages}
              </span>
              <button
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
                onClick={handleNext}
                disabled={page === totalPages || totalPages === 0}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="text-white">
            <svg
              className="animate-spin h-10 w-10 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          </p>
        )}

        {/* Summary Modal */}
        {selectedGame && (
          <GameSummary
            player1Name={selectedGame.player1_name}
            player2Name={selectedGame.player2_name}
            rounds={selectedGame.rounds.sort(
              (a: any, b: any) => a.round_number - b.round_number
            )}
            onClose={() => setSelectedGame(null)}
          />
        )}
      </div>
    </>
  );
}
