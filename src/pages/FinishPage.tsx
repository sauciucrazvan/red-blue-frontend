import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import LoadingPage from "./Loading";
import ErrorPage from "./ErrorPage";
import { API_URL } from "../config";
import { FaCrown, FaThumbsDown } from "react-icons/fa6";

export default function FinishPage() {
  let { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  var message = "";

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          setError("Invalid token.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}api/v1/game/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            navigate("/404");
            return;
          }

          setError(response.statusText.toString());
          setLoading(false);
          throw new Error(`Error: ${response.statusText}`);
        }

        const _data = await response.json();

        console.log(_data);

        setData(_data);

        console.log(_data.game_state);

        if (_data.game_state !== "finished") {
          setError("Game not finished");
          setLoading(false);
          throw new Error(`Game not finished!`);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  let reason = searchParams.get("r");
  switch (reason) {
    case "abandon":
      message = "A player has abandoned the game!";
      break;
    default:
      message = "The game has finished! Congrats to the players!";
      break;
  }

  if (loading) return LoadingPage();
  if (error) return ErrorPage(error);
  if (data == null) return ErrorPage("Failed to fetch data!");

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-400 via-purple-200 to-blue-400 text-gray-800 pt-32">
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-3xl font-bold mb-2 font-mono leading-3">
          GAME OVER!
        </h2>
        <p className="text-lg font-thin mb-4">{message}</p>
      </div>

      <section className="pb-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Final Scores</h1>
        <div className="grid grid-cols-3 items-center text-lg bg-black bg-opacity-10 backdrop-blur-md p-6 rounded-lg shadow-lg w-full">
          <div className="flex flex-col items-center gap-2">
            {data.player1_score > 0 ? (
              <span className="text-yellow-400 font-bold">
                <FaCrown />
              </span>
            ) : (
              <span className="text-red-400 font-bold">
                <FaThumbsDown />
              </span>
            )}
            <div className="inline-flex gap-1 items-center text-center w-full justify-center">
              {data.player1_name}
              <span
                className={
                  (data.player1_score < 0 ? "bg-red-400 " : "bg-yellow-400 ") +
                  "rounded-md px-2 py-1 text-white font-mono text-xs"
                }
              >
                {data.player1_score > 0
                  ? "+" + data.player1_score
                  : data.player1_score}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center w-full">
            <b className="text-xl">vs</b>
          </div>

          <div className="flex flex-col items-center gap-2">
            {data.player2_score > 0 ? (
              <span className="text-yellow-400 font-bold">
                <FaCrown />
              </span>
            ) : (
              <span className="text-red-400 font-bold">
                <FaThumbsDown />
              </span>
            )}
            <div className="inline-flex gap-1 items-center text-center w-full justify-center">
              {data.player2_name}
              <span
                className={
                  (data.player2_score < 0 ? "bg-red-400 " : "bg-yellow-400 ") +
                  "rounded-md px-2 py-1 text-white font-mono text-xs"
                }
              >
                {data.player2_score > 0
                  ? "+" + data.player2_score
                  : data.player2_score}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded shadow-md"
          onClick={() => navigate("/")}
        >
          Play again
        </button>
      </section>

      <h1 className="text-2xl font-bold mb-4">Rounds Summary</h1>

      <table className="table-auto border-collapse w-full max-w-4xl border border-gray-200 text-black text-left shadow-md bg-transparent">
        <thead>
          <tr className="bg-white bg-opacity-30">
            <th className="border border-gray-500 px-4 py-2 w-[5%]">Round</th>
            <th className="border border-gray-500 px-4 py-2">
              {data.player1_name}
            </th>
            <th className="border border-gray-500 px-4 py-2">
              {data.player2_name}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.rounds.map(
            (round: any, index: number) =>
              round.player1_score != 0 &&
              round.player2_score != 0 && (
                <tr
                  key={index}
                  className="odd:bg-gray-700 odd:bg-opacity-10 even:bg-white even:bg-opacity-20"
                >
                  <td className="border border-gray-500 px-4 py-2 text-center">
                    <b>{round.round_number}</b>
                  </td>
                  <td className="border border-gray-500 px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{
                          backgroundColor:
                            round.player1_choice === "RED"
                              ? "red"
                              : round.player1_choice === "BLUE"
                              ? "blue"
                              : "gray",
                        }}
                      ></div>
                      <span>({round.player1_score})</span>
                    </div>
                  </td>
                  <td className="border border-gray-500 px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{
                          backgroundColor:
                            round.player2_choice === "RED"
                              ? "red"
                              : round.player2_choice === "BLUE"
                              ? "blue"
                              : "gray",
                        }}
                      ></div>
                      <span>({round.player2_score})</span>
                    </div>
                  </td>
                </tr>
              )
          )}
        </tbody>
      </table>
      <div className="text-gray-700 text-xs mt-4">Identifier: {id}</div>
    </section>
  );
}
