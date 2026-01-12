import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Trophy, TrendingUp, Sparkles, Brain } from 'lucide-react';
import { useLearning } from '../hooks/useLearning';
import { useTransactions } from '../contexts/TransactionsContext';
import { LearningCard } from './LearningCard';
import { getCardsForLevel, LEARNING_CARDS, calculateUserLevel } from '../utils/learning-content';
import { spring } from '../utils/animation-config';

/**
 * Learning Hub - Browse all learning content
 * Shows progress and allows kids to review concepts
 */
export function LearningHub() {
  const { totalBalance, transactions } = useTransactions();
  const { 
    currentLevel, 
    userProgress, 
    handleAcknowledge, 
    handleDismiss,
    stats
  } = useLearning(totalBalance, transactions?.length || 0);
  
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'completed'>('all');

  const availableCards = useMemo(() => {
    const cards = getCardsForLevel(currentLevel);
    
    // Filter out celebration cards from browsing
    return cards.filter(card => card.type !== 'celebration');
  }, [currentLevel]);

  const filteredCards = useMemo(() => {
    switch (filter) {
      case 'new':
        return availableCards.filter(
          card => !userProgress.seenCardIds.includes(card.id)
        );
      case 'completed':
        return availableCards.filter(
          card => userProgress.acknowledgedCardIds.includes(card.id)
        );
      default:
        return availableCards;
    }
  }, [filter, availableCards, userProgress]);

  const levelInfo = {
    1: { 
      title: 'Foundation', 
      description: 'Learning the basics of money',
      color: 'from-blue-500 to-cyan-500',
      icon: BookOpen,
      range: '$0 - $100'
    },
    2: { 
      title: 'Building Blocks', 
      description: 'Setting goals and making choices',
      color: 'from-purple-500 to-pink-500',
      icon: TrendingUp,
      range: '$100 - $500'
    },
    3: { 
      title: 'Growing Knowledge', 
      description: 'Understanding how money grows',
      color: 'from-green-500 to-emerald-500',
      icon: Brain,
      range: '$500 - $1,500'
    },
    4: { 
      title: 'Advanced Concepts', 
      description: 'Planning for the future',
      color: 'from-amber-500 to-orange-500',
      icon: Sparkles,
      range: '$1,500+'
    }
  };

  const currentLevelInfo = levelInfo[currentLevel as keyof typeof levelInfo];
  const LevelIcon = currentLevelInfo.icon;

  const progressPercent = (stats.cardsAcknowledged / availableCards.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="bg-white rounded-3xl p-6 shadow-sm"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentLevelInfo.color} flex items-center justify-center flex-shrink-0`}>
            <LevelIcon className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold mb-1">Money Learning</h1>
            <p className="text-muted-foreground">
              You're at Level {currentLevel}: {currentLevelInfo.title}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {currentLevelInfo.description} • {currentLevelInfo.range}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Progress</span>
            <span className="font-medium">
              {stats.cardsAcknowledged} of {availableCards.length} completed
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${currentLevelInfo.color}`}
            />
          </div>
        </div>

        {/* Level Badges */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3, 4].map((level) => {
            const info = levelInfo[level as keyof typeof levelInfo];
            const Icon = info.icon;
            const isUnlocked = level <= currentLevel;
            
            return (
              <div
                key={level}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${
                  isUnlocked 
                    ? 'bg-gradient-to-br ' + info.color + ' text-white' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <div className="text-xs font-medium text-center leading-tight">
                  Level {level}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            filter === 'all'
              ? 'bg-gradient-to-br from-blue-500 via-purple-500 via-pink-500 to-orange-500 text-white'
              : 'bg-white text-foreground hover:bg-gray-50'
          }`}
        >
          All ({availableCards.length})
        </button>
        <button
          onClick={() => setFilter('new')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            filter === 'new'
              ? 'bg-gradient-to-br from-blue-500 via-purple-500 via-pink-500 to-orange-500 text-white'
              : 'bg-white text-foreground hover:bg-gray-50'
          }`}
        >
          New ({availableCards.length - stats.cardsAcknowledged})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            filter === 'completed'
              ? 'bg-gradient-to-br from-blue-500 via-purple-500 via-pink-500 to-orange-500 text-white'
              : 'bg-white text-foreground hover:bg-gray-50'
          }`}
        >
          Completed ({stats.cardsAcknowledged})
        </button>
      </div>

      {/* Card Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredCards.map((card, index) => {
          const isCompleted = userProgress.acknowledgedCardIds.includes(card.id);
          const isNew = !userProgress.seenCardIds.includes(card.id);
          
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: index * 0.05 }}
            >
              {selectedCard === card.id ? (
                <LearningCard
                  card={card}
                  onAcknowledge={(response) => {
                    handleAcknowledge(response);
                    setSelectedCard(null);
                  }}
                  onDismiss={() => setSelectedCard(null)}
                />
              ) : (
                <button
                  onClick={() => setSelectedCard(card.id)}
                  className="w-full text-left bg-white rounded-2xl p-5 hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {/* Status badges */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {isNew && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        New
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        ✓ Done
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-3 pr-16">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                      {
                        tip: 'from-blue-500 to-cyan-500',
                        scenario: 'from-purple-500 to-pink-500',
                        quiz: 'from-green-500 to-emerald-500',
                        funfact: 'from-yellow-500 to-orange-500',
                        reflection: 'from-indigo-500 to-blue-500',
                        challenge: 'from-pink-500 to-rose-500',
                        celebration: 'from-amber-500 to-yellow-500'
                      }[card.type]
                    } flex items-center justify-center flex-shrink-0`}>
                      {card.type === 'tip' && '💡'}
                      {card.type === 'scenario' && '📖'}
                      {card.type === 'quiz' && '🧠'}
                      {card.type === 'funfact' && '✨'}
                      {card.type === 'reflection' && '💭'}
                      {card.type === 'challenge' && '🎯'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 line-clamp-2">
                        {card.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {card.content}
                      </p>
                    </div>
                  </div>
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCards.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {filter === 'completed' 
              ? 'No cards completed yet' 
              : 'All caught up!'}
          </h3>
          <p className="text-muted-foreground">
            {filter === 'completed'
              ? 'Complete learning cards to see them here'
              : 'You\'ve seen all the cards at your level'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
