
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface ValidationFormProps {
  onSubmit: (idea: string) => void;
  isLoading: boolean;
}

const ValidationForm = ({ onSubmit, isLoading }: ValidationFormProps) => {
  const [idea, setIdea] = useState("");
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim().length <= 10) return;
    onSubmit(idea);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-4">
      <div className="space-y-2">
        <Textarea
          id="idea-input"
          placeholder="Describe your SaaS idea in detail... (e.g., 'A platform that helps small businesses validate their product ideas by connecting them with potential customers for feedback')"
          className="min-h-[160px] text-base p-4 resize-y"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground">
          Be specific about your target audience, core features, and the problem you're solving.
        </p>
      </div>

      <div className="space-y-2">
        <Button
          id="validate-button"
          type="submit"
          size="lg"
          className="w-full sm:w-auto text-base font-medium"
          disabled={isLoading || idea.trim().length <= 10}
        >
          {isLoading ? "Analyzing Your Idea..." : "Validate My SaaS Idea"}
        </Button>
        
        <p 
          id="loading-indicator" 
          className="text-sm text-muted-foreground"
          style={{ display: 'none' }}
        >
          Validating your SaaS idea...
        </p>
      </div>
    </form>
  );
};

export default ValidationForm;
