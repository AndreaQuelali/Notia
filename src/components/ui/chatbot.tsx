import { useState } from "react";

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
  if (!input.trim()) return;

  const newMessages: Message[] = [...messages, { role: "user", content: input }];
  setMessages(newMessages);
  setInput("");

  try {
   const res = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: input }),
});


    const data = await res.json();
    setMessages([...newMessages, { role: "bot", content: data.reply }]);
  } catch (err) {
    console.error(err);
    setMessages([...newMessages, { role: "bot", content: "Ocurrió un error." }]);
  }
};


  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", width: "400px", maxHeight: "300px", overflowY: "auto" }}>
      <div>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.role === "user" ? "right" : "left", margin: "0.5rem 0" }}>
            <b>{msg.role === "user" ? "Tú" : "IA"}:</b> {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Escribe algo..."
        style={{ width: "80%", marginRight: "0.5rem" }}
      />
      <button onClick={sendMessage} style={{ padding: "0.3rem 0.6rem" }}>
        Enviar
      </button>
    </div>
  );
}
