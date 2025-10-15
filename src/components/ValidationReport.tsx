import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// --- Data Structures ---
type Competitor = {
  name: string;
  description: string;
};

type SeoInsights = {
  relatedSearches: string[];
  disclaimer: string;
};

// This interface now matches the backend output structure
export interface ValidationReportData {
  overview: {
    valueProposition: string;
    keyBenefits: string[];
  };
  potentialChallenges: string[];
  sampleCompetitors: Competitor[];
  theMarket: {
    targetAudience: string[];
    marketDynamics: string;
    marketSizeEstimate: string;
    marketTrend: string;
  };
  validationMetrics: {
    vitaminOrPainkiller: number;
    readyToSpend: number;
    easyToConnect: number;
    easyToMarket: number;
    // Add easyToBuild?: number; and recency?: number; if backend sends them
  };
  overallScore: string;
  seoInsights: SeoInsights;
}

// --- Component Props ---
interface ValidationReportProps {
  data: ValidationReportData | null;
}

// --- Simplified Score Display ---
const SimpleScoreDisplay = ({ score, label }: { score: number | undefined | null; label: string }) => {
  if (score === undefined || score === null) {
    return (
       <div className="flex flex-col items-center sm:items-start">
          <h4 className="font-medium mb-1 text-center sm:text-left">{label}</h4>
          <p className="text-xl font-bold text-muted-foreground">N/A</p>
       </div>
    );
  }
  let scoreClass = "text-yellow-600";
  if (score <= 4) scoreClass = "text-red-600";
  if (score >= 8) scoreClass = "text-green-600";
  return (
    <div className="flex flex-col items-center sm:items-start">
       <h4 className="font-medium mb-1 text-center sm:text-left">{label}</h4>
       <p className={`text-3xl font-bold ${scoreClass}`}>{score}<span className="text-sm font-normal text-muted-foreground">/10</span></p>
    </div>
  );
};

// --- Main ValidationReport Component ---
const ValidationReport = ({ data }: ValidationReportProps) => {

  if (!data) {
    return <div className="text-center text-muted-foreground py-8">Report data is not available.</div>;
  }

  // --- Calculate Score Percentage ---
  const metrics = data.validationMetrics || {};
  const availableScores = Object.values(metrics).filter(score => typeof score === 'number') as number[];
  const totalScore = availableScores.reduce((sum, score) => sum + score, 0);
  const maxPossibleScore = availableScores.length * 10;
  const scorePercentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  // --- Determine Overall Rating ---
  let overallRating = "Needs Work";
  let ratingColor = "bg-red-100 text-red-800";
  if (scorePercentage >= 70) {
    overallRating = "Excellent";
    ratingColor = "bg-green-100 text-green-800";
  } else if (scorePercentage >= 50) {
    overallRating = "Promising";
    ratingColor = "bg-yellow-100 text-yellow-800";
  }
  const displayScore = data.overallScore || `${scorePercentage}%`;

  // --- Helper function to render lists safely ---
  const renderList = (items: string[] | undefined | null, title: string) => {
    if (!Array.isArray(items) || items.length === 0) {
      return <p className="text-sm text-muted-foreground italic">No {title.toLowerCase()} provided.</p>;
    }
    return (
      <ul className="list-disc pl-5 space-y-1 text-sm">
        {items.map((item, index) => (
          <li key={index}>{item || "N/A"}</li>
        ))}
      </ul>
    );
  };

  return (
      <div className="space-y-6 w-full">

        {/* --- Header summary --- */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-4">
          <div>
            <h2 className="text-xl font-semibold">SaaS Idea Validation Report</h2>
            <p className="text-sm text-muted-foreground">Comprehensive analysis of your business idea</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-3xl font-bold">{displayScore}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Overall Score</div>
            </div>
            <Badge className={`text-xs py-1 px-2 font-medium ${ratingColor}`}>{overallRating}</Badge>
          </div>
        </div>

        {/* --- Overview --- */}
        {data.overview && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Overview</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1 text-base">Value Proposition</h4>
                  <p className="text-muted-foreground">{data.overview.valueProposition || "N/A"}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-base">Key Benefits</h4>
                  {renderList(data.overview.keyBenefits, "Key Benefits")}
                </div>
              </CardContent>
            </Card>
        )}

        {/* --- Challenges --- */}
        {data.potentialChallenges && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Potential Challenges</CardTitle></CardHeader>
              <CardContent>
                {renderList(data.potentialChallenges, "Potential Challenges")}
              </CardContent>
            </Card>
        )}

        {/* --- Competitors --- */}
        {data.sampleCompetitors && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Sample Competitors</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.sampleCompetitors.length > 0 ? (
                    data.sampleCompetitors.map((competitor, index) => (
                      <div key={index} className="py-2">
                        <div className="font-medium text-sm">{competitor.name || "N/A"}</div>
                        <p className="text-xs text-muted-foreground mt-0.5">{competitor.description || "N/A"}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No competitors listed.</p>
                  )}
                </div>
              </CardContent>
            </Card>
        )}


        {/* --- Market --- */}
        {data.theMarket && (
            <Card>
              <CardHeader><CardTitle className="text-lg">The Market</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1 text-base">Target Audience</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {data.theMarket.targetAudience && data.theMarket.targetAudience.length > 0 ? (
                      data.theMarket.targetAudience.map((audience, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {audience}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">N/A</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-base">Market Dynamics</h4>
                  <p className="text-muted-foreground">{data.theMarket.marketDynamics || "N/A"}</p>
                </div>
                <Separator className="my-3" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1 text-base">Market Size Estimate</h4>
                    <p className="text-lg font-semibold">{data.theMarket.marketSizeEstimate || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-base">Market Trend</h4>
                    <div className="flex items-center gap-2">
                      {data.theMarket.marketTrend === "Growing" && (
                        <Badge className="bg-green-100 text-green-800 text-xs">Growing</Badge>
                      )}
                      {data.theMarket.marketTrend === "Stable" && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Stable</Badge>
                      )}
                      {data.theMarket.marketTrend === "Declining" && (
                        <Badge className="bg-red-100 text-red-800 text-xs">Declining</Badge>
                      )}
                      {!data.theMarket.marketTrend && <p className="text-xs text-muted-foreground italic">N/A</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
        )}


        {/* --- Validation Metrics --- */}
        {data.validationMetrics && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Validation Metrics</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  <SimpleScoreDisplay
                    score={data.validationMetrics.vitaminOrPainkiller}
                    label="Vitamin or Painkiller"
                  />
                  <SimpleScoreDisplay
                    score={data.validationMetrics.readyToSpend}
                    label="Ready to Spend"
                  />
                  <SimpleScoreDisplay
                    score={data.validationMetrics.easyToConnect}
                    label="Easy to Connect"
                  />
                  <SimpleScoreDisplay
                    score={data.validationMetrics.easyToMarket}
                    label="Easy to Market"
                  />
                  {/* Add checks and display for easyToBuild / recency if they exist */}
                  {/* {data.validationMetrics.easyToBuild !== undefined && (
                     <SimpleScoreDisplay score={data.validationMetrics.easyToBuild} label="Easy to Build" />
                  )}
                  {data.validationMetrics.recency !== undefined && (
                     <SimpleScoreDisplay score={data.validationMetrics.recency} label="Recency & Timeliness" />
                  )} */}
                </div>
              </CardContent>
            </Card>
        )}


        {/* --- SEO Insights --- */}
        {data.seoInsights && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Related Searches</CardTitle></CardHeader>
              <CardContent>
                {data.seoInsights.relatedSearches && data.seoInsights.relatedSearches.length > 0 ? (
                  <>
                    <ul className="list-disc pl-5 space-y-1 text-sm mb-3">
                      {data.seoInsights.relatedSearches.map((search, index) => (
                        <li key={index}>{search || "N/A"}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground italic">
                      {data.seoInsights.disclaimer || ""}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No related searches found.</p>
                )}
              </CardContent>
            </Card>
        )}


        {/* --- Footer Disclaimer --- */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t mt-6">
          <p>This report was generated using AI analysis and related search data. Market size estimates and competitor analysis may not be completely accurate.</p>
        </div>
      </div> // Closes the main wrapper div
  );
};

export default ValidationReport;