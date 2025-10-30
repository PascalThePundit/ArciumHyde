import React from 'react';
import Button from './Button';

interface LoginBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const LoginBubble: React.FC<LoginBubbleProps> = ({ className, ...props }) => {
  return (
    <div
      className={`bg-white bg-opacity-5 backdrop-filter backdrop-blur-glass border border-gray-700 rounded-xl p-8 shadow-lg text-center ${className}`}
      {...props}
    >
      <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
      <p className="text-gray-300 mb-6">Please connect your Solana wallet to access all features.</p>
      <Button>Connect Phantom</Button>
    </div>
  );
};

export default LoginBubble;
