import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { User } from '../utils/validation';
import { getUserRepository } from '../repositories/RepositoryFactory';

// Get repository instance
const userRepository = getUserRepository();

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  allUsers: User[];
  login: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  createUser: (name: string, emojiPassword: string[]) => Promise<User>;
  authenticateUser: (userId: string, emojiPassword: string[]) => Promise<boolean>;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load current user on mount
   */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userId = userRepository.getCurrentUserId();
        if (userId) {
          const user = await userRepository.findById(userId);
          setCurrentUser(user);
        }
        
        // Load all users for user switching
        const users = await userRepository.findAll();
        setAllUsers(users);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (userId: string) => {
    try {
      await userRepository.setCurrentUserId(userId);
      const user = await userRepository.findById(userId);
      setCurrentUser(user);
      
      // Refresh all users list
      const users = await userRepository.findAll();
      setAllUsers(users);
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  }, []);

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    try {
      await userRepository.clearCurrentUserId();
      setCurrentUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    }
  }, []);

  /**
   * Switch to different user
   */
  const switchUser = useCallback(async (userId: string) => {
    await login(userId);
  }, [login]);

  /**
   * Refresh current user data
   */
  const refreshUser = useCallback(async () => {
    try {
      const userId = userRepository.getCurrentUserId();
      if (userId) {
        const user = await userRepository.findById(userId);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  }, []);

  /**
   * Create new user
   */
  const createUser = useCallback(async (name: string, emojiPassword: string[]): Promise<User> => {
    try {
      const newUser = await userRepository.create({ name, emojiPassword });
      setCurrentUser(newUser); // UserRepository already sets as current user
      
      // Refresh all users list
      const users = await userRepository.findAll();
      setAllUsers(users);
      
      return newUser;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }, []);

  /**
   * Authenticate user with password
   */
  const authenticateUser = useCallback(async (userId: string, emojiPassword: string[]): Promise<boolean> => {
    try {
      return await userRepository.authenticate(userId, emojiPassword);
    } catch (error) {
      console.error('Failed to authenticate:', error);
      return false;
    }
  }, []);

  const value = useMemo(() => ({
    currentUser,
    isAuthenticated: currentUser !== null,
    isLoading,
    allUsers,
    login,
    logout,
    switchUser,
    refreshUser,
    createUser,
    authenticateUser,
    getAllUsers: () => allUsers,
  }), [currentUser, isLoading, allUsers, login, logout, switchUser, refreshUser, createUser, authenticateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth - Hook to access authentication state and methods
 * 
 * @throws Error if used outside AuthProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { currentUser, logout, isLoading } = useAuth();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!currentUser) return <div>Please log in</div>;
 *   
 *   return (
 *     <div>
 *       <p>Hello, {currentUser.name}!</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}