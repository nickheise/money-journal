import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface SegmentOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface SegmentControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentControl({ options, value, onChange }: SegmentControlProps) {
  return (
    <div className="relative inline-flex bg-secondary/50 rounded-full p-1 gap-1">
      {/* Buttons */}
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className="relative px-6 py-3 rounded-full transition-colors flex items-center gap-2 min-w-[140px] justify-center"
          >
            {/* Animated background - only render for selected */}
            {isSelected && (
              <motion.div
                layoutId="segment-background"
                className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 via-pink-500 to-orange-500 rounded-full"
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 25,
                }}
              />
            )}
            
            <Icon
              className={`w-4 h-4 transition-colors relative z-10 ${
                isSelected ? 'text-white' : 'text-muted-foreground/60'
              }`}
            />
            <span
              className={`font-medium transition-colors relative z-10 ${
                isSelected ? 'text-white' : 'text-foreground/60'
              }`}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}