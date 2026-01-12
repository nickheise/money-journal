import { useTransactions } from '../contexts/TransactionsContext';
import { BalanceCard } from './presentation/BalanceCard';
import { LocationCards } from './presentation/LocationCards';
import { ErrorDisplay } from './ui/error-display';
import { LearningCardContainer } from './LearningCardContainer';

/**
 * Dashboard - Container component for dashboard view
 * 
 * This is a "smart" component that:
 * - Connects to state (contexts)
 * - Handles errors and loading states
 * - Delegates rendering to presentation components
 */

export function Dashboard() {
  const { 
    totalBalance, 
    balanceByLocation, 
    isLoading,
    transactions
  } = useTransactions();

  return (
    <div className="space-y-8">
      {/* Total Balance */}
      <BalanceCard
        balance={totalBalance}
        isLoading={isLoading}
      />

      {/* Location Cards */}
      <LocationCards
        balanceByLocation={balanceByLocation}
        isLoading={isLoading}
      />

      {/* Learning Card - shows contextual financial education */}
      <LearningCardContainer
        totalBalance={totalBalance}
        transactionCount={transactions?.length || 0}
        placement="dashboard"
      />
    </div>
  );
}