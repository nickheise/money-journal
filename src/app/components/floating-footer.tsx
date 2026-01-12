import { motion } from 'motion/react';
import { LucideIcon, Plus } from 'lucide-react';

/**
 * FloatingFooter - Modern iOS-style floating navigation
 * 
 * Features:
 * - Left-aligned floating tab bar with white blur background
 * - Right-aligned floating "+" button for quick actions
 */

interface TabOption {
  value: string;
  icon: LucideIcon;
}

interface FloatingFooterProps {
  tabs: TabOption[];
  currentTab: string;
  onTabChange: (value: string) => void;
  onAddClick: () => void;
}

export function FloatingFooter({ tabs, currentTab, onTabChange, onAddClick }: FloatingFooterProps) {
  return (
    <>
      {/* Fixed Container */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none pb-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
          {/* Left: Floating Tab Bar */}
          <nav className="pointer-events-auto backdrop-blur-xl bg-white/90 rounded-full shadow-lg border border-black/5 p-1.5 flex items-center gap-1 h-14">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = tab.value === currentTab;

              return (
                <button
                  key={tab.value}
                  onClick={() => onTabChange(tab.value)}
                  className="relative px-6 h-11 rounded-full flex items-center justify-center transition-transform active:scale-95"
                >
                  {/* Animated gradient background */}
                  {isSelected && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 via-pink-500 to-orange-500 rounded-full"
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Icon */}
                  <Icon
                    className={`w-5 h-5 transition-colors relative z-10 ${
                      isSelected ? 'text-white' : 'text-gray-700'
                    }`}
                    strokeWidth={2}
                  />
                </button>
              );
            })}
          </nav>

          {/* Right: Action Button */}
          <button
            onClick={onAddClick}
            className="pointer-events-auto w-14 h-14 rounded-full backdrop-blur-xl bg-white/90 shadow-lg border border-black/5 flex items-center justify-center transition-transform active:scale-95 hover:scale-105"
          >
            <Plus className="w-6 h-6 text-gray-700" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Bottom Safe Area Spacer */}
      <div className="h-24" />
    </>
  );
}