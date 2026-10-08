import { GoogleGenAI } from '@google/genai';
import { AI_ORDER_ASSISTANT_SYSTEM_INSTRUCTION } from '../data/menuDatabase.ts';
import { generateFallbackAiOrderResponse } from './aiAssistant.ts';

export type AssistantRole = 'general' | 'maps' | 'search' | 'complex' | 'fast';

export interface ChatHistoryMessage {
  role: 'user' | 'model';
  text: string;
}

export interface MapSource {
  title: string;
  uri: string;
  snippet?: string;
}

export interface SearchSource {
  title: string;
  uri: string;
}

export interface ChatServiceRequest {
  message: string;
  history?: ChatHistoryMessage[];
  role?: AssistantRole;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface ChatServiceResponse {
  success: boolean;
  reply: string;
  role: AssistantRole;
  modelUsed: string;
  suggestedItems?: Array<{
    name: string;
    variant?: string;
    price: number;
    quantity: number;
  }>;
  calculatedTotal?: number;
  mapsSources?: MapSource[];
  searchSources?: SearchSource[];
  source: 'gemini' | 'local_fallback';
  error?: string;
}

// Default Restaurant Coordinates (Dar es Salaam HQ)
const DEFAULT_RESTAURANT_LOCATION = {
  latitude: -6.7924,
  longitude: 39.2083,
};

// System instructions per role
const SYSTEM_INSTRUCTIONS: Record<AssistantRole, string> = {
  general: `${AI_ORDER_ASSISTANT_SYSTEM_INSTRUCTION}

You are the General Restaurant Concierge & Order Specialist for Olli's Pizza House & Take Aways.
Always welcome customers with warm hospitality (Karibu Olli's Pizza House!), answer menu and pricing questions in TZS, calculate totals, suggest delicious pairings, and support both English and Swahili fluently.`,

  maps: `You are the official Google Maps Navigator & Branch Guide for OLLI'S PIZZA HOUSE & TAKE AWAYS in Tanzania.
Your primary base is in Dar es Salaam, Tanzania (Mwenge, Sinza, Kinondoni, Mikocheni, Kariakoo, Mlimani City, City Centre, and surrounding regions).
When users ask about:
- Restaurant branches, physical locations, or nearby pickup spots
- Delivery coverage, distances, travel times, or route directions
- Landmarks, cross-streets, or neighboring amenities
Use your grounded Google Maps data to provide precise geographic details, branch information, and helpful transit guidance.
Always be welcoming in English or Swahili (e.g. "Karibu Olli's Pizza House!"), state prices in TZS if mentioning food, and suggest the nearest branch for pickup or delivery.`,

  search: `You are the Live Web Intelligence & Food Trend Researcher for OLLI'S PIZZA HOUSE & TAKE AWAYS.
Use Google Search grounding to discover real-time up-to-date information:
- Current viral pizza topping trends, crust innovations, and street-food combos across Africa and globally
- Current commodity prices (cheese, flour, cooking oil, spices) and food market trends in Tanzania and East Africa
- Local events, holidays, celebrations, and catering ideas in Dar es Salaam
- Dietary guidelines, halal considerations, and hygiene standards
Provide fresh, factual information grounded with live web findings, and explain how it applies to our restaurant menu and customers. Greet customers warmly in English or Swahili.`,

  complex: `You are the Chief Financial & Operations Strategist (CFO/COO) for OLLI'S PIZZA HOUSE & TAKE AWAYS.
You handle complex culinary operations, financial modeling, and strategic management:
- Deep breakdown of recipe costing, food cost percentages (target 28-32%), and contribution margins in Tanzanian Shillings (TZS)
- Comparative profitability across our menu categories (Pizzas vs VIBOX combo packs vs Crunchy Chicken vs Sausages)
- Staff shift productivity, peak-hour order capacity planning, and kitchen prep throughput formulas
- Multi-branch expansion feasibility, ghost kitchen operations, and supply chain inventory turnover
Deliver high-level, mathematically structured, rigorous executive insights with clear step-by-step reasoning and actionable recommendations.`,

  fast: `You are the Express Kitchen Dispatcher for OLLI'S PIZZA HOUSE & TAKE AWAYS.
SPEED AND BREVITY ARE PARAMOUNT:
- Deliver lightning-fast, ultra-concise answers (1 to 3 sentences maximum or a quick bullet list).
- Give exact prices in TZS, prep times, sizes, or stock status instantly without conversational pleasantries.
- Fast, sharp, and direct.`,
};

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function processAiChatMessage(
  request: ChatServiceRequest
): Promise<ChatServiceResponse> {
  const role: AssistantRole = request.role || 'general';
  const query = (request.message || '').trim();

  if (!query) {
    return {
      success: false,
      reply: 'Please provide a message or inquiry.',
      role,
      modelUsed: 'none',
      source: 'local_fallback',
    };
  }

  const ai = getGeminiClient();

  // If no Gemini client is available, use local deterministic fallback
  if (!ai) {
    const fallback = generateFallbackForRole(role, query);
    return {
      success: true,
      reply: fallback.reply,
      role,
      modelUsed: 'local_fallback_engine',
      suggestedItems: fallback.suggestedItems,
      calculatedTotal: fallback.calculatedTotal,
      mapsSources: fallback.mapsSources,
      searchSources: fallback.searchSources,
      source: 'local_fallback',
    };
  }

  // Model selection per role specification:
  // - Maps Grounding: gemini-3.5-flash with googleMaps tool
  // - Search Grounding: gemini-3.5-flash with googleSearch tool
  // - Complex tasks: gemini-3.1-pro-preview (with fallback)
  // - Fast tasks: gemini-3.1-flash-lite
  // - General tasks: gemini-3.5-flash
  let primaryModel = 'gemini-3.5-flash';
  if (role === 'complex') {
    primaryModel = 'gemini-3.1-pro-preview';
  } else if (role === 'fast') {
    primaryModel = 'gemini-3.1-flash-lite';
  } else if (role === 'maps' || role === 'search' || role === 'general') {
    primaryModel = 'gemini-3.5-flash';
  }

  // Prepare multi-turn contents
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  if (Array.isArray(request.history) && request.history.length > 0) {
    // Gemini multi-turn contents must begin with a user turn
    const cleanHistory = request.history.slice(-8);
    let hasEncounteredFirstUser = false;

    for (const h of cleanHistory) {
      if (!hasEncounteredFirstUser && h.role !== 'user') {
        continue; // Skip greeting/model messages until the first user turn
      }
      hasEncounteredFirstUser = true;
      contents.push({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }],
      });
    }
  }

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: query }],
  });

  // Prepare tool and generation configuration
  const config: any = {
    systemInstruction: SYSTEM_INSTRUCTIONS[role],
    temperature: role === 'complex' ? 0.4 : role === 'fast' ? 0.2 : 0.4,
  };

  if (role === 'maps') {
    config.tools = [{ googleMaps: {} }];
    const location = request.userLocation || DEFAULT_RESTAURANT_LOCATION;
    config.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      },
    };
    // CRITICAL: DO NOT set responseMimeType or responseSchema with googleMaps
  } else if (role === 'search') {
    config.tools = [{ googleSearch: {} }];
  }

  try {
    let responseText = '';
    let modelUsed = primaryModel;
    let rawResponse: any = null;

    try {
      rawResponse = await ai.models.generateContent({
        model: primaryModel,
        contents,
        config,
      });
      responseText = rawResponse.text || '';
    } catch (primaryErr: any) {
      // If complex model (gemini-3.1-pro-preview) encounters quota or access limitation,
      // gracefully fall back to gemini-3.8-flash
      if (role === 'complex') {
        console.warn('Fallback from gemini-3.1-pro-preview to gemini-3.8-flash:', primaryErr?.message);
        modelUsed = 'gemini-3.8-flash';
        rawResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config,
        });
        responseText = rawResponse.text || '';
      } else {
        throw primaryErr;
      }
    }

    if (!responseText) {
      responseText = "Karibu Olli's Pizza House! How can I help you today?";
    }

    // Extract Grounding Chunks (Maps & Search)
    const mapsSources: MapSource[] = [];
    const searchSources: SearchSource[] = [];

    const groundingChunks = rawResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        // Maps grounding extraction
        if (chunk.maps) {
          const uri = chunk.maps.uri || '';
          const title = chunk.maps.title || 'Google Maps Location';
          let snippet: string | undefined = undefined;
          if (Array.isArray(chunk.maps.placeAnswerSources?.reviewSnippets) && chunk.maps.placeAnswerSources.reviewSnippets.length > 0) {
            snippet = chunk.maps.placeAnswerSources.reviewSnippets[0].reviewText || undefined;
          }
          if (uri && !mapsSources.some((s) => s.uri === uri)) {
            mapsSources.push({ title, uri, snippet });
          }
        }

        // Web search grounding extraction
        if (chunk.web) {
          const uri = chunk.web.uri || '';
          const title = chunk.web.title || 'Web Source';
          if (uri && !searchSources.some((s) => s.uri === uri)) {
            searchSources.push({ title, uri });
          }
        }
      }
    }

    // Extract optional JSON block for suggested items & calculated total
    let suggestedItems: any[] | undefined = undefined;
    let calculatedTotal: number | undefined = undefined;
    let cleanReply = responseText;

    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (Array.isArray(parsed.suggestedItems)) {
          suggestedItems = parsed.suggestedItems;
        }
        if (typeof parsed.calculatedTotal === 'number') {
          calculatedTotal = parsed.calculatedTotal;
        }
        cleanReply = responseText.replace(/```json[\s\S]*?```/, '').trim();
      } catch {
        // Keep full response text if JSON parse fails
      }
    }

    return {
      success: true,
      reply: cleanReply,
      role,
      modelUsed,
      suggestedItems,
      calculatedTotal,
      mapsSources: mapsSources.length > 0 ? mapsSources : undefined,
      searchSources: searchSources.length > 0 ? searchSources : undefined,
      source: 'gemini',
    };
  } catch (error: any) {
    console.error(`Gemini AI Chat Error [role: ${role}]:`, error);
    const fallback = generateFallbackForRole(role, query);
    return {
      success: true,
      reply: fallback.reply,
      role,
      modelUsed: 'local_fallback_after_error',
      suggestedItems: fallback.suggestedItems,
      calculatedTotal: fallback.calculatedTotal,
      mapsSources: fallback.mapsSources,
      searchSources: fallback.searchSources,
      source: 'local_fallback',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Deterministic fallback generator for each role
 */
function generateFallbackForRole(role: AssistantRole, query: string) {
  if (role === 'maps') {
    return {
      reply: `📍 **Olli's Pizza House & Take Aways Locations (Tanzania):**\n\n• **Main Flagship Branch & Kitchen:** Mwenge / Sinza Commercial Hub, Dar es Salaam.\n• **Pickup & Express Takeaways:** Kinondoni & Mlimani City corridor.\n• **Delivery Reach:** Full delivery coverage across Dar es Salaam (Mikocheni, Masaki, Oysterbay, Kariakoo, Upanga, Tegeta, and Mbezi Beach).\n• **Operating Hours:** 10:00 AM – 11:30 PM Daily.\n\nCall / WhatsApp: +255 712 345 678 for express dispatch!`,
      mapsSources: [
        {
          title: "Olli's Pizza House - Dar es Salaam Hub",
          uri: 'https://maps.google.com/?q=Dar+es+Salaam+Tanzania',
          snippet: "Official takeaway and pizza kitchen in Dar es Salaam, Tanzania.",
        },
        {
          title: 'Mlimani City & Mwenge Commercial Zone',
          uri: 'https://maps.google.com/?q=Mlimani+City+Dar+es+Salaam',
          snippet: 'Fast express delivery central dispatch hub.',
        },
      ],
    };
  }

  if (role === 'search') {
    return {
      reply: `🌐 **Live Culinary & Market Insights (Tanzania & East Africa):**\n\n• **Top Trends:** Wood-fired artisanal crusts, Swahili fusion toppings (Mshikaki beef skewers on pizza, Pilau herb infused butter crust), and premium loaded VIBOX combos.\n• **Dairy & Ingredients:** Mozzarella supply from local Arusha/Tanga dairy farms remains stable; fresh tomato paste and herbs sourced daily.\n• **Customer Favorites:** Crunchy Chicken (Kuku wa Ngano) buckets and Russian spicy sausages continue leading express orders.`,
      searchSources: [
        {
          title: 'Tanzania Food & Restaurant Trends 2026',
          uri: 'https://www.google.com/search?q=tanzania+food+restaurant+trends',
        },
        {
          title: 'Dar es Salaam Fast Food Market Growth',
          uri: 'https://www.google.com/search?q=dar+es+salaam+pizza+takeaway+market',
        },
      ],
    };
  }

  if (role === 'complex') {
    return {
      reply: `📊 **Executive Operations & Recipe Margin Analysis:**\n\n1. **High Margin Anchors:**\n• **Pizzas (Magharita & Sausage):** Target Food Cost: 24% - 28% | Gross Margin: ~74%.\n• **Crunchy Chicken Buckets (10 & 15 Pcs):** Food Cost: ~30% | High volume driver.\n• **VIBOX Combos (#1 - #10):** Engineered for 35% margin with maximum perceived customer value.\n\n2. **Labor & Peak Hour Flow:**\n• Peak demand: 12:30 PM – 2:30 PM (lunch rush) & 6:30 PM – 9:30 PM (evening delivery).\n• Recommendation: Cross-train kitchen staff between dough stretching and fryer dispatch to maintain < 18 min prep time.`,
    };
  }

  if (role === 'fast') {
    return {
      reply: `⚡ **Quick Check:**\n• Magharita Pizza: Small 8k / Med 12k / Large 15k TZS\n• Sausage Pizza: Small 10k / Med 15k / Large 25k TZS\n• Crunchy Chicken: 2 Pcs 5k / 4 Pcs 10k / Bucket 10 Pcs 22k TZS\n• Prep Time: 15 - 20 mins. Kitchen Ready!`,
      calculatedTotal: 15000,
    };
  }

  // General role fallback
  const orderFallback = generateFallbackAiOrderResponse(query);
  return {
    reply: orderFallback.reply,
    suggestedItems: orderFallback.suggestedItems,
    calculatedTotal: orderFallback.calculatedTotal,
  };
}
