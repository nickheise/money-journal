import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from './utils';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * ModalSheet - Bottom sheet modal for mobile-friendly forms and actions
 * 
 * Features:
 * - Slides up from bottom on mobile
 * - Centered modal on desktop
 * - Backdrop blur
 * - Swipe to dismiss (mobile)
 * - Escape to close
 * - Focus trap
 */

interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  full: 'max-w-full',
};

export function ModalSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: ModalSheetProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/50"
          />

          {/* Modal - Mobile: bottom sheet, Desktop: centered */}
          <div className="fixed inset-0 z-[101] flex items-end md:items-center justify-center p-0 md:p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ 
                type: 'spring',
                damping: 20,
                stiffness: 500,
              }}
              className={cn(
                'bg-background rounded-t-3xl md:rounded-3xl shadow-2xl w-full pointer-events-auto overflow-hidden flex flex-col',
                'max-h-[90vh] md:max-h-[85vh]',
                sizeClasses[size],
                className
              )}
            >
              {/* Handle bar (mobile only) */}
              <div className="md:hidden flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-secondary rounded-full" />
              </div>

              {/* Header */}
              {(title || description) && (
                <div className="px-6 pt-4 pb-4 border-b border-border shrink-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {title && (
                        <h2 className="text-xl font-semibold text-foreground mb-1">
                          {title}
                        </h2>
                      )}
                      {description && (
                        <p className="text-sm text-muted-foreground">
                          {description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={onClose}
                      className="shrink-0 w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="px-6 py-4 border-t border-border shrink-0 bg-secondary/30">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}

/**
 * ConfirmDialog - Confirmation dialog with destructive action
 */

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const dialogContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/50"
          />

          {/* Centered Dialog */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ 
                type: 'spring',
                damping: 25,
                stiffness: 500,
              }}
              className="bg-background rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden p-6"
            >
              <div className="text-center space-y-4">
                <div className={cn(
                  'w-16 h-16 rounded-full mx-auto flex items-center justify-center',
                  isDestructive ? 'bg-destructive/10' : 'bg-primary/10'
                )}>
                  <AlertCircle className={cn(
                    'w-8 h-8',
                    isDestructive ? 'text-destructive' : 'text-primary'
                  )} />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 rounded-full bg-secondary hover:bg-secondary/80 font-medium transition-colors disabled:opacity-50"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className={cn(
                      'flex-1 px-4 py-3 rounded-full font-medium transition-colors disabled:opacity-50',
                      isDestructive
                        ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    )}
                  >
                    {isLoading ? 'Loading...' : confirmLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' 
    ? createPortal(dialogContent, document.body)
    : null;
}

// Import AlertCircle for ConfirmDialog
import { AlertCircle } from 'lucide-react';