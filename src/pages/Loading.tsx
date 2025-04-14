export default function LoadingPage() {
  return (
  <div className = "min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-400 via-purple-200 to-blue-400 text-gray-800">
    <div className = "flex items-center gap-4">
      <svg
        className = "animate-spin h-10 w-10 text-purple-700"
        xmlns = "http://www.w3.org/2000/svg"
        fill = "none"
        viewBox = "0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx = "12"
            cy = "12"
            r = "10"
            stroke = "currentColor"
            strokeWidth = "4"
          ></circle>

        <path
          className="opacity-75"
          fill = "currentColor"
          d = "M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>

      </svg>
      <span className="text-2xl font-semibold animate-pulse">Loading...</span>
    </div>
  </div>
  );
}