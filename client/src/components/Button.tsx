import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyles = "relative px-6 py-3 rounded-lg font-semibold overflow-hidden transition-all duration-300 ease-in-out";
  const primaryStyles = "bg-primary-purple text-white shadow-lg shadow-primary-purple/50 hover:shadow-primary-purple/80";
  const secondaryStyles = "bg-transparent border border-primary-purple text-primary-purple hover:bg-primary-purple hover:text-white";

  const glowEffect = `
    before:content-[''] before:absolute before:inset-0 before:bg-primary-purple before:blur-xl before:opacity-0 before:transition-opacity before:duration-500
    hover:before:opacity-30
    after:content-[''] after:absolute after:inset-0 after:bg-primary-purple after:blur-lg after:opacity-0 after:transition-opacity after:duration-700 after:delay-100
    hover:after:opacity-20
  `;

  return (
    <button
      className={`${baseStyles} ${variant === 'primary' ? primaryStyles : secondaryStyles} ${glowEffect} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;
