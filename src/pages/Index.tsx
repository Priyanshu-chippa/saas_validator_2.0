import { useState } from "react";
import ValidationForm from "@/components/ValidationForm";
import ValidationReport, { ValidationReportData } from "@/components/ValidationReport"; // Assuming ValidationReportData is exported correctly
import LoadingAnimation from "@/components/LoadingAnimation";
// Mock service import removed
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ValidationReportData | null>(null);
  const { toast } = useToast();

  // --- THIS FUNCTION NOW CALLS YOUR REAL BACKEND ---
  const handleValidateIdea = async (idea: string) => {
    setIsLoading(true);
    setReportData(null); // Clear previous report
    try {
      console.log("Fetching validation from backend for idea:", idea); 
      const functionsUrl = (import.meta as any).env?.VITE_FUNCTIONS_URL || `${(import.meta as any).env?.VITE_SUPABASE_URL}/functions/v1`;
      const response = await fetch(
        `${functionsUrl}/validate-idea`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ideaDescription: idea }), 
        }
      );

      console.log("Backend response status:", response.status); 

      if (!response.ok) {
        let errorMsg = `Backend Error: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg; 
        } catch (e) { 
            console.warn("Could not parse error response body as JSON.");
        }
        throw new Error(errorMsg); 
      }

      const data: ValidationReportData = await response.json(); 
      console.log("Received data from backend:", data); 

      if (data && data.overview && data.theMarket && data.validationMetrics) {
          setReportData(data); // Set state with REAL data
          toast({
            title: "Validation Complete",
            description: "Your SaaS idea has been analyzed successfully.",
          });
      } else {
          console.error("Received unexpected or incomplete data structure from backend:", data);
          throw new Error("Received unexpected data structure from backend.");
      }

    } catch (error: any) { 
      console.error("Error validating idea:", error);
      toast({
        variant: "destructive",
        title: "Validation Failed",
        description: error.message || "An unknown error occurred analyzing your idea. Please try again.", 
      });
      setReportData(null); 
    } finally {
      setIsLoading(false); 
    }
  };
  // --- END OF handleValidateIdea ---


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-hero-pattern py-16 md:py-24">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold gradient-text leading-tight">
                Validate Your SaaS Ideas With Data-Driven Insights
              </h1>
              <p className="text-xl text-muted-foreground">
                Get detailed analysis on market potential, competition, and feasibility before investing time and resources.
              </p>
            </div>
          </div>
        </section>

        {/* Validation Form Section */}
        <section className="py-12 px-4">
          <div className="container">
            <ValidationForm onSubmit={handleValidateIdea} isLoading={isLoading} /> 
          </div>
        </section>

        {/* Loading State or Results Section */}
        <section className="py-8 px-4">
          <div className="container">
            {isLoading ? (
              <LoadingAnimation />
            ) : reportData ? (
              <ValidationReport data={reportData} /> 
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  Enter your SaaS idea above to get a comprehensive validation report.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* How It Works Section (shown only initially) */}
        {!isLoading && !reportData && (
          <section className="py-16 bg-accent/50 px-4">
             <div className="container">
               <div className="text-center mb-12">
                 <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                 <p className="text-muted-foreground max-w-2xl mx-auto">
                   Our SaaS idea validator combines the power of AI with real market data to give you comprehensive insights.
                 </p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Feature 1 */}
                  <div className="bg-background p-6 rounded-lg shadow-sm">
                     <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"><span className="text-primary font-bold">1</span></div>
                     <h3 className="text-xl font-medium mb-2">Describe Your Idea</h3>
                     <p className="text-muted-foreground">Provide details about your SaaS idea, target audience, and the problem you're solving.</p>
                  </div>
                  {/* Feature 2 */}
                  <div className="bg-background p-6 rounded-lg shadow-sm">
                     <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"><span className="text-primary font-bold">2</span></div>
                     <h3 className="text-xl font-medium mb-2">AI Analysis</h3>
                     <p className="text-muted-foreground">Our system analyzes your idea using advanced AI and pulls relevant market data from trusted sources.</p>
                  </div>
                  {/* Feature 3 */}
                  <div className="bg-background p-6 rounded-lg shadow-sm">
                     <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"><span className="text-primary font-bold">3</span></div>
                     <h3 className="text-xl font-medium mb-2">Comprehensive Report</h3>
                     <p className="text-muted-foreground">Get detailed insights on market potential, competition, and specific validation metrics.</p>
                   </div>
               </div>
             </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;