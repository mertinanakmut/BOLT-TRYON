// components/Card.tsx - VERCEL STYLE
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'featured';
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  hoverable = false,
  padding = 'md'
}: CardProps) {
  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm',
    outline: 'bg-transparent border border-gray-200 dark:border-gray-800',
    ghost: 'bg-gray-50 dark:bg-gray-900/50 border border-transparent',
    featured: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800/30 shadow-md'
  };

  // Hover effect classes
  const hoverClasses = hoverable 
    ? 'transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 hover:-translate-y-0.5' 
    : '';

  return (
    <div className={`
      rounded-xl 
      ${variantClasses[variant]} 
      ${paddingClasses[padding]} 
      ${hoverClasses}
      ${className}
    `}>
      {children}
    </div>
  );
}

// Card Components for better composition

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardTitle({ 
  children, 
  className = '', 
  as: Component = 'h3' 
}: CardTitleProps) {
  return (
    <Component className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
      {children}
    </Component>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 ${className}`}>
      {children}
    </div>
  );
}

// Usage example:
/*
<Card variant="default" hoverable padding="md">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <button className="text-sm text-blue-600">Learn more</button>
  </CardFooter>
</Card>
*/