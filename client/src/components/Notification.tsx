import React from 'react';

interface NotificationProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

const Notification: React.FC<NotificationProps> = ({ message, type = 'info', className, ...props }) => {
  const typeStyles = {
    info: 'border-blue-500 text-blue-300',
    success: 'border-green-500 text-green-300',
    warning: 'border-yellow-500 text-yellow-300',
    error: 'border-red-500 text-red-300',
  };

  return (
    <div
      className={`bg-white bg-opacity-5 backdrop-filter backdrop-blur-glass border ${typeStyles[type]} rounded-xl p-4 shadow-lg flex items-center justify-between ${className}`}
      {...props}
    >
      <p>{message}</p>
      <button className="text-gray-400 hover:text-white ml-4">×</button>
    </div>
  );
};

export default Notification;
