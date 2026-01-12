import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { RollingNumber } from '../rolling-number';
import { spring } from '../../utils/animation-config';
import { EmptyState } from '../ui/error-display';
import { 
  Location, 
  locationIcons, 
  locationLabels, 
  locationGradients,
  locationWaveColors
} from '../../utils/location-constants';

/**
 * LocationCards - Displays money by location
 * 
 * Pure presentation component - receives data, no logic
 */

interface LocationCardsProps {
  balanceByLocation: Record<string, number>;
  isLoading?: boolean;
}

export function LocationCards({ 
  balanceByLocation, 
  isLoading = false 
}: LocationCardsProps) {
  const activeLocations = Object.entries(balanceByLocation)
    .filter(([_, amount]) => amount > 0)
    .sort(([_, a], [__, b]) => b - a);

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg opacity-50">Where's the Money</h2>
        </div>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-40 h-32 rounded-2xl bg-secondary/50 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
          {/* Fade gradient to indicate more cards */}
          <div className="absolute -right-4 top-0 bottom-6 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg opacity-50">Where's the Money</h2>
      </div>
      
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {activeLocations.length === 0 ? (
            <div className="w-full">
              <EmptyState
                icon={<Plus className="w-8 h-8" />}
                title="Add your first transaction"
                description="Start tracking where your money lives"
              />
            </div>
          ) : (
            activeLocations.map(([location, amount], index) => {
              const Icon = locationIcons[location as Location];
              const label = locationLabels[location as Location];
              const colorClass = locationGradients[location as Location];
              const waveColor = locationWaveColors[location as Location];
              
              return (
                <motion.div
                  key={location}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: index * 0.1 }}
                  className={`${colorClass} rounded-2xl p-6 relative overflow-hidden flex-shrink-0 w-40 flex flex-col items-center text-center`}
                >
                  {/* Wave pattern texture overlay */}
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='16' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='${waveColor}' fill-opacity='0.3' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                      backgroundSize: '80px 16px'
                    }}
                  />
                  
                  <div className="relative z-10 w-full">
                    <div className="flex items-center justify-center gap-2 mb-4 opacity-60">
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{label}</span>
                    </div>
                    <div className="text-3xl tracking-tight">
                      <RollingNumber value={amount} className="text-3xl" />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
        {/* Fade gradient to indicate more cards - only show when there are multiple cards */}
        {activeLocations.length > 2 && (
          <div className="absolute -right-4 top-0 bottom-6 w-16 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none md:hidden" />
        )}
      </div>
    </div>
  );
}