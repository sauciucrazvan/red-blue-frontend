import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import LoadingPage from "./Loading";
import ErrorPage from "./ErrorPage";
import { API_URL } from "../config";
import { FaCrown, FaThumbsDown } from "react-icons/fa6";

export default function FinishPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);

  const reason = searchParams.get("r");
  const message =
    reason === "abandon"
      ? "A player has abandoned the game!"
      : "The game has finished! Congrats to the players!";

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Invalid token.");

        const res = await fetch(`${API_URL}api/v1/game/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 404) return navigate("/404");
          throw new Error(res.statusText);
        }

        const _data = await res.json();
        if (_data.game_state !== "finished")
          throw new Error("Game not finished");

        setData(_data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [id]);

  if (loading) return LoadingPage();
  if (error || !data) return ErrorPage(error ?? "Failed to fetch data!");

  return (
    <section className="min-h-screen bg-gradient-to-br from-red-700 via-purple-300 to-blue-700 flex flex-col items-center pt-32 px-4 text-white relative">
      <h2 className="text-4xl font-bold mb-2 tracking-tight">Game Over</h2>
      <p className="text-sm font-light mb-8 italic">{message}</p>

      <div className="flex gap-12 bg-black bg-opacity-30 p-6 rounded-xl shadow-lg w-full max-w-2xl justify-around">
        {[1, 2].map((n) => {
          const isWinner = data[`player${n}_score`] > 0;
          return (
            <div key={n} className="text-center">
              <div className="text-2xl mb-2 font-semibold">
                {data[`player${n}_name`]}
              </div>
              <div
                className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  isWinner ? "bg-yellow-400" : "bg-red-400"
                } text-black`}
              >
                {isWinner ? <FaCrown /> : <FaThumbsDown />}
              </div>
              <div
                className={`mt-2 px-3 py-1 rounded-md font-mono text-sm ${
                  isWinner ? "bg-yellow-400" : "bg-red-400"
                } text-black`}
              >
                {data[`player${n}_score`] > 0
                  ? `+${data[`player${n}_score`]}`
                  : data[`player${n}_score`]}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-10 px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md font-semibold"
      >
        Go to Dashboard
      </button>

      {/* View Rounds Button */}
      <button
        onClick={() => setShowSummary(true)}
        className="mt-4 text-sm underline hover:text-orange-200"
      >
        View Round Summary
      </button>

      <div className="text-xs mt-4 text-white/70">Identifier: {id}</div>

      {/* Modal Summary */}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-black bg-opacity-20 backdrop-blur-md text-white p-6 rounded shadow-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-4 text-lg text-gray-600 hover:text-black"
              onClick={() => setShowSummary(false)}
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4 text-center">
              Round Summary
            </h3>
            <table className="table-auto w-full text-left text-sm">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-3 py-2">Round</th>
                  <th className="px-3 py-2">{data.player1_name}</th>
                  <th className="px-3 py-2">{data.player2_name}</th>
                </tr>
              </thead>
              <tbody>
                {data.rounds.map(
                  (round: any, index: number) =>
                    round.player1_score != 0 &&
                    round.player2_score != 0 && (
                      <tr
                        key={index}
                        className={"bg-white/10"}
                      >
                        <td className="px-3 py-2 font-semibold">
                          {round.round_number}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor:
                                  round.player1_choice === "RED"
                                    ? "red"
                                    : round.player1_choice === "BLUE"
                                    ? "blue"
                                    : "bg-white/10",
                              }}
                            ></div>
                            ({round.player1_score})
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundColor:
                                  round.player2_choice === "RED"
                                    ? "red"
                                    : round.player2_choice === "BLUE"
                                    ? "blue"
                                    : "bg-white/10",
                              }}
                            ></div>
                            ({round.player2_score})
                          </div>
                        </td>
                      </tr>
                    )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
