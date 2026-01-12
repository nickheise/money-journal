/**
 * UserAvatar - Consistent user avatar with gradient background
 * 
 * Displays user initials in a colored gradient circle
 */

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-xl',
  lg: 'w-16 h-16 text-2xl',
};

const variantGradients = {
  primary: 'bg-gradient-to-br from-purple-400 to-pink-400',
  secondary: 'bg-gradient-to-br from-blue-400 to-cyan-400',
};

export function UserAvatar({ 
  name, 
  size = 'md', 
  variant = 'primary',
  className = '' 
}: UserAvatarProps) {
  const initial = name[0]?.toUpperCase() || '?';
  
  return (
    <div 
      className={`${variantGradients[variant]} ${sizeClasses[size]} rounded-full flex items-center justify-center text-white ${className}`}
    >
      {initial}
    </div>
  );
}
