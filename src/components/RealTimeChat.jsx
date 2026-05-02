import { useEffect, useState } from "react";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function RealTimeChat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addDoc(collection(db, "messages"), {
      text: text.trim(),
      sender: "system",
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
      <div className="h-40 overflow-auto space-y-2">
        {messages.map((m) => (
          <p key={m.id} className="text-sm text-slate-700">{m.text}</p>
        ))}
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input className="flex-1 rounded-lg border border-slate-300 px-3 py-2" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="rounded-lg bg-slate-900 px-3 py-2 text-white">Send</button>
      </form>
    </div>
  );
}
