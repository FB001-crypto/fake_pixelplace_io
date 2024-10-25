import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isPrivate: boolean;
  recipient?: string;
}

interface ChatContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  sendMessage: (content: string, recipient?: string) => void;
  username: string;
  setUsername: (name: string) => void;
  onlineUsers: string[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('chat message', (msg: Message) => {
      addMessage(msg);
    });

    newSocket.on('update online users', (users: string[]) => {
      setOnlineUsers(users);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const addMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const sendMessage = (content: string, recipient?: string) => {
    if (socket) {
      const message: Message = {
        id: Date.now().toString(),
        sender: username,
        content,
        timestamp: new Date(),
        isPrivate: !!recipient,
        recipient
      };
      socket.emit('chat message', message);
      addMessage(message);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, addMessage, sendMessage, username, setUsername, onlineUsers }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
