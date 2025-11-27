import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

const Card = ({ children, className, title, description }: CardProps) => {
  return (
    <div className={cn(
      "rounded-xl border border-white/20 backdrop-blur-md bg-white/10",
      "text-card-foreground shadow-xl",
      "transition-all duration-300 hover:bg-white/15 hover:shadow-2xl",
      "hover:border-white/30",
      className
    )}>
      {(title || description) && (
        <div className="p-6 pb-3">
          {title && <h3 className="text-xl md:text-2xl font-bold text-gray-900 drop-shadow-md">{title}</h3>}
          {description && <p className="text-base md:text-lg text-gray-700 mt-2 drop-shadow-sm">{description}</p>}
        </div>
      )}
      <div className={cn(title || description ? "px-6 pb-6" : "p-6")}>{children}</div>
    </div>
  );
};

export default Card;
