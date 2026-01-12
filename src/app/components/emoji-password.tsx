import { motion } from 'motion/react';

interface EmojiPasswordProps {
  onSelect: (emoji: string) => void;
  selectedEmojis: string[];
  maxLength?: number;
}

const EMOJI_OPTIONS = [
  '😀', '😂', '😍', '😊', '😎',
  '😢', '😡', '😱', '🤔', '😴',
  '🥳', '🤗', '🤩', '😇', '🥺',
  '🐶', '🐱', '🐭', '🐹', '🐰',
  '🦊', '🐻', '🐼', '🐨', '🐯',
  '🍕', '🍔', '🍟', '🍿', '🍩',
  '🍪', '🍰', '🍦', '🍭', '🍬',
  '⚽', '🏀', '🏈', '⚾', '🎾',
  '🎮', '🎯', '🎨', '🎭', '🎪',
  '🌟', '⭐', '✨', '💫', '🔥',
  '💧', '🌈', '☀️', '🌙', '⚡',
];

export function EmojiPassword({ onSelect, selectedEmojis, maxLength = 6 }: EmojiPasswordProps) {
  return (
    <div className="space-y-4">
      {/* Selected emojis display */}
      <div className="flex items-center justify-center gap-2 min-h-[100px] bg-secondary/50 rounded-2xl p-6 overflow-visible">
        {selectedEmojis.length === 0 ? (
          <div className="text-sm text-muted-foreground">Choose your emoji pattern</div>
        ) : (
          selectedEmojis.map((emoji, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-5xl leading-none flex items-center justify-center"
            >
              {emoji}
            </motion.div>
          ))
        )}
        {selectedEmojis.length > 0 && selectedEmojis.length < maxLength && (
          <div className="text-3xl text-muted-foreground opacity-50 leading-none flex items-center justify-center">...</div>
        )}
      </div>

      {/* Emoji grid */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-[300px] overflow-y-auto p-2 bg-background/50 rounded-xl">
        {EMOJI_OPTIONS.map((emoji, index) => (
          <motion.button
            key={index}
            type="button"
            onClick={() => onSelect(emoji)}
            disabled={selectedEmojis.length >= maxLength}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-3xl p-2 rounded-xl hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center w-full h-12"
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      <div className="text-xs text-center text-muted-foreground">
        {selectedEmojis.length}/{maxLength} emoji selected
      </div>
    </div>
  );
}