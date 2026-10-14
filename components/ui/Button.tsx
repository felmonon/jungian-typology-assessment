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
    font-sans font-semibold leading-tight
    transition-[background-color,color,border-color,transform] duration-150 ease-out motion-reduce:transition-none
    active:translate-y-px
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none

  `;

  const variants = {
    primary: `
      bg-jung-dark text-white
      hover:bg-night-3
    `,
    secondary: `
      bg-jung-surface-alt text-jung-dark border border-transparent
      hover:bg-jung-border
    `,
    outline: `
      bg-transparent text-jung-dark border border-line-strong
      hover:border-jung-dark hover:bg-jung-surface
    `,
    ghost: `
      bg-transparent text-jung-dark underline-offset-4
      hover:bg-jung-surface hover:underline
    `,
    accent: `
      bg-jung-accent text-white
      hover:bg-jung-accent-hover
    `,
    inverted: `
      bg-white text-jung-dark
      hover:bg-jung-surface-alt
    `,
  };

  const sizes = {
    sm: "px-4 py-2 text-[0.9375rem] min-h-[44px]",
    md: "px-6 py-3 text-[0.9375rem] min-h-[48px]",
    lg: "px-8 py-3.5 text-base min-h-[52px]",
    xl: "px-10 py-4 text-lg min-h-[58px]"
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

// Icon Button variant
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizes = {
    sm: "w-11 h-11",
    md: "w-12 h-12",
    lg: "w-14 h-14"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <Button
      variant={variant}
      size="sm"
      className={`${sizes[size]} p-0 ${className}`}
      {...props}
    >
      <span className={iconSizes[size]}>{icon}</span>
    </Button>
  );
};

// Floating Action Button
interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingActionButton: React.FC<FABProps> = ({
  icon,
  label,
  position = 'bottom-right',
  className = '',
  ...props
}) => {
  const positions = {
    'bottom-right': 'bottom-8 right-8',
    'bottom-left': 'bottom-8 left-8',
    'top-right': 'top-8 right-8',
    'top-left': 'top-8 left-8'
  };

  return (
    <button
      className={`
        fixed ${positions[position]} z-50
        flex items-center gap-3 px-6 py-4
        bg-jung-accent text-white font-sans font-semibold
        shadow-lg
        hover:bg-jung-accent-hover
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      <span className="w-6 h-6">{icon}</span>
      {label && <span>{label}</span>}
    </button>
  );
};
