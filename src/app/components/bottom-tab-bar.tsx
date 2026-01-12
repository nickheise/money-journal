import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface TabOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface BottomTabBarProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
}

export function BottomTabBar({ options, value, onChange }: BottomTabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl safe-area-inset-bottom">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 h-20">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                onClick={() => onChange(option.value)}
                className="flex flex-row items-center justify-center gap-2 px-5 py-2.5 relative"
              >
                {/* Animated gradient background - only render for selected */}
                {isSelected && (
                  <motion.div
                    layoutId="tab-background"
                    className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 via-pink-500 to-orange-500 rounded-full"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 25,
                    }}
                  />
                )}

                {/* Icon */}
                <Icon
                  className={`w-5 h-5 transition-colors relative z-10 ${
                    isSelected ? 'text-white' : 'text-muted-foreground/60'
                  }`}
                />

                {/* Label */}
                <span
                  className={`text-sm font-medium transition-colors relative z-10 ${
                    isSelected ? 'text-white' : 'text-muted-foreground'
                  }`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}