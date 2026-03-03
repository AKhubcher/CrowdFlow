import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variants = {
  primary: 'bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan border border-accent-cyan/20',
  secondary: 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10',
  ghost: 'hover:bg-white/5 text-white/50 hover:text-white/70',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-lg font-medium transition-all inline-flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
