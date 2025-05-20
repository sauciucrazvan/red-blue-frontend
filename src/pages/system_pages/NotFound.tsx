export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-red-700 to-blue-700 text-white p-4">
      <h1 className="text-6xl font-extrabold mb-4 drop-shadow-lg">404</h1>
      <p className="text-2xl font-semibold mb-2">
        Oops! There's something missing here...
      </p>
      <p className="text-md mb-6 text-center max-w-md">
        The page you were looking for doesn't exist or has been moved. Let's get
        you back on track.
      </p>
      <a
        href="/"
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded shadow-md"
      >
        Go to Dashboard
      </a>
    </div>
  );
}
