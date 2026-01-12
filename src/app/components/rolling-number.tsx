import { motion, AnimatePresence } from 'motion/react';
import { spring } from '../utils/animation-config';

interface RollingNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  className?: string;
  digitClassName?: string;
}

export function RollingNumber({ 
  value, 
  decimals = 2, 
  prefix = '$',
  className = '',
  digitClassName = ''
}: RollingNumberProps) {
  // Handle NaN, Infinity, and other edge cases
  const safeValue = isNaN(value) || !isFinite(value) ? 0 : value;
  const formattedValue = safeValue.toFixed(decimals);
  const displayString = `${prefix}${formattedValue}`;
  const digits = displayString.split('');

  return (
    <div className={`inline-flex items-baseline ${className}`}>
      {digits.map((digit, index) => {
        const isDigit = /\d/.test(digit);
        
        return (
          <div
            key={index}
            className="relative inline-block overflow-hidden"
            style={{ 
              minWidth: digit === '.' ? '0.3em' : digit === '$' ? '0.6em' : '0.6em',
              height: '1.2em', // Fixed height to prevent NaN in percentage calculations
            }}
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={`${digit}-${value}`}
                initial={{ 
                  y: isDigit ? 20 : 0,
                  opacity: 0,
                }}
                animate={{ 
                  y: 0,
                  opacity: 1,
                }}
                exit={{ 
                  y: isDigit ? -20 : 0,
                  opacity: 0,
                }}
                transition={{
                  ...spring.bouncy,
                  delay: isDigit ? index * 0.03 : 0,
                }}
                className={`inline-block ${digitClassName}`}
              >
                {digit}
              </motion.span>
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}