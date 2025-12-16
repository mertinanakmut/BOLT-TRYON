// components/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}