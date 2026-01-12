import { useState } from 'react';
import { LearningCard } from './LearningCard';
import { LEARNING_CARDS } from '../utils/learning-content';

/**
 * Demo component to preview learning cards
 * Useful for testing and content review
 */
export function LearningDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);

  const currentCard = LEARNING_CARDS[currentIndex];

  const handleAcknowledge = (response?: any) => {
    setResponses([...responses, { cardId: currentCard.id, response }]);
    if (currentIndex < LEARNING_CARDS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDismiss = () => {
    if (currentIndex < LEARNING_CARDS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Learning Card Demo</h2>
            <p className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {LEARNING_CARDS.length} • Level {currentCard.level}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentIndex((currentIndex + 1) % LEARNING_CARDS.length)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
            >
              Skip →
            </button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mb-2">
          Responses logged: {responses.length}
        </div>
      </div>

      <LearningCard
        card={currentCard}
        onAcknowledge={handleAcknowledge}
        onDismiss={handleDismiss}
      />
    </div>
  );
}
