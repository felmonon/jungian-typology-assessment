import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'inverted';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = `
    relative inline-flex items-center justify-center gap-2
    font-sans font-semibold
    transition-colors duration-200 ease-out motion-reduce:transition-none
    focus:outline-none focus-visible:ring-2 focus-visible:ring-jung-accent focus-visible:ring-offset-2
    focus-visible:ring-offset-jung-base
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none

  `;

  const variants = {
    primary: `
      bg-jung-dark text-white shadow-md shadow-jung-dark/10
      hover:bg-jung-accent-hover
    `,
    secondary: `
      bg-jung-surface-alt text-jung-dark border border-jung-border
      hover:bg-jung-accent-light hover:border-jung-accent-muted
    `,
    outline: `
      bg-transparent text-jung-dark border border-jung-border
      hover:bg-jung-surface hover:border-jung-accent-muted
    `,
    ghost: `
      bg-transparent text-jung-dark
      hover:bg-jung-surface-alt
    `,
    accent: `
      bg-jung-accent text-white shadow-sm shadow-jung-accent/10
      hover:bg-jung-accent-hover
    `,
    inverted: `
      bg-white text-jung-dark shadow-sm
      hover:bg-jung-surface-alt
    `,
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-xl min-h-[40px]",
    md: "px-6 py-3 text-sm rounded-xl min-h-[48px]",
    lg: "px-8 py-3.5 text-base rounded-xl min-h-[52px]",
    xl: "px-10 py-4 text-lg rounded-xl min-h-[58px]"
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span className="min-w-0">{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

