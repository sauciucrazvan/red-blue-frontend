import { useState } from "react";

const Game = () => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const handleChoice = (color: string) => {
    setSelectedColor(color);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="w-full p-4 bg-gray-700 text-center text-xl font-bold">
        <div className="flex justify-between">
          <div className="flex-1 text-left pl-4">Player1_Name (score)</div>
          <div>GAME DETAILS - Round X</div>
          <div className="flex-1 text-right pr-4">Player2_Name (score)</div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex w-full h-full">
        <div
          className={`flex-1 text-center text-white font-bold text-5xl flex items-center justify-center transition duration-300 ${
            selectedColor === "RED" ? "bg-red-700" : "bg-red-500"
          }`}
          onClick={() => handleChoice("RED")}
        >
          RED
        </div>
        <div className="w-1 bg-black"></div>
        <div
          className={`flex-1 text-center text-white font-bold text-5xl flex items-center justify-center transition duration-300 ${
            selectedColor === "BLUE" ? "bg-blue-700" : "bg-blue-500"
          }`}
          onClick={() => handleChoice("BLUE")}
        >
          BLUE
        </div>
      </div>

      {/* Footer */}
      <div className="w-full p-4 bg-gray-700 text-center text-lg">
        {selectedColor
          ? `You selected: ${selectedColor}`
          : "Please choose a color"}
      </div>
    </div>
  );
};

export default Game;
