import React from 'react';
import './ChatBot.css';

function Message({ sender, text }) {
  return (
    <div className={sender === "user" ? "message-user" : "message-bot"}>
      {text}
    </div>
  );
}

export default Message;

