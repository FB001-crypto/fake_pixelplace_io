import React, { useState } from 'react';
import { useChatContext } from '../../context/ChatContext';

interface ChatInputProps {
  onSendMessage: (content: string, recipient?: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const { onlineUsers } = useChatContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message, recipient);
      setMessage('');
      setRecipient('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
      <div className="flex mb-2">
        <select
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="mr-2 px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded-md"
        >
          <option value="">所有人</option>
          {onlineUsers.map((user) => (
            <option key={user} value={user}>{user}</option>
          ))}
        </select>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="输入消息..."
          className="flex-grow px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          发送
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
