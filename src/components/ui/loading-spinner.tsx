import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const LoadingSpinner = ({ className, size = "md" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "rounded-full border-2 border-primary/20 border-t-primary animate-spin-slow",
          sizeClasses[size]
        )}
      />
      <div
        className={cn(
          "absolute inset-0 rounded-full border-2 border-transparent border-t-primary/60 animate-spin-slow",
          sizeClasses[size]
        )}
        style={{
          animationDuration: "1.5s",
          animationDirection: "reverse"
        }}
      />
    </div>
  );
};

export { LoadingSpinner };