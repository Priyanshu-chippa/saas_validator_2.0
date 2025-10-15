
import { cn } from "@/lib/utils";

const LoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-primary/30"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
      </div>

      <div className="space-y-3 w-full max-w-md">
        <div className="text-center text-lg font-medium">Validating Your SaaS Idea</div>
        <div className="flex flex-col space-y-2">
          {[
            "Analyzing market dynamics",
            "Identifying potential competitors",
            "Assessing technical feasibility",
            "Evaluating value proposition",
            "Generating validation metrics"
          ].map((step, index) => (
            <div 
              key={index} 
              className={cn(
                "px-4 py-2 rounded-md bg-muted flex items-center",
                index === 0 ? "animate-pulse-opacity" : "",
                index === 1 ? "animate-pulse-opacity [animation-delay:400ms]" : "",
                index === 2 ? "animate-pulse-opacity [animation-delay:800ms]" : "",
                index === 3 ? "animate-pulse-opacity [animation-delay:1200ms]" : "",
                index === 4 ? "animate-pulse-opacity [animation-delay:1600ms]" : "",
              )}
            >
              {step}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          This may take a few moments...
        </p>
      </div>
    </div>
  );
};

export default LoadingAnimation;
