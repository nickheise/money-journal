// Multi-user storage with emoji password system

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

export interface User {
  id: string;
  name: string;
  emojiPassword: string[]; // Array of emoji
  transactions: Transaction[];
  goals: Goal[];
  createdAt: string;
}

export interface AppState {
  users: User[];
  currentUserId: string | null;
  adminPin?: string; // 4-digit PIN for parent access
}

const STORAGE_KEY = 'money_journal_users';

export const getAppState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  
  return {
    users: [],
    currentUserId: null,
  };
};

export const saveAppState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const createUser = (name: string, emojiPassword: string[]): User => {
  const state = getAppState();
  const newUser: User = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name,
    emojiPassword,
    transactions: [],
    goals: [],
    createdAt: new Date().toISOString(),
  };
  
  state.users.push(newUser);
  state.currentUserId = newUser.id;
  saveAppState(state);
  
  return newUser;
};

export const authenticateUser = (userId: string, emojiPassword: string[]): boolean => {
  const state = getAppState();
  const user = state.users.find(u => u.id === userId);
  
  if (!user) return false;
  
  if (user.emojiPassword.length !== emojiPassword.length) return false;
  
  return user.emojiPassword.every((emoji, index) => emoji === emojiPassword[index]);
};

export const switchUser = (userId: string): void => {
  const state = getAppState();
  if (state.users.find(u => u.id === userId)) {
    state.currentUserId = userId;
    saveAppState(state);
  }
};

export const getCurrentUser = (): User | null => {
  const state = getAppState();
  if (!state.currentUserId) return null;
  return state.users.find(u => u.id === state.currentUserId) || null;
};

export const getAllUsers = (): User[] => {
  const state = getAppState();
  return state.users;
};

export const updateUserData = (userId: string, updates: Partial<Pick<User, 'transactions' | 'goals'>>): void => {
  const state = getAppState();
  const userIndex = state.users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    state.users[userIndex] = { ...state.users[userIndex], ...updates };
    saveAppState(state);
  }
};

export const addTransaction = (userId: string, transaction: Omit<Transaction, 'id'>): Transaction => {
  const state = getAppState();
  const user = state.users.find(u => u.id === userId);
  
  if (!user) throw new Error('User not found');
  
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  };
  
  user.transactions.unshift(newTransaction);
  saveAppState(state);
  
  return newTransaction;
};

export const deleteTransaction = (userId: string, transactionId: string): void => {
  const state = getAppState();
  const user = state.users.find(u => u.id === userId);
  
  if (user) {
    user.transactions = user.transactions.filter(t => t.id !== transactionId);
    saveAppState(state);
  }
};

export const addGoal = (userId: string, goal: Omit<Goal, 'id'>): Goal => {
  const state = getAppState();
  const user = state.users.find(u => u.id === userId);
  
  if (!user) throw new Error('User not found');
  
  const newGoal: Goal = {
    ...goal,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  };
  
  user.goals.push(newGoal);
  saveAppState(state);
  
  return newGoal;
};

export const updateGoal = (userId: string, goalId: string, updates: Partial<Goal>): void => {
  const state = getAppState();
  const user = state.users.find(u => u.id === userId);
  
  if (user) {
    const goalIndex = user.goals.findIndex(g => g.id === goalId);
    if (goalIndex !== -1) {
      user.goals[goalIndex] = { ...user.goals[goalIndex], ...updates };
      saveAppState(state);
    }
  }
};

export const deleteGoal = (userId: string, goalId: string): void => {
  const state = getAppState();
  const user = state.users.find(u => u.id === userId);
  
  if (user) {
    user.goals = user.goals.filter(g => g.id !== goalId);
    saveAppState(state);
  }
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

// Admin/Parent functions
export const hasAdminPin = (): boolean => {
  const state = getAppState();
  return !!state.adminPin;
};

export const setAdminPin = (pin: string): void => {
  const state = getAppState();
  state.adminPin = pin;
  saveAppState(state);
};

export const authenticateAdmin = (pin: string): boolean => {
  const state = getAppState();
  return state.adminPin === pin;
};

export const resetUserPassword = (userId: string, newEmojiPassword: string[]): void => {
  const state = getAppState();
  const userIndex = state.users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    state.users[userIndex].emojiPassword = newEmojiPassword;
    saveAppState(state);
  }
};

export const updateUserName = (userId: string, newName: string): void => {
  const state = getAppState();
  const userIndex = state.users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    state.users[userIndex].name = newName;
    saveAppState(state);
  }
};

export const deleteUser = (userId: string): void => {
  const state = getAppState();
  state.users = state.users.filter(u => u.id !== userId);
  if (state.currentUserId === userId) {
    state.currentUserId = null;
  }
  saveAppState(state);
};