export default function ErrorPage(error: string) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-red-400 via-purple-200 to-blue-400 text-white p-4">
      <h1 className="text-6xl font-extrabold mb-4 drop-shadow-lg">Oops!</h1>
      <p className="text-2xl font-semibold mb-2">Something went wrong</p>
      <p className="text-md mb-6 text-center max-w-md">{error}</p>
      <a
        href="/"
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded shadow-md"
      >
        Go to Dashboard
      </a>
    </div>
  );
}
