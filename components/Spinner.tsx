// components/Spinner.tsx
import React from 'react'
import { cn } from '@/lib/utils'

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Spinner({ 
  size = 'md', 
  className, 
  ...props 
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div 
      role="status" 
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <div className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size]
      )}>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}