import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, User, Lock, X, Shield, Download, Upload, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Modal } from './ui/modal';
import { AdminPanel } from './admin-panel';
import { User as UserType } from '../utils/validation';
import { useAuth } from '../contexts/AuthContext';
import { EmojiPassword } from './emoji-password';
import { UserAvatar } from './ui/user-avatar';
import { DialogHeader } from './ui/dialog-header';
import { ErrorDisplay } from './ui/error-display';
import { spring, modalBackdrop, modalContent } from '../utils/animation-config';
import { 
  exportUserData, 
  downloadExport, 
  generateExportFilename, 
  validateImportData, 
  mergeImportData 
} from '../utils/export-import';

interface UserSwitcherProps {
  currentUser: UserType;
  onSwitch: (userId: string) => void;
  onLogout: () => void;
}

export function UserSwitcher({ currentUser, onSwitch, onLogout }: UserSwitcherProps) {
  const { allUsers, authenticateUser, switchUser: switchUserContext, createUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [emojiPassword, setEmojiPassword] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [isCreatingPassword, setIsCreatingPassword] = useState(false);

  const users = allUsers.filter(u => u.id !== currentUser.id);

  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user);
    setEmojiPassword([]);
    setError('');
    setImportSuccess(null);
  };

  const handleEmojiSelect = async (emoji: string) => {
    if (showCreateUser) {
      // Create user flow - just build the password
      if (emojiPassword.length < 6) {
        setEmojiPassword([...emojiPassword, emoji]);
      }
      return;
    }

    if (!selectedUser) return;

    const newPassword = [...emojiPassword, emoji];
    setEmojiPassword(newPassword);

    if (newPassword.length === selectedUser.emojiPassword.length) {
      const isAuthenticated = await authenticateUser(selectedUser.id, newPassword);
      if (isAuthenticated) {
        await switchUserContext(selectedUser.id);
        onSwitch(selectedUser.id);
        setIsOpen(false);
        setSelectedUser(null);
        setEmojiPassword([]);
        setImportSuccess(null);
      } else {
        setError('Wrong pattern! Try again');
        setTimeout(() => {
          setEmojiPassword([]);
          setError('');
        }, 1500);
      }
    }
  };

  const handleRemoveLastEmoji = () => {
    setEmojiPassword(emojiPassword.slice(0, -1));
  };

  const handleExport = () => {
    try {
      const exportData = exportUserData(currentUser);
      const filename = generateExportFilename(currentUser.name);
      downloadExport(exportData, filename);
      setImportSuccess('✓ Data exported successfully!');
      setTimeout(() => setImportSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setImportSuccess(null);

    try {
      const text = await file.text();
      const importData = validateImportData(text);
      
      const result = mergeImportData(currentUser.id, importData);

      const totalAdded = result.transactionsAdded + result.goalsAdded;
      const totalSkipped = result.transactionsSkipped + result.goalsSkipped;

      if (totalAdded > 0) {
        setImportSuccess(
          `✓ Imported ${totalAdded} items successfully!${totalSkipped > 0 ? ` (${totalSkipped} duplicates skipped)` : ''}`
        );
        
        // Refresh app state
        onSwitch(currentUser.id);
      } else {
        setImportSuccess('No new data to import (all items already exist)');
      }

      setTimeout(() => setImportSuccess(null), 5000);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Import failed: ${err.message}`);
      } else {
        setError('Import failed: Invalid file format');
      }
      setTimeout(() => setError(''), 5000);
    }

    // Reset file input
    e.target.value = '';
  };

  const handleCreateNewUser = async () => {
    if (!newUserName.trim()) {
      setError('Please enter a name');
      return;
    }
    if (emojiPassword.length < 3) {
      setError('Password must be at least 3 emojis');
      return;
    }

    try {
      const newUser = await createUser(newUserName, emojiPassword);
      // Switch to the new user
      await switchUserContext(newUser.id);
      onSwitch(newUser.id);
      // Reset and close
      setShowCreateUser(false);
      setNewUserName('');
      setEmojiPassword([]);
      setIsCreatingPassword(false);
      setIsOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
    }
  };

  const startCreateUser = () => {
    setShowCreateUser(true);
    setIsCreatingPassword(false);
    setNewUserName('');
    setEmojiPassword([]);
    setError('');
    setImportSuccess(null);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 transition-colors"
      >
        <UserAvatar name={currentUser.name} size="sm" variant="primary" />
        <span className="text-sm font-medium hidden sm:inline">{currentUser.name}</span>
      </button>

      {/* Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={() => {
          setIsOpen(false);
          setSelectedUser(null);
          setEmojiPassword([]);
          setError('');
          setShowCreateUser(false);
          setNewUserName('');
          setIsCreatingPassword(false);
        }}
        className="w-full max-w-md"
      >
        <div className="bg-background rounded-3xl w-full overflow-hidden border border-border">
          {!selectedUser && !showCreateUser ? (
            // User Selection
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2>Switch User</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Current User */}
                <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border-2 border-purple-300">
                  <div className="flex items-center gap-4">
                    <UserAvatar name={currentUser.name} size="md" variant="primary" />
                    <div className="flex-1">
                      <div className="font-medium">{currentUser.name}</div>
                      <div className="text-sm text-muted-foreground">Currently active</div>
                    </div>
                  </div>
                </div>

                {/* Other Users */}
                {users.length > 0 ? (
                  <>
                    <div className="text-sm text-muted-foreground pt-2">Switch to:</div>
                    {users.map((user) => (
                      <motion.button
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-4 bg-secondary/50 hover:bg-secondary rounded-2xl flex items-center gap-4 transition-colors"
                      >
                        <UserAvatar name={user.name} size="md" variant="secondary" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.emojiPassword.length} emoji pattern
                          </div>
                        </div>
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      </motion.button>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No other users
                  </div>
                )}
              </div>

              {/* Add User Button */}
              <Button
                onClick={startCreateUser}
                className="w-full h-12"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Add User
              </Button>

              {/* Admin Button */}
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setShowAdminPanel(true);
                }}
                variant="outline"
                className="w-full h-12 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-orange-200"
              >
                <Shield className="w-5 h-5 mr-2 text-orange-600" />
                <span className="text-orange-900">Admin</span>
              </Button>

              <div className="border-t border-border pt-4 space-y-3">
                {/* Import/Export Buttons - Stacked Horizontally */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleExport}
                    variant="outline"
                    className="flex-1 h-12 bg-[#F5F3FF] hover:bg-[#EDE9FE] border-purple-200"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Export
                  </Button>

                  <Button
                    onClick={handleImportClick}
                    variant="outline"
                    className="flex-1 h-12 bg-[#F5F3FF] hover:bg-[#EDE9FE] border-purple-200"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Import
                  </Button>
                </div>

                {/* Logout Button */}
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  variant="outline"
                  className="w-full h-12 bg-red-50 hover:bg-red-100 text-destructive hover:text-destructive border-red-200"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileSelect}
              />

              {importSuccess && (
                <ErrorDisplay
                  message={importSuccess}
                  type="success"
                  variant="banner"
                />
              )}

              {error && (
                <ErrorDisplay
                  message={error}
                  variant="banner"
                />
              )}
            </div>
          ) : showCreateUser ? (
            // Create User Flow
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Create new</div>
                  <h2>Add User</h2>
                </div>
                <button
                  onClick={() => {
                    setShowCreateUser(false);
                    setNewUserName('');
                    setEmojiPassword([]);
                    setIsCreatingPassword(false);
                    setError('');
                  }}
                  className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!isCreatingPassword ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      What's your name?
                    </label>
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full h-14 px-4 bg-secondary rounded-2xl border-2 border-transparent focus:border-purple-300 focus:outline-none transition-colors"
                      placeholder="Enter your name"
                      autoFocus
                      maxLength={20}
                    />
                  </div>

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
                    <Button
                      onClick={() => {
                        if (!newUserName.trim()) {
                          setError('Please enter a name');
                          return;
                        }
                        setIsCreatingPassword(true);
                        setError('');
                      }}
                      className="flex-1 h-12"
                    >
                      Next
                    </Button>
                    <Button
                      onClick={() => {
                        setShowCreateUser(false);
                        setNewUserName('');
                        setError('');
                      }}
                      variant="outline"
                      className="h-12 px-6"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Create your emoji password
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Pick 3-6 emoji in order (you'll use this to log in)
                    </div>
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

                  <div className="space-y-2">
                    {emojiPassword.length > 0 && (
                      <Button
                        onClick={handleRemoveLastEmoji}
                        variant="outline"
                        className="w-full h-11"
                      >
                        Remove Last Emoji
                      </Button>
                    )}
                    
                    <div className="flex gap-2">
                      {emojiPassword.length >= 3 && (
                        <Button
                          onClick={handleCreateNewUser}
                          className="flex-1 h-12"
                        >
                          <UserPlus className="w-5 h-5 mr-2" />
                          Create User
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setIsCreatingPassword(false);
                          setEmojiPassword([]);
                          setError('');
                        }}
                        variant="outline"
                        className="h-12 px-6"
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Password Entry
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Switch to</div>
                  <h2>{selectedUser.name}</h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setEmojiPassword([]);
                    setError('');
                  }}
                  className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Enter emoji pattern
                </div>
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
        </div>
      </Modal>

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {showAdminPanel && (
          <AdminPanel
            isOpen={showAdminPanel}
            onClose={() => setShowAdminPanel(false)}
            onUserDeleted={() => {
              // If current user was deleted, logout
              onLogout();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}