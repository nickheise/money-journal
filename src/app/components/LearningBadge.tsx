import { BookOpen, Sparkles, Trophy } from 'lucide-react';
import { useLearning } from '../hooks/useLearning';
import { useTransactions } from '../contexts/TransactionsContext';

/**
 * Small badge showing current learning level
 * Can be placed in header or footer
 */
export function LearningBadge() {
  const { totalBalance, transactions } = useTransactions();
  const { currentLevel, stats } = useLearning(totalBalance, transactions?.length || 0);

  const levelConfig = {
    1: {
      icon: BookOpen,
      label: 'Learner',
      color: 'from-blue-500 to-cyan-500',
      emoji: '📚'
    },
    2: {
      icon: Sparkles,
      label: 'Builder',
      color: 'from-purple-500 to-pink-500',
      emoji: '🌟'
    },
    3: {
      icon: Trophy,
      label: 'Expert',
      color: 'from-green-500 to-emerald-500',
      emoji: '🎯'
    },
    4: {
      icon: Trophy,
      label: 'Master',
      color: 'from-amber-500 to-orange-500',
      emoji: '👑'
    }
  };

  const config = levelConfig[currentLevel as keyof typeof levelConfig];
  const Icon = config.icon;

  return (
    <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100">
      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
        <span className="text-xs">{config.emoji}</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-xs font-semibold text-foreground">Level {currentLevel}</span>
        <span className="text-[10px] text-muted-foreground">{config.label}</span>
      </div>
    </div>
  );
}