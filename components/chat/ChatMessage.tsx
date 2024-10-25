import React from 'react';

interface ChatMessageProps {
  message: {
    sender: string;
    content: string;
    timestamp: Date;
    isPrivate: boolean;
    recipient?: string;
  };
  isOwnMessage: boolean;
}

// 根据用户名生成颜色
const generateColor = (username: string) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

const getContrastColor = (hexcolor: string) => {
  // 如果没有 # 前缀，添加它
  if (hexcolor.slice(0, 1) !== '#') {
    hexcolor = '#' + hexcolor;
  }

  // 将颜色转换为 RGB
  const r = parseInt(hexcolor.substr(1, 2), 16);
  const g = parseInt(hexcolor.substr(3, 2), 16);
  const b = parseInt(hexcolor.substr(5, 2), 16);

  // 计算亮度
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

  // 根据亮度返回黑色或白色
  return (yiq >= 128) ? 'black' : 'white';
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage }) => {
  const backgroundColor = isOwnMessage ? '#3B82F6' : generateColor(message.sender);
  const textColor = getContrastColor(backgroundColor);
  const messageClass = isOwnMessage ? 'ml-auto' : '';
  const timeString = new Date(message.timestamp).toLocaleTimeString();

  return (
    <div 
      className={`message ${messageClass} rounded-lg p-2 mb-2 max-w-xs`}
      style={{ 
        backgroundColor: backgroundColor,
        color: textColor,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="font-bold">{message.sender}</div>
      <div>{message.content}</div>
      <div className="text-xs text-gray-300 mt-1">
        {timeString}
        {message.isPrivate && ' (私聊)'}
      </div>
    </div>
  );
};

export default ChatMessage;
