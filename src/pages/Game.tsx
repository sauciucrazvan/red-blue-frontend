import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Game() {
  let { id } = useParams();

  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [joinGameCode, setJoinGameCode] = useState("");
  const [role, setRole] = useState<string | null>("");
  const [status, setStatus] = useState<string | null>("");

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setError(null);
        const response = await fetch(
          `http://localhost:8000/api/v1/game/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setRole(localStorage.getItem("role"));
        setPlayerName(
          localStorage.getItem("role") == "player1"
            ? data.player1_name
            : data.player2_name
        );
        setJoinGameCode(data.code);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchGame();
  }, [id]);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/game/${id}`);

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatus(data.message);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Failed to connect to WebSocket");
    };

    const handleUnload = () => {
      ws.close();
    };

    window.addEventListener("beforeunload", handleUnload);
  }, [id]);

  return (
    <>
      <div>{error}</div>
      <div>Game ID: {id}</div>
      <div>Player: {playerName}</div>
      {role == "player1" && <div>Code: {joinGameCode}</div>}
      {status}
    </>
  );
}
