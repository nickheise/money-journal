import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { dialog } from '../../utils/animation-config';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  /**
   * Whether clicking the overlay should close the modal
   * @default true
   */
  closeOnOverlayClick?: boolean;
  /**
   * Custom animation configuration for the content
   */
  contentAnimation?: typeof dialog.content;
  /**
   * Custom animation configuration for the backdrop
   */
  backdropAnimation?: typeof dialog.backdrop;
}

/**
 * Modal Component - Centralized modal implementation with portal rendering
 * 
 * Features:
 * - Renders at document.body level using React portals
 * - Properly centered vertically and horizontally
 * - Consistent z-index hierarchy (overlay: z-[100], content: z-[101])
 * - Prevents body scroll when open
 * - Smooth animations with elastic bounce
 * - Accessible focus management
 * 
 * Usage:
 * <Modal isOpen={isOpen} onClose={handleClose}>
 *   <div className="bg-background rounded-3xl p-6">
 *     Your content here
 *   </div>
 * </Modal>
 */
export function Modal({
  isOpen,
  onClose,
  children,
  className = '',
  closeOnOverlayClick = true,
  contentAnimation = dialog.content,
  backdropAnimation = dialog.backdrop,
}: ModalProps) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Prevent body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore body scroll
        document.body.style.overflow = originalOverflow;

        // Restore focus to previously focused element
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen]);

  // Handle escape key
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

  if (typeof window === 'undefined') {
    return null;
  }

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={backdropAnimation.initial}
            animate={backdropAnimation.animate}
            exit={backdropAnimation.exit}
            transition={backdropAnimation.transition}
            className="fixed inset-0 z-[100] bg-black/50"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />

          {/* Content Container - z-[101] to be above overlay */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={contentAnimation.initial}
              animate={contentAnimation.animate}
              exit={contentAnimation.exit}
              transition={contentAnimation.transition}
              onClick={(e) => e.stopPropagation()}
              className={`pointer-events-auto ${className}`}
              role="dialog"
              aria-modal="true"
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}