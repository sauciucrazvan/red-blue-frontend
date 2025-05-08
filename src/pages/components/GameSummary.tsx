import React from "react";

interface Round {
  round_number: number;
  player1_choice: string;
  player2_choice: string;
  player1_score: number;
  player2_score: number;
}

interface GameSummaryProps {
  player1Name: string;
  player2Name: string;
  rounds: Round[];
  onClose: () => void;
}

const GameSummary: React.FC<GameSummaryProps> = ({ player1Name, player2Name, rounds, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="relative bg-black bg-opacity-20 backdrop-blur-md text-white p-6 rounded shadow-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-2 right-4 text-lg text-gray-400 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="text-xl font-bold mb-4 text-center">Game Summary</h3>
        <table className="table-auto w-full text-left text-sm">
          <thead className="bg-white/10">
            <tr>
              <th className="px-3 py-2">Round</th>
              <th className="px-3 py-2">{player1Name}</th>
              <th className="px-3 py-2">{player2Name}</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((round, index) =>
              round.player1_score !== 0 && round.player2_score !== 0 ? (
                <tr key={index} className="bg-white/5">
                  <td className="px-3 py-2 font-semibold">{round.round_number}</td>
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
                                : "transparent",
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
                                : "transparent",
                        }}
                      ></div>
                      ({round.player2_score})
                    </div>
                  </td>
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameSummary;
