import { motion } from 'motion/react';
import { RollingNumber } from '../rolling-number';
import { spring } from '../../utils/animation-config';

/**
 * BalanceCard - Displays total balance with gradient background
 * 
 * Pure presentation component - no business logic
 */

interface BalanceCardProps {
  balance: number;
  isLoading?: boolean;
}

export function BalanceCard({ 
  balance, 
  isLoading = false 
}: BalanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="bg-gradient-to-br from-blue-500 via-purple-500 via-pink-500 to-orange-500 rounded-3xl p-8 text-white relative overflow-hidden"
    >
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="text-sm opacity-90 mb-2">Total Money</div>
        <div className="text-5xl tracking-tight">
          {isLoading ? (
            <div className="h-12 w-32 bg-white/20 rounded-lg animate-pulse" />
          ) : (
            <RollingNumber value={balance} className="text-5xl" />
          )}
        </div>
      </div>
    </motion.div>
  );
}