import { useState, useEffect, useCallback } from 'react';
import {
  UserProgress,
  LearningCard,
  initializeUserProgress,
  getNextCard,
  markCardAsShown,
  markCardAsAcknowledged,
  markCardAsDismissed,
  calculateUserLevel
} from '../utils/learning-content';

const STORAGE_KEY = 'moneyjournal_learning_progress';
const FIRST_USE_KEY = 'moneyjournal_first_use_date';

/**
 * Hook to manage learning card system
 * Handles:
 * - Loading/saving user progress
 * - Determining which card to show
 * - Tracking interactions
 * - Progressive disclosure
 */
export function useLearning(totalBalance: number, transactionCount: number) {
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    // Load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse learning progress:', e);
        return initializeUserProgress();
      }
    }
    return initializeUserProgress();
  });

  const [currentCard, setCurrentCard] = useState<LearningCard | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Calculate days since first use
  const daysSinceFirstUse = useCallback(() => {
    const firstUseDate = localStorage.getItem(FIRST_USE_KEY);
    if (!firstUseDate) {
      const now = Date.now();
      localStorage.setItem(FIRST_USE_KEY, now.toString());
      return 0;
    }
    const days = (Date.now() - parseInt(firstUseDate)) / (1000 * 60 * 60 * 24);
    return Math.floor(days);
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
  }, [userProgress]);

  // Determine and show next card
  const showNextCard = useCallback(() => {
    const nextCard = getNextCard(
      userProgress,
      totalBalance,
      transactionCount,
      daysSinceFirstUse()
    );

    if (nextCard) {
      setCurrentCard(nextCard);
      setIsVisible(true);
      
      // Mark as shown
      setUserProgress(prev => markCardAsShown(prev, nextCard.id));
    }
  }, [userProgress, totalBalance, transactionCount, daysSinceFirstUse]);

  // Check for new card on balance/transaction changes
  useEffect(() => {
    // Only check if no card is currently showing
    if (!isVisible && !currentCard) {
      // Small delay to not interrupt user actions
      const timer = setTimeout(() => {
        showNextCard();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [totalBalance, transactionCount, isVisible, currentCard, showNextCard]);

  // Handle user acknowledging a card
  const handleAcknowledge = useCallback((response?: any) => {
    if (!currentCard) return;

    setUserProgress(prev => 
      markCardAsAcknowledged(prev, currentCard.id, currentCard.interactionType, response)
    );

    // Hide card with animation
    setIsVisible(false);
    setTimeout(() => {
      setCurrentCard(null);
    }, 300);
  }, [currentCard]);

  // Handle user dismissing a card
  const handleDismiss = useCallback(() => {
    if (!currentCard) return;

    setUserProgress(prev => 
      markCardAsDismissed(prev, currentCard.id)
    );

    // Hide card with animation
    setIsVisible(false);
    setTimeout(() => {
      setCurrentCard(null);
    }, 300);
  }, [currentCard]);

  // Get current level
  const currentLevel = calculateUserLevel(
    totalBalance,
    transactionCount,
    daysSinceFirstUse()
  );

  // Check if level changed and update progress
  useEffect(() => {
    if (currentLevel !== userProgress.currentLevel) {
      setUserProgress(prev => ({
        ...prev,
        currentLevel,
        levelUnlockedDates: {
          ...prev.levelUnlockedDates,
          [currentLevel]: Date.now()
        }
      }));
    }
  }, [currentLevel, userProgress.currentLevel]);

  // Manual trigger to show next card (for testing or explicit "show tip" button)
  const manualShowNext = useCallback(() => {
    showNextCard();
  }, [showNextCard]);

  return {
    currentCard,
    isVisible,
    currentLevel,
    userProgress,
    handleAcknowledge,
    handleDismiss,
    manualShowNext,
    // Stats for debugging/display
    stats: {
      cardsShown: userProgress.seenCardIds.length,
      cardsAcknowledged: userProgress.acknowledgedCardIds.length,
      cardsDismissed: userProgress.dismissedCardIds.length,
      currentLevel
    }
  };
}
