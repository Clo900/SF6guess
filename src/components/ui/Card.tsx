import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-purple-900/40 backdrop-blur-sm border border-purple-700/50 rounded-lg p-4',
          hover && 'hover:bg-purple-800/50 hover:border-purple-500 transition-colors duration-200',
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
