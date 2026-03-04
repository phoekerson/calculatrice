import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface ButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'active-op' | 'sci';
  className?: string;
  icon?: LucideIcon;
  span2?: boolean;
}

export default function Button({
  children,
  onClick,
  variant = 'default',
  className = '',
  icon: Icon,
  span2,
}: ButtonProps) {
  const variantClass = {
    default: '',
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    'active-op': 'btn-active-op',
    sci: 'btn-sci',
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`calc-btn ${variantClass} ${span2 ? 'col-span-2' : ''} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}
