import { X } from 'lucide-react';

/**
 * DialogHeader - Consistent header for dialogs and modals
 * 
 * Features:
 * - Title and optional subtitle
 * - Close button in standard position
 * - Optional back button support
 */

interface DialogHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  showCloseButton?: boolean;
  className?: string;
}

export function DialogHeader({ 
  title, 
  subtitle, 
  onClose,
  showCloseButton = true,
  className = ''
}: DialogHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        {subtitle && (
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        )}
        <h2>{title}</h2>
      </div>
      {showCloseButton && (
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
