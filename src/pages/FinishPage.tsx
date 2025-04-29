import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingPage from "./Loading";
import ErrorPage from "./ErrorPage";

export default function FinishPage() {
  let { id } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

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

        const response = await fetch(
          `http://localhost:8000/api/v1/game/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

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

  if (loading) return LoadingPage();
  if (error) return ErrorPage(error);
  if (data == null) return ErrorPage("Failed to fetch data!");

  return (
    <section className="flex flex-col items-center">
      <div className="text-gray-400 text-xs">Identifier: {id}</div>
      <div className="flex flex-col items-start mb-4">
        <span>Game finished! Congrats!!!</span>
        <button
          className="bg-red-500 p-2 rounded-md mt-2"
          onClick={() => navigate("/")}
        >
          Go home, you're drunk
        </button>
      </div>

      <section className="flex flex-col items-center pb-4">
        <h1 className="font-bold text-2xl">Scores</h1>

        <div className="flex flex-row gap-8 items-center text-lg rounded-md bg-gray-100 p-2">
          <div className="flex flex-col items-center">
            {data.player1_name} ({data.player1_score})
            {data.player1_score > 0 && (
              <span className="text-yellow-600 font-bold font-mono">
                Winner
              </span>
            )}
          </div>
          <b>vs</b>
          <div className="flex flex-col items-center">
            {data.player2_name} ({data.player2_score})
            {data.player2_score > 0 && (
              <span className="text-yellow-600 font-bold font-mono">
                Winner
              </span>
            )}
          </div>
        </div>
      </section>

      <h1 className="font-bold text-2xl">Rounds</h1>

      <table className="table-auto border-collapse border border-gray-500 w-[75%] text-white text-left">
        <thead>
          <tr className="bg-gray-700 text-white">
            <th className="border border-gray-500 px-4 py-2">Round</th>
            <th className="border border-gray-500 px-4 py-2">
              {data.player1_name}'s Choice
            </th>
            <th className="border border-gray-500 px-4 py-2">
              {data.player2_name}'s Choice
            </th>
          </tr>
        </thead>
        <tbody>
          {data.rounds.map((round: any, index: number) => (
            <tr key={index} className="odd:bg-gray-800 even:bg-gray-700">
              <td className="border border-gray-500 px-4 py-2">
                {round.round_number}
              </td>
              <td className="border border-gray-500 px-4 py-2">
                {round.player1_choice || "N/A"} ({round.player1_score})
              </td>
              <td className="border border-gray-500 px-4 py-2">
                {round.player2_choice || "N/A"} ({round.player2_score})
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
