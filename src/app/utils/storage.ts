// Offline-first data storage using localStorage

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  location: 'wallet' | 'bank' | 'jar' | 'other';
  description: string;
  date: string;
  category?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  emoji?: string;
}

export interface AppData {
  transactions: Transaction[];
  goals: Goal[];
  userName: string;
}

const STORAGE_KEY = 'money_journal_data';

export const getStorageData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  
  // Default data
  return {
    transactions: [],
    goals: [],
    userName: '',
  };
};

export const saveStorageData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const addTransaction = (transaction: Omit<Transaction, 'id'>): Transaction => {
  const data = getStorageData();
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  };
  data.transactions.unshift(newTransaction);
  saveStorageData(data);
  return newTransaction;
};

export const deleteTransaction = (id: string): void => {
  const data = getStorageData();
  data.transactions = data.transactions.filter(t => t.id !== id);
  saveStorageData(data);
};

export const addGoal = (goal: Omit<Goal, 'id'>): Goal => {
  const data = getStorageData();
  const newGoal: Goal = {
    ...goal,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  };
  data.goals.push(newGoal);
  saveStorageData(data);
  return newGoal;
};

export const updateGoal = (id: string, updates: Partial<Goal>): void => {
  const data = getStorageData();
  const goalIndex = data.goals.findIndex(g => g.id === id);
  if (goalIndex !== -1) {
    data.goals[goalIndex] = { ...data.goals[goalIndex], ...updates };
    saveStorageData(data);
  }
};

export const deleteGoal = (id: string): void => {
  const data = getStorageData();
  data.goals = data.goals.filter(g => g.id !== id);
  saveStorageData(data);
};

export const updateUserName = (name: string): void => {
  const data = getStorageData();
  data.userName = name;
  saveStorageData(data);
};

export const getTotalBalance = (transactions: Transaction[]): number => {
  return transactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);
};

export const getBalanceByLocation = (transactions: Transaction[]): Record<string, number> => {
  const balances: Record<string, number> = {
    wallet: 0,
    bank: 0,
    jar: 0,
    other: 0,
  };
  
  transactions.forEach(t => {
    if (t.type === 'income') {
      balances[t.location] += t.amount;
    } else {
      balances[t.location] -= t.amount;
    }
  });
  
  return balances;
};
