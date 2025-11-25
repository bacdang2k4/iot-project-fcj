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
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
      {(title || description) && (
        <div className="p-6 pb-3">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      <div className={cn(title || description ? "px-6 pb-6" : "p-6")}>{children}</div>
    </div>
  );
};

export default Card;
