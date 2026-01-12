import { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, Sparkles, Target, Brain, Lightbulb, Trophy, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LearningCard as LearningCardType, InteractionType } from '../utils/learning-content';
import { spring } from '../utils/animation-config';

interface LearningCardProps {
  card: LearningCardType;
  onAcknowledge: (response?: any) => void;
  onDismiss: () => void;
}

const typeIcons = {
  tip: Lightbulb,
  scenario: BookOpen,
  quiz: Brain,
  funfact: Sparkles,
  reflection: Target,
  challenge: Target,
  celebration: Trophy
};

const typeColors = {
  tip: 'from-blue-500 to-cyan-500',
  scenario: 'from-purple-500 to-pink-500',
  quiz: 'from-green-500 to-emerald-500',
  funfact: 'from-yellow-500 to-orange-500',
  reflection: 'from-indigo-500 to-blue-500',
  challenge: 'from-pink-500 to-rose-500',
  celebration: 'from-amber-500 to-yellow-500'
};

const typeLabels = {
  tip: 'Money Tip',
  scenario: 'Scenario',
  quiz: 'Quiz',
  funfact: 'Fun Fact',
  reflection: 'Think About It',
  challenge: 'Challenge',
  celebration: 'Celebration'
};

export function LearningCard({ card, onAcknowledge, onDismiss }: LearningCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const Icon = typeIcons[card.type];
  const colorClass = typeColors[card.type];
  const typeLabel = typeLabels[card.type];

  const handleInteraction = (response?: any) => {
    setHasInteracted(true);
    
    // For quiz type, show explanation first
    if (card.type === 'quiz' && card.interactionData?.explanation) {
      setShowExplanation(true);
      // Don't acknowledge immediately - let user read explanation
    } else {
      onAcknowledge(response);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    handleInteraction(answerIndex);
  };

  const handleExplanationContinue = () => {
    onAcknowledge(selectedAnswer);
  };

  const renderInteraction = () => {
    // Show explanation for quiz after answering
    if (showExplanation && card.interactionData?.explanation) {
      const isCorrect = selectedAnswer === card.interactionData.correctAnswer;
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-green-50' : 'bg-blue-50'}`}
        >
          <div className={`text-sm mb-3 ${isCorrect ? 'text-green-900' : 'text-blue-900'}`}>
            {isCorrect ? '✅ Correct!' : '💡 Good try!'}
          </div>
          <div className={`text-sm mb-4 ${isCorrect ? 'text-green-800' : 'text-blue-800'}`}>
            {card.interactionData.explanation}
          </div>
          <button
            onClick={handleExplanationContinue}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-orange-500 text-white rounded-full font-medium hover:shadow-lg transition-shadow"
          >
            Got it! 👍
          </button>
        </motion.div>
      );
    }

    switch (card.interactionType) {
      case 'thumbs':
        return (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => handleInteraction('up')}
              className="flex-1 py-3 px-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ThumbsUp className="w-5 h-5" />
              Got it!
            </button>
            <button
              onClick={() => handleInteraction('down')}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ThumbsDown className="w-5 h-5" />
              Not sure
            </button>
          </div>
        );

      case 'emoji':
        return (
          <div className="mt-4 space-y-3">
            {card.interactionData?.question && (
              <div className="text-sm font-medium text-foreground/70 mb-2">
                {card.interactionData.question}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {card.interactionData?.emojiOptions?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleInteraction(option)}
                  className="py-2.5 px-4 bg-white hover:bg-gray-50 rounded-full font-medium transition-colors border-2 border-gray-200 hover:border-purple-300 text-sm"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="mt-4 space-y-3">
            {card.interactionData?.question && (
              <div className="text-sm font-medium text-foreground/70 mb-3">
                {card.interactionData.question}
              </div>
            )}
            <div className="space-y-2">
              {card.interactionData?.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => card.type === 'quiz' ? handleQuizAnswer(index) : handleInteraction(index)}
                  disabled={hasInteracted && card.type === 'quiz'}
                  className={`w-full py-3 px-4 text-left rounded-xl font-medium transition-all ${
                    selectedAnswer === index && card.type === 'quiz'
                      ? 'bg-purple-100 border-2 border-purple-400 text-purple-900'
                      : 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-purple-300'
                  } ${hasInteracted && card.type === 'quiz' ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>
            {!card.interactionData?.explanation && selectedAnswer !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-center text-muted-foreground mt-3"
              >
                {card.interactionData?.explanation || 'Great choice!'}
              </motion.div>
            )}
          </div>
        );

      case 'yes-no':
        return (
          <div className="mt-4 space-y-3">
            {card.interactionData?.question && (
              <div className="text-sm font-medium text-foreground/70 mb-2">
                {card.interactionData.question}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => handleInteraction('yes')}
                className="flex-1 py-3 px-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-2xl font-medium transition-colors"
              >
                ✅ Yes
              </button>
              <button
                onClick={() => handleInteraction('no')}
                className="flex-1 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-2xl font-medium transition-colors"
              >
                ❌ No
              </button>
            </div>
          </div>
        );

      case 'slider':
        return (
          <div className="mt-4">
            {card.interactionData?.question && (
              <div className="text-sm font-medium text-foreground/70 mb-3">
                {card.interactionData.question}
              </div>
            )}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="50"
                onChange={(e) => handleInteraction(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{card.interactionData?.sliderLabels?.min || 'Not at all'}</span>
                <span>{card.interactionData?.sliderLabels?.max || 'Very much'}</span>
              </div>
            </div>
          </div>
        );

      case 'swipe':
        return (
          <div className="mt-4">
            <button
              onClick={() => handleInteraction('swiped')}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-orange-500 text-white rounded-full font-medium hover:shadow-lg transition-shadow"
            >
              Got it! 👍
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={spring}
      className="bg-white rounded-2xl p-5 border border-gray-100 relative overflow-hidden"
    >
      {/* Gradient accent bar at top - clean implementation */}
      <div 
        className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${colorClass}`}
      />
      
      {/* Close button */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3 pr-6">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-1">
            {typeLabel} • Level {card.level}
          </div>
          <h3 className="font-semibold text-base leading-tight">{card.title}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="text-sm text-foreground/80 leading-relaxed mb-3">
        {card.content}
      </div>

      {/* Interaction */}
      {renderInteraction()}

      {/* Level indicator dots */}
      <div className="flex gap-1 mt-3 justify-center">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`w-1 h-1 rounded-full ${
              level <= card.level ? 'bg-purple-400' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}