import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WS_URL } from "../config";

interface WaitingLobbyProps {
  id: string;
  game_code: string;
}

export default function WaitingLobby(props: WaitingLobbyProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!props.id || !props.game_code) {
      console.error("Missing id or game_code...");
      navigate("/404");
      return;
    }

    let ws: WebSocket;

    const initializeWebSocket = () => {
      try {
        ws = new WebSocket(`${WS_URL}ws/game/${props.id}`);

        ws.onopen = () => {
          console.log("WebSocket connection established in WaitingLobby");
        };

        ws.onmessage = (event) => {
          try {
            const wsData = JSON.parse(event.data);

            if (wsData.state === "active") {
              console.log("Player connected, refreshing...");
              window.location.reload();
            }
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
          console.log("WebSocket connection closed in WaitingLobby");
        };
      } catch (err) {
        console.error("WebSocket initialization error:", err);
      }
    };

    initializeWebSocket();
  }, [props.id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-400 via-purple-200 to-blue-400 text-gray-800">
      <div className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-30 rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-6">
        <h2 className="text-2xl font-bold">Waiting for the opponent...</h2>
        <p className="text-lg">Share this code with your opponent: </p>
        <div>{props.game_code}</div>
        <p className="text-sm text-gray-700 italic">
          The game will start once your opponent joins.
        </p>
      </div>
    </div>
  );
}
