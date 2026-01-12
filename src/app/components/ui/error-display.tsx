import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { Button } from './button';
import { cn } from './utils';

/**
 * ErrorDisplay - Inline error/success message
 * 
 * Variants:
 * - inline: Compact, single line with icon
 * - card: Card-style with optional retry button
 * - banner: Full-width banner at top/bottom
 * 
 * Types:
 * - error: Red/destructive styling (default)
 * - success: Green/success styling
 */

interface ErrorDisplayProps {
  message: string;
  variant?: 'inline' | 'card' | 'banner';
  type?: 'error' | 'success';
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorDisplay({ 
  message, 
  variant = 'inline',
  type = 'error',
  onRetry,
  onDismiss,
  className 
}: ErrorDisplayProps) {
  const isError = type === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;
  const colorClass = isError ? 'text-destructive' : 'text-green-700';
  const bgClass = isError ? 'bg-destructive/10' : 'bg-green-50';
  const borderClass = isError ? 'border-destructive/20' : 'border-green-200';

  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(`flex items-center gap-2 text-sm ${colorClass}`, className)}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span>{message}</span>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    );
  }

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          `flex items-center justify-between gap-4 p-4 ${bgClass} border ${borderClass} rounded-xl`,
          className
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className={`w-5 h-5 ${colorClass} shrink-0`} />
          <p className={`text-sm ${colorClass} font-medium truncate`}>{message}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="rounded-full"
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Card variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        `rounded-2xl border-2 ${borderClass} ${bgClass} p-6`,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${colorClass} mb-1`}>
            {isError ? 'Something went wrong' : 'Success'}
          </h3>
          <p className="text-sm text-muted-foreground">{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="mt-4 rounded-full"
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Try Again
            </Button>
          )}
        </div>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * EmptyState - Display when no data is available
 */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 rounded-2xl',
        className
      )}
      style={{ backgroundColor: '#F5F3FF' }}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(245, 243, 255, 0.4)' }}>
          <div className="text-muted-foreground">
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-lg text-foreground/60 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground/60 max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          size="sm"
          className="rounded-full"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}