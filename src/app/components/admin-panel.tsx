import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, X, Eye, EyeOff, Trash2, Key, Edit2, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Modal } from './ui/modal';
import { Input } from './ui/input';
import { EmojiPassword } from './emoji-password';
import {
  User,
  getAllUsers,
  getTotalBalance,
  resetUserPassword,
  updateUserName,
  deleteUser,
  hasAdminPin,
  setAdminPin,
  authenticateAdmin,
} from '../utils/user-storage';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUserDeleted?: () => void;
}

export function AdminPanel({ isOpen, onClose, onUserDeleted }: AdminPanelProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [setupMode, setSetupMode] = useState(!hasAdminPin());
  const [confirmPin, setConfirmPin] = useState('');

  // User management states
  const [users, setUsers] = useState<User[]>(getAllUsers());
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [resettingPasswordUserId, setResettingPasswordUserId] = useState<string | null>(null);
  const [newEmojiPassword, setNewEmojiPassword] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (setupMode) {
      if (pin.length !== 4) {
        setError('PIN must be 4 digits');
        return;
      }
      if (pin !== confirmPin) {
        setError('PINs do not match');
        return;
      }
      setAdminPin(pin);
      setSetupMode(false);
      setAuthenticated(true);
      setPin('');
      setConfirmPin('');
      setError('');
    } else {
      if (authenticateAdmin(pin)) {
        setAuthenticated(true);
        setPin('');
        setError('');
      } else {
        setError('Incorrect PIN');
        setTimeout(() => setError(''), 2000);
        setPin('');
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (newEmojiPassword.length < 6) {
      setNewEmojiPassword([...newEmojiPassword, emoji]);
    }
  };

  const handleRemoveLastEmoji = () => {
    setNewEmojiPassword(newEmojiPassword.slice(0, -1));
  };

  const handleResetPassword = (userId: string) => {
    if (newEmojiPassword.length < 3) {
      setError('Password must be at least 3 emojis');
      setTimeout(() => setError(''), 2000);
      return;
    }
    resetUserPassword(userId, newEmojiPassword);
    setResettingPasswordUserId(null);
    setNewEmojiPassword([]);
    setUsers(getAllUsers());
  };

  const handleUpdateName = (userId: string) => {
    if (editingName.trim()) {
      updateUserName(userId, editingName.trim());
      setEditingUserId(null);
      setEditingName('');
      setUsers(getAllUsers());
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}'s account? This cannot be undone.`)) {
      deleteUser(userId);
      setUsers(getAllUsers());
      if (onUserDeleted) onUserDeleted();
    }
  };

  const handleClose = () => {
    setAuthenticated(false);
    setPin('');
    setConfirmPin('');
    setError('');
    setEditingUserId(null);
    setResettingPasswordUserId(null);
    setNewEmojiPassword([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      className="w-full max-w-2xl max-h-[90vh]"
      closeOnOverlayClick={false}
    >
      <div className="bg-background rounded-3xl w-full overflow-hidden border border-border flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg">Parent Panel</h2>
              <p className="text-sm text-muted-foreground">Manage accounts & passwords</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!authenticated ? (
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg">{setupMode ? 'Set Up Parent PIN' : 'Enter Parent PIN'}</h3>
                <p className="text-sm text-muted-foreground">
                  {setupMode
                    ? 'Create a 4-digit PIN to protect parent settings'
                    : 'Enter your 4-digit PIN to access parent controls'}
                </p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    {setupMode ? 'Create PIN' : 'PIN'}
                  </label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest h-14 rounded-2xl"
                    placeholder="••••"
                    autoFocus
                  />
                </div>

                {setupMode && (
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Confirm PIN</label>
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      className="text-center text-2xl tracking-widest h-14 rounded-2xl"
                      placeholder="••••"
                    />
                  </div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive text-center bg-destructive/10 rounded-lg p-3"
                  >
                    {error}
                  </motion.div>
                )}

                <Button type="submit" className="w-full h-12">
                  {setupMode ? 'Create PIN' : 'Unlock'}
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {users.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No user accounts yet
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => {
                    const balance = getTotalBalance(user.transactions);
                    const isEditing = editingUserId === user.id;
                    const isResettingPassword = resettingPasswordUserId === user.id;

                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-border rounded-2xl p-6 space-y-4"
                      >
                        {/* User Header */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white flex-shrink-0">
                            {user.name[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  className="h-9 rounded-xl"
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateName(user.id)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingUserId(null);
                                    setEditingName('');
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{user.name}</h3>
                                <button
                                  onClick={() => {
                                    setEditingUserId(user.id);
                                    setEditingName(user.name);
                                  }}
                                  className="w-6 h-6 rounded-md hover:bg-secondary flex items-center justify-center transition-colors"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            <div className="text-sm text-muted-foreground">
                              Balance: ${balance.toFixed(2)} • {user.transactions.length} items
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Created {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Password Info */}
                        {!isResettingPassword && (
                          <div className="bg-secondary/50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Emoji Password</span>
                              <button
                                onClick={() => setShowPassword({ ...showPassword, [user.id]: !showPassword[user.id] })}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showPassword[user.id] ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <div className="flex gap-2 items-center flex-wrap">
                              {user.emojiPassword.map((emoji, index) => (
                                <div
                                  key={index}
                                  className="w-10 h-10 bg-background rounded-lg flex items-center justify-center text-xl border border-border"
                                >
                                  {showPassword[user.id] ? emoji : '•'}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Password Reset Form */}
                        {isResettingPassword && (
                          <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                              <p className="text-sm font-medium mb-2">Create New Password</p>
                              <EmojiPassword
                                onSelect={handleEmojiSelect}
                                selectedEmojis={newEmojiPassword}
                                maxLength={6}
                              />
                              {newEmojiPassword.length > 0 && (
                                <Button
                                  onClick={handleRemoveLastEmoji}
                                  variant="outline"
                                  size="sm"
                                  className="w-full mt-3"
                                >
                                  Remove Last Emoji
                                </Button>
                              )}
                              {error && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-sm text-destructive mt-2"
                                >
                                  {error}
                                </motion.div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleResetPassword(user.id)}
                                disabled={newEmojiPassword.length < 3}
                                className="flex-1"
                              >
                                Save New Password
                              </Button>
                              <Button
                                onClick={() => {
                                  setResettingPasswordUserId(null);
                                  setNewEmojiPassword([]);
                                  setError('');
                                }}
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        {!isResettingPassword && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setResettingPasswordUserId(user.id)}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Key className="w-4 h-4 mr-2" />
                              Reset Password
                            </Button>
                            <Button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}