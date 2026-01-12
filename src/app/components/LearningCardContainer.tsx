import { AnimatePresence } from 'motion/react';
import { LearningCard } from './LearningCard';
import { useLearning } from '../hooks/useLearning';

interface LearningCardContainerProps {
  totalBalance: number;
  transactionCount: number;
  placement?: 'dashboard' | 'inline' | 'floating';
}

/**
 * Container that manages when and where to show learning cards
 * Can be placed in different locations with different styles
 */
export function LearningCardContainer({ 
  totalBalance, 
  transactionCount,
  placement = 'dashboard'
}: LearningCardContainerProps) {
  const {
    currentCard,
    isVisible,
    handleAcknowledge,
    handleDismiss
  } = useLearning(totalBalance, transactionCount);

  // Different placements have different container styles
  const containerClasses = {
    dashboard: 'mb-6', // Normal spacing for dashboard
    inline: 'my-4', // For inline in transaction list
    floating: 'fixed bottom-6 left-4 right-4 z-50 max-w-md mx-auto md:left-auto md:right-6' // Floating card
  };

  return (
    <div className={containerClasses[placement]}>
      <AnimatePresence mode="wait">
        {isVisible && currentCard && (
          <LearningCard
            key={currentCard.id}
            card={currentCard}
            onAcknowledge={handleAcknowledge}
            onDismiss={handleDismiss}
          />
        )}
      </AnimatePresence>
    </div>
  );
}