// components/PrimaryButton.tsx - VERCEL STYLE
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2, ArrowRight, ChevronRight } from 'lucide-react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  arrow?: boolean;
}

export function PrimaryButton({
  children,
  loading = false,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  arrow = false,
  disabled,
  className = '',
  ...props
}: PrimaryButtonProps) {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2.5 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-black text-white hover:bg-gray-800 focus:ring-black',
    secondary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  // Width class
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Spinner size
  const spinnerSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  
  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${widthClass}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <Loader2 className={`${spinnerSize} animate-spin mr-2`} />
      )}
      
      {/* Icon on left */}
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {/* Button text */}
      <span>{children}</span>
      
      {/* Icon on right */}
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
      
      {/* Arrow icon (only for certain variants) */}
      {arrow && !loading && !icon && (
        <ChevronRight className="ml-1 w-4 h-4" />
      )}
    </button>
  );
}

// Secondary export for Vercel-style gradient button
export function GradientButton({
  children,
  loading = false,
  ...props
}: Omit<PrimaryButtonProps, 'variant'>) {
  return (
    <PrimaryButton
      variant="primary"
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500"
      loading={loading}
      {...props}
    >
      {children}
    </PrimaryButton>
  );
}

// Usage examples:
/*
// Primary button (Vercel default)
<PrimaryButton variant="primary">
  Get Started
</PrimaryButton>

// Gradient button
<GradientButton>
  Upgrade Plan
</GradientButton>

// Button with icon
<PrimaryButton 
  variant="secondary" 
  icon={<ArrowRight className="w-4 h-4" />}
  iconPosition="right"
>
  Continue
</PrimaryButton>

// Loading button
<PrimaryButton loading>
  Processing...
</PrimaryButton>

// Outline button
<PrimaryButton variant="outline">
  Learn More
</PrimaryButton>

// Full width button
<PrimaryButton fullWidth>
  Submit
</PrimaryButton>

// Danger button
<PrimaryButton variant="danger">
  Delete
</PrimaryButton>
*/