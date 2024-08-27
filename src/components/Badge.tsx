import { useState, useEffect } from "react";

interface BadgeProps {
  status: string;
}

export default function Badge({ status }: BadgeProps) {
  const [color, setColor] = useState<string>("");

  useEffect(() => {
    switch (status) {
      case "pending":
        setColor("bg-yellow-500");
        break;
      case "process":
        setColor("bg-blue-500");
        break;
      case "success":
        setColor("bg-green-500");
        break;
      case "error":
        setColor("bg-red-500");
        break;
      default:
        setColor("bg-gray-500");
        break;
    }
  }, [status]);

  return (
    <div
      className={`w-min text-white text-center px-2 py-1 font-bold  rounded-md text-xs ${color}`}
    >
      {status.toUpperCase()}
    </div>
  );
}
