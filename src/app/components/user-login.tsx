import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, UserPlus, ArrowLeft, Check, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { EmojiPassword } from './emoji-password';
import { AdminPanel } from './admin-panel';
import { useAuth } from '../contexts/AuthContext';
import { User as UserType } from '../utils/validation';
import { spring, fadeInScale, modalContent } from '../utils/animation-config';

interface UserLoginProps {
  onLogin?: (userId: string) => void;
}

type Screen = 'select' | 'login' | 'create';

export function UserLogin({ onLogin }: UserLoginProps) {
  const { allUsers, login, createUser, authenticateUser } = useAuth();
  const [screen, setScreen] = useState<Screen>('select');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [emojiPassword, setEmojiPassword] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isCreatingPassword, setIsCreatingPassword] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user);
    setEmojiPassword([]);
    setError('');
    setScreen('login');
  };

  const handleEmojiSelect = async (emoji: string) => {
    if (screen === 'login') {
      // Login flow - check password as they type
      const newPassword = [...emojiPassword, emoji];
      setEmojiPassword(newPassword);

      if (selectedUser && newPassword.length === selectedUser.emojiPassword.length) {
        // Check if password matches
        const isAuthenticated = await authenticateUser(selectedUser.id, newPassword);
        if (isAuthenticated) {
          await login(selectedUser.id);
        } else {
          setError('Wrong pattern! Try again');
          setTimeout(() => {
            setEmojiPassword([]);
            setError('');
          }, 1500);
        }
      }
    } else if (screen === 'create') {
      // Create flow - just build the password
      setEmojiPassword([...emojiPassword, emoji]);
    }
  };

  const handleRemoveLastEmoji = () => {
    setEmojiPassword(emojiPassword.slice(0, -1));
  };

  const handleCreateUser = async () => {
    if (!newUserName.trim()) {
      setError('Please enter a name');
      return;
    }
    if (emojiPassword.length < 3) {
      setError('Password must be at least 3 emoji');
      return;
    }

    try {
      await createUser(newUserName, emojiPassword);
      // No need to call onLogin - createUser already sets the current user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
    }
  };

  const startCreateUser = () => {
    setScreen('create');
    setIsCreatingPassword(false);
    setNewUserName('');
    setEmojiPassword([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 flex items-center justify-center p-4">
      {/* Admin Access Button - Fixed in corner */}
      <button
        onClick={() => setShowAdminPanel(true)}
        className="fixed top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 flex items-center justify-center text-orange-600 transition-colors border border-orange-200 z-10"
        title="Parent Panel"
      >
        <Shield className="w-5 h-5" />
      </button>

      <motion.div
        {...fadeInScale}
        transition={spring.bouncy}
        className="bg-background rounded-3xl w-full max-w-md overflow-hidden border border-border"
      >
        {/* Select User Screen */}
        {screen === 'select' && (
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1>Money Journal</h1>
              <p className="text-sm text-muted-foreground">Choose your profile</p>
            </div>

            <div className="space-y-3">
              {allUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm mb-4">No users yet</p>
                  <Button onClick={startCreateUser} size="lg" className="rounded-full">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Your Profile
                  </Button>
                </div>
              ) : (
                <>
                  {allUsers.map((user) => (
                    <motion.button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-2xl flex items-center gap-4 transition-colors border border-border"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xl">
                        {user.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.emojiPassword.length} emoji pattern
                        </div>
                      </div>
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </motion.button>
                  ))}

                  <Button
                    onClick={startCreateUser}
                    variant="outline"
                    className="w-full h-14"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add New User
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Login Screen */}
        {screen === 'login' && selectedUser && (
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => {
                  setScreen('select');
                  setSelectedUser(null);
                  setEmojiPassword([]);
                  setError('');
                }}
                className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Welcome back</div>
                <h2>{selectedUser.name}</h2>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Enter your emoji pattern</Label>
              <EmojiPassword
                onSelect={handleEmojiSelect}
                selectedEmojis={emojiPassword}
                maxLength={selectedUser.emojiPassword.length}
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive text-center bg-destructive/10 rounded-lg p-3"
                >
                  {error}
                </motion.div>
              )}

              {emojiPassword.length > 0 && (
                <Button
                  onClick={handleRemoveLastEmoji}
                  variant="outline"
                  className="w-full"
                >
                  Remove Last Emoji
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Create User Screen */}
        {screen === 'create' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setScreen('select')}
                className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2>Create Profile</h2>
            </div>

            {!isCreatingPassword ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="userName">What's your name?</Label>
                  <Input
                    id="userName"
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-14 text-lg rounded-xl bg-input-background"
                    autoFocus
                  />
                </div>

                <Button
                  onClick={() => {
                    if (!newUserName.trim()) {
                      setError('Please enter a name');
                      return;
                    }
                    setIsCreatingPassword(true);
                    setError('');
                  }}
                  className="w-full h-14"
                >
                  Next: Create Password
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Create your emoji pattern</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose 3-6 emoji in order. Remember this pattern!
                  </p>
                </div>

                <EmojiPassword
                  onSelect={handleEmojiSelect}
                  selectedEmojis={emojiPassword}
                  maxLength={6}
                />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive text-center bg-destructive/10 rounded-lg p-3"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="flex gap-2">
                  {emojiPassword.length > 0 && (
                    <Button
                      onClick={handleRemoveLastEmoji}
                      variant="outline"
                      className="flex-1"
                    >
                      Remove Last
                    </Button>
                  )}
                  {emojiPassword.length >= 3 && (
                    <Button
                      onClick={handleCreateUser}
                      className="flex-1"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Create Profile
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin Panel */}
        {showAdminPanel && (
          <AdminPanel
            isOpen={showAdminPanel}
            onClose={() => setShowAdminPanel(false)}
            onUserDeleted={() => {
              // Refresh the user list after deletion
              setScreen('select');
              setSelectedUser(null);
            }}
          />
        )}
      </motion.div>
    </div>
  );
}