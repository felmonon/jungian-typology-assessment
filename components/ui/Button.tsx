import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center
    font-sans font-medium tracking-wide
    transition-all duration-200 ease-out
    focus:outline-none focus-visible:ring-2 focus-visible:ring-jung-accent focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.98]
  `;

  const variants = {
    primary: `
      bg-jung-primary text-white
      hover:bg-jung-accent hover:shadow-lg hover:shadow-jung-accent/20
      hover:-translate-y-0.5
    `,
    secondary: `
      bg-jung-dark text-white
      hover:bg-jung-secondary hover:shadow-md
      hover:-translate-y-0.5
    `,
    outline: `
      border-2 border-jung-primary text-jung-primary bg-transparent
      hover:bg-jung-primary hover:text-white
      hover:-translate-y-0.5
    `,
    ghost: `
      text-jung-primary bg-transparent
      hover:bg-jung-accent-light
    `,
    accent: `
      bg-gradient-to-r from-jung-accent to-jung-accent-hover text-white
      hover:shadow-lg hover:shadow-jung-accent/25
      hover:-translate-y-0.5
    `
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-md min-h-[36px]",
    md: "px-6 py-3 text-base rounded-lg min-h-[44px]",
    lg: "px-8 py-4 text-lg rounded-lg min-h-[52px]"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
