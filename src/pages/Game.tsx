import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Game() {
  let { id } = useParams();

  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [joinGameCode, setJoinGameCode] = useState("");
  const [role, setRole] = useState<string | null>("player1");
  const [status, setStatus] = useState<string | null>("");
  const [player1Choice, setPlayer1Choice] = useState<string | null>(null);
  const [player1Score, setPlayer1Score] = useState<number | null>(null);
  const [player2Choice, setPlayer2Choice] = useState<string | null>(null);
  const [player2Score, setPlayer2Score] = useState<number | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(1);

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

        //setCurrentRound(data.current_round);
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
      console.log("WebSocket data received:", data);

      setStatus(data.message);

      if (data.player1_choice) {
        setPlayer1Choice(data.player1_choice);
      }
      if (data.player2_choice) {
        setPlayer2Choice(data.player2_choice);
      }

      if (data.player1_score) setPlayer1Score(data.player1_score);
      if (data.player2_score) setPlayer2Score(data.player2_score);

      if (data.next_round) {
        setCurrentRound(data.next_round);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Failed to connect to WebSocket");
    };

    const handleUnload = () => {
      ws.close();
    };

    window.addEventListener("beforeunload", handleUnload);

    // return () => {
    //   ws.close();
    //   window.removeEventListener("beforeunload", handleUnload);
    // };
  }, [id]);

  const chooseColor = async (choice: string) => {
    console.log("Sending POST request:", {
      game_id: id,
      round_number: currentRound,
      player_name: playerName,
      choice: choice,
    });

    try {
      const response = await fetch(
        `http://localhost:8000/game/${id}/round/${currentRound}/choice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            game_id: id,
            round_number: currentRound,
            player_name: playerName,
            choice: choice,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      //console.error("Error choosing color:", error);
      setError(`Failed to submit choice: ${error}`);
    }
  };

  return (
    <>
      <div>{error}</div>
      <div>Game ID: {id}</div>
      <div>Player: {playerName}</div>
      {role === "player1" && <div>Code: {joinGameCode}</div>}
      <div>Status: {status}</div>
      <div>Current Round: {currentRound}</div>
      <div>Player 1 Score: {player1Score || "0"}</div>
      <div>Player 2 Score: {player2Score || "0"}</div>
      <div>Player 1 Choice: {player1Choice || "Waiting for choice"}</div>
      <div>Player 2 Choice: {player2Choice || "Waiting for choice"}</div>
      <div>
        <button className="p-2 bg-red-500" onClick={() => chooseColor("RED")}>
          Choose Red
        </button>
        <button className="p-2 bg-blue-500" onClick={() => chooseColor("BLUE")}>
          Choose Blue
        </button>
      </div>
    </>
  );
}
