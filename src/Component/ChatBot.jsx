import React, { useState, useEffect } from "react";
import HeadBot from "./HeadBot";
import Message from "./Message";

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!OPENAI_API_KEY) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: " Missing OpenAI API Key in .env file." },
      ]);
      return;
    }

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
  
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful AI assistant." },
            { role: "user", content: input },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      let botReply =
        data?.choices?.[0]?.message?.content ??
        "🤖 Sorry, I couldn't understand.";

      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      let errMsg = " Something went wrong.";

      if (error.message.includes("401")) {
        errMsg = "Invalid OpenAI API Key.";
      }

      setMessages((prev) => [...prev, { sender: "bot", text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const chatBody = document.querySelector(".chat-body");
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
  }, [messages]);

  return (
    <div className="chat-container flex flex-col h-[90vh] max-w-md mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
      <HeadBot />
      <div className="chat-body flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <Message key={i} sender={msg.sender} text={msg.text} />
        ))}
        {loading && (
          <div className="bot-message text-gray-500 italic animate-pulse">
             Bot is typing...
          </div>
        )}
      </div>
      <div className="chat-input flex p-3 border-t bg-gray-100">
        <input
          type="text"
          placeholder="Enter your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 p-2 border rounded-lg outline-none"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 disabled:bg-gray-400"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default ChatBot;
