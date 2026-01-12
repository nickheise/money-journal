import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { 
  Location, 
  locationIcons, 
  locationLabels, 
  locationSegmentStyles 
} from '../utils/location-constants';

interface LocationSegmentControlProps {
  value: Location;
  onChange: (value: Location) => void;
}

const locations: Array<{
  id: Location;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  selectedGradient: string;
  deselectedGradient: string;
  iconColor: string;
  textColor: string;
}> = [
  { 
    id: 'wallet' as const, 
    label: locationLabels.wallet, 
    icon: locationIcons.wallet,
    ...locationSegmentStyles.wallet
  },
  { 
    id: 'bank' as const, 
    label: locationLabels.bank, 
    icon: locationIcons.bank,
    ...locationSegmentStyles.bank
  },
  { 
    id: 'jar' as const, 
    label: locationLabels.jar, 
    icon: locationIcons.jar,
    ...locationSegmentStyles.jar
  },
  { 
    id: 'other' as const, 
    label: locationLabels.other, 
    icon: locationIcons.other,
    ...locationSegmentStyles.other
  },
];

export function LocationSegmentControl({ value, onChange }: LocationSegmentControlProps) {
  const selectedIndex = locations.findIndex(loc => loc.id === value);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedButtonRef.current && containerRef.current) {
      const container = containerRef.current;
      const button = selectedButtonRef.current;
      
      // For the first option (Wallet), scroll to the start
      if (value === 'wallet') {
        container.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      } else {
        // Calculate the scroll position to center the selected button
        const containerWidth = container.offsetWidth;
        const buttonLeft = button.offsetLeft;
        const buttonWidth = button.offsetWidth;
        const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
        
        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [value]);

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className="relative w-full overflow-x-auto no-scrollbar pl-6"
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div className="flex gap-1" style={{ paddingRight: '40%' }}>
          {locations.map((location, index) => {
            const Icon = location.icon;
            const isSelected = location.id === value;

            return (
              <button
                key={location.id}
                ref={isSelected ? selectedButtonRef : null}
                type="button"
                onClick={() => onChange(location.id)}
                className="relative px-5 py-4 rounded-full transition-all flex items-center gap-2 flex-shrink-0 min-w-[160px] justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border"
                style={{
                  opacity: isSelected ? 1 : 0.4,
                  scale: isSelected ? 1 : 0.9,
                }}
              >
                {/* Animated background gradient */}
                {isSelected && (
                  <motion.div
                    layoutId="location-background"
                    className={`absolute inset-0 ${location.selectedGradient} rounded-full`}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
                
                <Icon
                  className={`w-4 h-4 transition-colors relative z-10 ${
                    isSelected ? 'text-white' : 'text-muted-foreground'
                  }`}
                />
                <span
                  className={`font-medium transition-colors relative z-10 text-sm ${
                    isSelected ? 'text-white' : 'text-muted-foreground'
                  }`}
                >
                  {location.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}