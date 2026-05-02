import { useState } from "react";

export default function ChatBox() {
  const [msg, setMsg] = useState("");

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        className="w-full border p-2 rounded"
        placeholder="Type message..."
      />

      <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded">
        Send
      </button>
    </div>
  );
}
