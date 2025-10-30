import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={`bg-white bg-opacity-5 backdrop-filter backdrop-blur-glass rounded-xl p-6 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
