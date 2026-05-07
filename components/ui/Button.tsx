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
    transition-all duration-200 ease-out
    focus:outline-none focus-visible:ring-2 focus-visible:ring-jung-accent focus-visible:ring-offset-2
    focus-visible:ring-offset-jung-base
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.98]
  `;

  const variants = {
    primary: `
      bg-jung-dark text-white shadow-sm
      hover:bg-jung-accent hover:-translate-y-px hover:shadow-md
    `,
    secondary: `
      bg-jung-surface-alt text-jung-dark border border-jung-border
      hover:bg-jung-accent-light hover:border-jung-accent-muted hover:-translate-y-px
    `,
    outline: `
      bg-transparent text-jung-dark border border-jung-border
      hover:bg-jung-surface hover:border-jung-accent-muted hover:-translate-y-px
    `,
    ghost: `
      bg-transparent text-jung-dark
      hover:bg-jung-surface-alt
    `,
    accent: `
      bg-jung-accent text-white shadow-sm shadow-jung-accent/10
      hover:bg-jung-accent-hover hover:-translate-y-px hover:shadow-accent
    `,
    inverted: `
      bg-white text-jung-dark shadow-sm
      hover:bg-jung-surface-alt hover:-translate-y-px hover:shadow-md
    `,
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg min-h-[40px]",
    md: "px-6 py-3 text-sm rounded-lg min-h-[48px]",
    lg: "px-8 py-3.5 text-base rounded-lg min-h-[52px]",
    xl: "px-10 py-4 text-lg rounded-lg min-h-[58px]"
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
    sm: "w-10 h-10 rounded-lg",
    md: "w-12 h-12 rounded-lg",
    lg: "w-14 h-14 rounded-lg"
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
        rounded-lg shadow-lg shadow-jung-accent/20
        hover:bg-jung-accent-hover hover:-translate-y-px
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
