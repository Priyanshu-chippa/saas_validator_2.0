// eslint-disable
// @ts-nocheck
// Deno Deploy / Supabase Edge Function
// Endpoint: /functions/v1/validate-idea

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

type Competitor = {
  name: string;
  description: string;
};

type ValidationReportData = {
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
  };
  overallScore: string;
  seoInsights: {
    relatedSearches: string[];
    disclaimer: string;
  };
};

function corsHeaders(origin: string | null) {
  const allowOrigin = origin ?? '*';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  } as Record<string, string>;
}

async function fetchRelatedSearches(serpApiKey: string, query: string): Promise<string[]> {
  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine', 'google');
  url.searchParams.set('q', query);
  url.searchParams.set('api_key', serpApiKey);

  const resp = await fetch(url.toString(), { method: 'GET' });
  if (!resp.ok) return [];
  const json = await resp.json();
  const related: string[] = Array.isArray(json?.related_searches)
    ? json.related_searches.map((r: any) => r?.query).filter((x: unknown) => typeof x === 'string')
    : [];
  return related.slice(0, 10);
}

async function listAvailableModels(geminiApiKey: string): Promise<any[]> {
  const resp = await fetch('https://generativelanguage.googleapis.com/v1/models?key=' + encodeURIComponent(geminiApiKey));
  if (!resp.ok) return [];
  const json = await resp.json();
  const models = Array.isArray(json?.models) ? json.models : Array.isArray(json?.data) ? json.data : [];
  return models;
}

async function callGeminiOnce(geminiApiKey: string, model: string, ideaDescription: string) {
  const prompt = `Analyze the following SaaS idea and return JSON with fields: overview(valueProposition, keyBenefits[4]), potentialChallenges[4], sampleCompetitors[{name, description}] (3 items), theMarket{targetAudience[5], marketDynamics, marketSizeEstimate, marketTrend in [Growing,Stable,Declining]}, validationMetrics{vitaminOrPainkiller, readyToSpend, easyToConnect, easyToMarket} as integers 1-10, and overallScore as percentage string like "68%". SaaS Idea: ${ideaDescription}`;

  const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=` + encodeURIComponent(geminiApiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    const err = new Error(`Gemini API error: ${resp.status} ${t}`);
    // @ts-ignore
    err.name = 'GeminiHttpError';
    // @ts-ignore
    err.status = resp.status;
    throw err;
  }
  const json = await resp.json();
  const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no text');

  // Try to extract JSON from the response
  let parsed: any = null;
  try {
    // First try direct JSON parse
    parsed = JSON.parse(text);
  } catch {
    try {
      // Try to find JSON within code blocks
      const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
      if (fenced) {
        parsed = JSON.parse(fenced[1]);
      } else {
        // Try to find JSON object in the text
        const brace = text.match(/\{[\s\S]*\}/);
        if (brace) {
          parsed = JSON.parse(brace[0]);
        }
      }
    } catch {
      // If all parsing fails, create a fallback response
      parsed = {
        overview: {
          valueProposition: text.substring(0, 200) + "...",
          keyBenefits: ["AI-generated analysis", "Market insights", "Competitor research", "Validation metrics"]
        },
        potentialChallenges: ["AI analysis may vary", "Market data limitations", "Competitive landscape changes"],
        sampleCompetitors: [
          { name: "Competitor A", description: "Similar service provider" },
          { name: "Competitor B", description: "Alternative solution" }
        ],
        theMarket: {
          targetAudience: ["Entrepreneurs", "Startups", "Product managers"],
          marketDynamics: "Growing market for validation tools",
          marketSizeEstimate: "Moderate to large",
          marketTrend: "Growing"
        },
        validationMetrics: {
          vitaminOrPainkiller: 7,
          readyToSpend: 6,
          easyToConnect: 8,
          easyToMarket: 7
        },
        overallScore: "70%"
      };
    }
  }
  return parsed;
}

async function callGeminiWithFallback(geminiApiKey: string, ideaDescription: string) {
  const candidates = [
    // Use the available model from the API key
    'gemini-2.0-flash',
  ];
  let lastError: any = null;
  for (const model of candidates) {
    try {
      return await callGeminiOnce(geminiApiKey, model, ideaDescription);
    } catch (e: any) {
      lastError = e;
      const status = e?.status;
      const message: string = String(e?.message || '');
      const notFound = status === 404 || message.includes('NOT_FOUND') || message.includes('not found');
      const unsupported = message.includes('is not supported for generateContent');
      const invalidArg = status === 400 || message.includes('INVALID_ARGUMENT');
      // For model issues or parse/arg issues, try next candidate
      if (notFound || unsupported || invalidArg) {
        continue;
      }
      // For rate limit/service errors, stop early
      if (status === 429 || status === 503) break;
    }
  }
  // As a final fallback: query available models for this key and choose one that supports generateContent
  try {
    const models = await listAvailableModels(geminiApiKey);
    const preferred = models.find((m: any) => Array.isArray(m?.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent') && typeof m?.name === 'string' && (m.name.includes('gemini-1.5-flash') || m.name.includes('gemini-1.5-pro') || m.name.includes('gemini-1.0-pro')));
    const name: string | undefined = preferred?.name;
    if (name) {
      return await callGeminiOnce(geminiApiKey, name.split('/').pop() as string, ideaDescription);
    }
  } catch (_) {
    // ignore discovery errors and fall through to throw
  }
  throw lastError || new Error('Gemini API: all model attempts failed for provided key');
}

function normalizeToReport(raw: any, relatedSearches: string[]): ValidationReportData {
  return {
    overview: {
      valueProposition: raw?.overview?.valueProposition ?? '',
      keyBenefits: Array.isArray(raw?.overview?.keyBenefits) ? raw.overview.keyBenefits : [],
    },
    potentialChallenges: Array.isArray(raw?.potentialChallenges) ? raw.potentialChallenges : [],
    sampleCompetitors: Array.isArray(raw?.sampleCompetitors)
      ? raw.sampleCompetitors.map((c: any) => ({ name: String(c?.name ?? ''), description: String(c?.description ?? '') }))
      : [],
    theMarket: {
      targetAudience: Array.isArray(raw?.theMarket?.targetAudience) ? raw.theMarket.targetAudience : [],
      marketDynamics: String(raw?.theMarket?.marketDynamics ?? ''),
      marketSizeEstimate: String(raw?.theMarket?.marketSizeEstimate ?? ''),
      marketTrend: String(raw?.theMarket?.marketTrend ?? ''),
    },
    validationMetrics: {
      vitaminOrPainkiller: Number(raw?.validationMetrics?.vitaminOrPainkiller ?? 0),
      readyToSpend: Number(raw?.validationMetrics?.readyToSpend ?? 0),
      easyToConnect: Number(raw?.validationMetrics?.easyToConnect ?? 0),
      easyToMarket: Number(raw?.validationMetrics?.easyToMarket ?? 0),
    },
    overallScore: String(raw?.overallScore ?? ''),
    seoInsights: {
      relatedSearches,
      disclaimer: 'SEO insights are derived from SerpApi related searches and may vary over time.',
    },
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) });
  }

  try {
    let requestData: any = {};
    try {
      requestData = await req.json();
    } catch (parseError) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }
    
    const { ideaDescription, debug } = requestData;
    if (!ideaDescription || typeof ideaDescription !== 'string' || ideaDescription.length < 10) {
      return new Response(JSON.stringify({ error: 'Invalid ideaDescription' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const serpKey = Deno.env.get('SERPAPI_API_KEY');
    if (!geminiKey || !serpKey) {
      return new Response(JSON.stringify({ error: 'Missing GEMINI_API_KEY or SERPAPI_API_KEY' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    if (debug === true) {
      const diagnostics: Record<string, unknown> = { ok: true };
      try {
        const models = await listAvailableModels(geminiKey);
        diagnostics.modelsListed = Array.isArray(models) ? models.length : 0;
      } catch (e: any) {
        diagnostics.modelsListError = String(e?.message || e);
      }
      try {
        const test = await callGeminiWithFallback(geminiKey, 'Quick diagnostic: return a JSON object {"status":"ok"}');
        diagnostics.gemini = { ok: true, sampleKeys: Object.keys(test || {}) };
      } catch (e: any) {
        diagnostics.gemini = { ok: false, error: String(e?.message || e) };
      }
      try {
        const related = await fetchRelatedSearches(serpKey, 'diagnostic');
        diagnostics.serp = { ok: true, relatedCount: related.length };
      } catch (e: any) {
        diagnostics.serp = { ok: false, error: String(e?.message || e) };
      }
      return new Response(JSON.stringify({ diagnostics }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    } else {
      const [geminiJson, related] = await Promise.all([
        callGeminiWithFallback(geminiKey, ideaDescription),
        fetchRelatedSearches(serpKey, ideaDescription),
      ]);
      const report = normalizeToReport(geminiJson, related);
      return new Response(JSON.stringify(report), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
  }
});


