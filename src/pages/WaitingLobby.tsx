export default function WaitingLobby(game_code: string) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-400 via-purple-200 to-blue-400 text-gray-800">
      <div className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-30 rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-6">
        <h2 className="text-2xl font-bold">Waiting for the opponent...</h2>
        <p className="text-lg">Share this code with your opponent: </p>
        <div>
          {game_code}
        </div>
        <p className="text-sm text-gray-700 italic">The game will start once your opponent joins.</p>
      </div>
    </div>
  );
}