import React, { useEffect, useRef } from 'react';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import { useChatContext } from '../../context/ChatContext';

const ChatBox: React.FC = () => {
  const { messages, sendMessage, username, setUsername, onlineUsers } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!username) {
      const name = prompt('请输入你的用户名：');
      if (name) setUsername(name);
    }
  }, [username, setUsername]);

  return (
    <div className="chat-box bg-gray-800 shadow-md rounded-lg overflow-hidden h-full flex flex-col">
      <div className="online-users p-2 bg-gray-700 text-white">
        在线用户: {onlineUsers.join(', ')}
      </div>
      <div className="messages-container flex-grow overflow-y-auto p-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} isOwnMessage={msg.sender === username} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={sendMessage} />
    </div>
  );
};

export default ChatBox;