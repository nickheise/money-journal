import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { cn } from './utils';

/**
 * LoadingSpinner - Animated loading indicator
 * 
 * Sizes:
 * - sm: 16px (icons, inline)
 * - md: 24px (default, buttons)
 * - lg: 32px (sections)
 * - xl: 48px (full page)
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <Loader2 className={cn('animate-spin text-muted-foreground', sizeClasses[size])} />
    </motion.div>
  );
}

/**
 * LoadingOverlay - Full-screen or container loading overlay
 */

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingOverlay({ 
  message = 'Loading...', 
  fullScreen = false,
  className 
}: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm',
        fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0 z-10',
        className
      )}
    >
      <LoadingSpinner size="lg" />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </motion.div>
  );
}

/**
 * LoadingCard - Skeleton loading card
 */

export function LoadingCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl bg-secondary/50 p-6 animate-pulse', className)}>
      <div className="space-y-3">
        <div className="h-4 bg-secondary rounded w-3/4" />
        <div className="h-6 bg-secondary rounded w-1/2" />
        <div className="h-4 bg-secondary rounded w-2/3" />
      </div>
    </div>
  );
}

/**
 * LoadingList - Skeleton loading list
 */

interface LoadingListProps {
  count?: number;
  className?: string;
}

export function LoadingList({ count = 3, className }: LoadingListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-secondary/50 p-4 animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-secondary rounded w-3/4" />
              <div className="h-3 bg-secondary rounded w-1/2" />
            </div>
            <div className="h-6 bg-secondary rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
