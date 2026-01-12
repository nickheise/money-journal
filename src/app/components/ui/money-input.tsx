import { motion } from 'motion/react';

/**
 * MoneyInput - Large, prominent money input field
 * 
 * Features:
 * - Animated $ sign that moves based on input
 * - Auto-sizing input that grows with content
 * - Consistent styling across the app
 * - Optimized for touch input
 */

interface MoneyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  id?: string;
  min?: string;
  max?: string;
  className?: string;
}

export function MoneyInput({
  value,
  onChange,
  placeholder = '0',
  disabled = false,
  autoFocus = false,
  id,
  min = '0',
  max,
  className = '',
}: MoneyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Only allow digits and a single decimal point
    if (newValue && !/^\d*\.?\d*$/.test(newValue)) {
      return;
    }
    
    // Remove any non-digit characters except decimal point
    const cleanValue = newValue.replace(/[^\d.]/g, '');
    
    // Split by decimal point to check integer part length
    const parts = cleanValue.split('.');
    const integerPart = parts[0] || '';
    
    // Limit to 8 digits in the integer part
    if (integerPart.length > 8) {
      return;
    }
    
    // Ensure only one decimal point
    if (parts.length > 2) {
      return;
    }
    
    onChange(cleanValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, decimal point
    if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    // Ensure that it is a number and stop the keypress if not
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  return (
    <div className={`relative rounded-2xl p-8 flex items-center justify-center gap-1 bg-secondary/30 ${className}`}>
      <span className="text-6xl text-muted-foreground flex-shrink-0">
        $
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className="text-6xl font-medium bg-transparent border-none outline-none w-auto min-w-[1ch] max-w-full placeholder:text-muted-foreground/30 disabled:opacity-50"
        style={{ width: value ? `${Math.min(value.length, 10)}ch` : '1ch' }}
        required
      />
    </div>
  );
}