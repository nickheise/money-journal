import { motion } from 'motion/react';
import { Plus, Minus } from 'lucide-react';

interface TypeSegmentControlProps {
  value: 'income' | 'expense';
  onChange: (value: 'income' | 'expense') => void;
}

export function TypeSegmentControl({ value, onChange }: TypeSegmentControlProps) {
  const isIncome = value === 'income';

  return (
    <div className="relative inline-flex bg-secondary rounded-full p-1 gap-1 w-full">
      {/* Income Button */}
      <button
        type="button"
        onClick={() => onChange('income')}
        className="relative px-6 py-4 rounded-full transition-colors flex items-center gap-2 flex-1 justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border"
        style={{
          opacity: isIncome ? 1 : 0.4,
          scale: isIncome ? 1 : 0.9,
        }}
      >
        {/* Animated background with gradient */}
        {isIncome && (
          <motion.div
            layoutId="type-background"
            className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-lime-400 rounded-full"
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        )}
        
        <Plus
          className={`w-5 h-5 transition-colors relative z-10 ${
            isIncome ? 'text-white' : 'text-foreground'
          }`}
        />
        <span
          className={`font-medium transition-colors relative z-10 ${
            isIncome ? 'text-white' : 'text-foreground'
          }`}
        >
          Got Money
        </span>
      </button>

      {/* Expense Button */}
      <button
        type="button"
        onClick={() => onChange('expense')}
        className="relative px-6 py-4 rounded-full transition-colors flex items-center gap-2 flex-1 justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border"
        style={{
          opacity: !isIncome ? 1 : 0.4,
          scale: !isIncome ? 1 : 0.9,
        }}
      >
        {/* Animated background with gradient */}
        {!isIncome && (
          <motion.div
            layoutId="type-background"
            className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        )}
        
        <Minus
          className={`w-5 h-5 transition-colors relative z-10 ${
            !isIncome ? 'text-white' : 'text-foreground'
          }`}
        />
        <span
          className={`font-medium transition-colors relative z-10 ${
            !isIncome ? 'text-white' : 'text-foreground'
          }`}
        >
          Spent Money
        </span>
      </button>
    </div>
  );
}