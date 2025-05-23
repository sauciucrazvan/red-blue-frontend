export default function GameStatusBadge({ status }: { status: string }) {
  let color = "bg-gray-500";
  let textColor = "text-gray-900";

  switch (status) {
    case "active":
      color = "bg-green-500";
      textColor = "text-white";
      break;
    case "finished":
      color = "bg-red-500";
      textColor = "text-white";
      break;
    case "pause":
      color = "bg-orange-500";
      textColor = "text-white";
      break;
    case "waiting":
      color = "bg-yellow-500";
      textColor = "text-white";
      break;
  }

  return (
    <>
      <div
        className={
          color +
          " " +
          textColor +
          " rounded-md px-2 py-1 text-sm font-semibold text-center"
        }
      >
        {status}
      </div>
    </>
  );
}
