import React from 'react';
import type { LucideIcon } from 'lucide-react';

type Theme = 'light' | 'dark';

interface ButtonProps {
  theme?: Theme;
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  className?: string;
  icon?: LucideIcon;
}

function getVariantStyles(theme: Theme) {
  const isDark = theme === 'dark';
  return {
    default: isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-300 hover:bg-slate-400 text-slate-900',
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    secondary: isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700',
    accent: isDark ? 'bg-slate-700 hover:bg-slate-600 text-indigo-300' : 'bg-slate-300 hover:bg-slate-400 text-indigo-700',
  };
}

export default function Button({
  theme = 'dark',
  children,
  onClick,
  variant = 'default',
  className = '',
  icon: Icon,
}: ButtonProps) {
  const variantStyles = getVariantStyles(theme);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 font-medium rounded-xl transition-colors flex items-center justify-center gap-1 ${variantStyles[variant]} ${className}`}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
}
