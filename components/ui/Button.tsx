import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'inverted' | 'gradient' | 'glass';
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
    font-sans font-semibold tracking-wide
    transition-all duration-300 ease-out
    focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.98]
    overflow-hidden
  `;

  const variants = {
    primary: `
      bg-jung-dark text-white
      shadow-lg shadow-jung-dark/20
      hover:bg-jung-secondary hover:shadow-xl hover:shadow-jung-dark/25
      active:shadow-lg
    `,
    secondary: `
      bg-jung-surface-alt text-jung-dark
      border border-jung-border
      hover:bg-jung-surface hover:border-jung-dark/20 hover:shadow-md
    `,
    outline: `
      bg-transparent text-jung-dark
      border border-jung-border
      hover:border-jung-dark hover:bg-jung-surface-alt
    `,
    ghost: `
      bg-transparent text-jung-secondary
      hover:bg-jung-surface-alt hover:text-jung-dark
    `,
    accent: `
      bg-gradient-to-r from-amber-600 to-amber-700
      text-white
      shadow-lg shadow-amber-600/25
      hover:shadow-xl hover:shadow-amber-600/35
      hover:from-amber-500 hover:to-amber-600
    `,
    inverted: `
      bg-white text-jung-dark
      shadow-lg shadow-jung-dark/10
      hover:shadow-xl hover:shadow-jung-dark/15
    `,
    gradient: `
      bg-gradient-to-r from-jung-dark via-jung-secondary to-jung-dark
      text-white
      shadow-lg shadow-jung-dark/25
      hover:shadow-xl
      bg-[length:200%_100%] hover:bg-right
      transition-all duration-500
    `,
    glass: `
      bg-white/80 backdrop-blur-xl
      text-jung-dark
      border border-jung-border/50
      shadow-lg shadow-jung-dark/5
      hover:bg-white hover:shadow-xl
    `
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-xl min-h-[40px]",
    md: "px-6 py-3 text-base rounded-xl min-h-[48px]",
    lg: "px-8 py-4 text-lg rounded-2xl min-h-[56px]",
    xl: "px-10 py-5 text-xl rounded-2xl min-h-[64px]"
  };

  const sizeClasses = sizes[size];
  const variantClasses = variants[variant];

  return (
    <button
      className={`${baseStyles} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="w-5 h-5 animate-spin" />
      )}
      {!isLoading && leftIcon && (
        <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span className="relative z-10">{children}</span>
      {!isLoading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};

// Icon Button variant
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
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
    sm: "w-10 h-10 rounded-xl",
    md: "w-12 h-12 rounded-xl",
    lg: "w-14 h-14 rounded-2xl"
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
        bg-gradient-to-r from-amber-600 to-amber-700
        text-white font-sans font-semibold
        rounded-full shadow-2xl shadow-amber-600/40
        hover:shadow-amber-600/50 hover:scale-105
        transition-all duration-300
        ${className}
      `}
      {...props}
    >
      <span className="w-6 h-6">{icon}</span>
      {label && <span>{label}</span>}
    </button>
  );
};
