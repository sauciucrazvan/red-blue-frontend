import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false); 
    setTimeout(() => {
      onClose(); 
    }, 500); 
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{
              scale: 0.8,
              opacity: 0,
              y: 50,
              transition: { duration: 0.5 }, 
            }}
            transition={{
              duration: 0.5, 
              type: "spring", 
              stiffness: 300,
              damping: 25,
            }}
            className="relative bg-black bg-opacity-20 backdrop-blur-md text-white p-6 rounded shadow-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]"
          >
            <button
              className="absolute top-2 right-4 text-lg text-gray-400 hover:text-white"
              onClick={handleClose}
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
                    <motion.tr
                      key={index}
                      className="bg-white/5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
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
                                  : "gray",
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
                                  : "gray",
                            }}
                          ></div>
                          ({round.player2_score})
                        </div>
                      </td>
                    </motion.tr>
                  ) : null
                )}
              </tbody>
            </table>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameSummary;
