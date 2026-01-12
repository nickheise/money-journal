import { ReactNode } from 'react';

/**
 * SectionHeader - Consistent section heading with optional action
 * 
 * Used throughout the app for section titles
 */

interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="text-lg opacity-50">{title}</h2>
      {action && action}
    </div>
  );
}
