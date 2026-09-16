import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Plus,
  Loader2,
  Calculator,
  Utensils,
  CheckCircle2,
  MapPin,
  Globe,
  ExternalLink,
  Zap,
  BrainCircuit,
  RotateCcw,
  Navigation,
  Search,
} from 'lucide-react';
import { MenuItem } from '../types';
import { AssistantRole, MapSource, SearchSource } from '../server/geminiChatService';

interface AiOrderAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  menuItems: MenuItem[];
  onAddToCart: (item: MenuItem, quantity?: number, selectedVariant?: { label: string; price: number }) => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  roleType?: AssistantRole;
  modelUsed?: string;
  suggestedItems?: Array<{
    name: string;
    variant?: string;
    price: number;
    quantity: number;
  }>;
  calculatedTotal?: number;
  mapsSources?: MapSource[];
  searchSources?: SearchSource[];
  timestamp: number;
}

const ROLE_DEFINITIONS: Array<{
  id: AssistantRole;
  name: string;
  shortLabel: string;
  model: string;
  icon: React.ElementType;
  badge: string;
  description: string;
}> = [
  {
    id: 'general',
    name: "Menu & Order",
    shortLabel: 'Menu',
    model: 'gemini-3.5-flash',
    icon: Utensils,
    badge: 'gemini-3.5-flash',
    description: 'Ask menu questions, check prices in TZS & calculate total orders',
  },
  {
    id: 'maps',
    name: 'Maps & Branches',
    shortLabel: 'Maps Grounding',
    model: 'gemini-3.5-flash',
    icon: MapPin,
    badge: 'googleMaps tool',
    description: 'Grounded in Google Maps for branches, routes & Dar es Salaam locations',
  },
  {
    id: 'search',
    name: 'Live Web Trends',
    shortLabel: 'Search Grounding',
    model: 'gemini-3.5-flash',
    icon: Globe,
    badge: 'googleSearch tool',
    description: 'Grounded in Google Search for live food trends & ingredient market prices',
  },
  {
    id: 'complex',
    name: 'Strategy & Ops',
    shortLabel: 'Complex Ops',
    model: 'gemini-3.1-pro-preview',
    icon: BrainCircuit,
    badge: 'gemini-3.1-pro-preview',
    description: 'Executive recipe margins, labor productivity & expansion modeling',
  },
  {
    id: 'fast',
    name: 'Fast Answers',
    shortLabel: 'Express',
    model: 'gemini-3.1-flash-lite',
    icon: Zap,
    badge: 'gemini-3.1-flash-lite',
    description: 'Ultra-fast low-latency kitchen lookups and instant prep times',
  },
];

const PROMPTS_BY_ROLE: Record<AssistantRole, string[]> = {
  general: [
    'How much is Magharita Pizza Large?',
    'What sausages do you have and prices?',
    'Tell me about VIBOX combo boxes and prices',
    'What are the Crunchy Chicken options?',
    'Supu ya samaki na vyakula vya asili?',
    'Recommend a meal for 3 people with total',
  ],
  maps: [
    "Where is Olli's Pizza House flagship branch in Dar es Salaam?",
    'Nearest pickup spots in Mwenge, Sinza or Kinondoni?',
    'Do you deliver to Mikocheni, Mlimani City or Masaki?',
    'Show nearby branches and landmark directions',
    'How far is delivery from Mwenge to Kariakoo?',
  ],
  search: [
    'Current food & pizza trends in Tanzania 2026',
    'Market prices of mozzarella & baking ingredients in East Africa',
    'Popular Swahili fusion fast food trends in Dar es Salaam',
    'Healthy fast food & vegan topping options trending now',
  ],
  complex: [
    'Calculate profit margins and food cost for VIBOX combos',
    'Analyze kitchen staff shift productivity for peak weekend hours',
    'Ghost kitchen expansion feasibility for Arusha and Zanzibar',
    'Inventory shelf-life optimization for fresh mozzarella and meats',
  ],
  fast: [
    'Price of Russian Sausage?',
    'Price of 10 Pcs Crunchy Chicken Bucket?',
    'Prep time for Medium Pizza?',
    'Delivery fee standard rate?',
    'Is Biriani available today?',
  ],
};

export const AiOrderAssistantModal: React.FC<AiOrderAssistantModalProps> = ({
  isOpen,
  onClose,
  currency,
  menuItems,
  onAddToCart,
}) => {
  const [activeRole, setActiveRole] = useState<AssistantRole>('general');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      roleType: 'general',
      modelUsed: 'gemini-3.5-flash',
      text: "Karibu Olli's Pizza House & Take Aways! 👋\n\nI am your multi-capability Gemini AI Assistant. Choose an AI mode above:\n• **Menu & Order** (gemini-3.5-flash): Full menu queries, prices in TZS & 1-tap cart additions.\n• **Maps & Branches** (gemini-3.5-flash + Google Maps): Live location finding, directions & delivery ranges in Dar es Salaam.\n• **Live Web Trends** (gemini-3.5-flash + Google Search): Up-to-date food trends and ingredient market news.\n• **Strategy & Ops** (gemini-3.1-pro-preview): Deep recipe margins and restaurant operational analytics.\n• **Fast Answers** (gemini-3.1-flash-lite): Ultra-fast low-latency kitchen queries.\n\nHow may I help you today?",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  // Geolocation state for Maps Grounding
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'dar_es_salaam' | 'live_gps' | 'detecting'>('dar_es_salaam');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Geolocation request handler
  const handleRequestLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('dar_es_salaam');
      return;
    }
    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationStatus('live_gps');
      },
      () => {
        // Fallback to Dar es Salaam HQ
        setUserLocation({ latitude: -6.7924, longitude: 39.2083 });
        setLocationStatus('dar_es_salaam');
      },
      { timeout: 8000 }
    );
  };

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      roleType: activeRole,
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history (excluding initial greeting to ensure first turn is user)
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history,
          role: activeRole,
          userLocation: userLocation || { latitude: -6.7924, longitude: 39.2083 },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      const modelMsg: Message = {
        id: `model-${Date.now()}`,
        role: 'model',
        roleType: activeRole,
        modelUsed: data.modelUsed || 'gemini-3.5-flash',
        text: data.reply || "I've reviewed your inquiry against our database.",
        suggestedItems: data.suggestedItems,
        calculatedTotal: data.calculatedTotal,
        mapsSources: data.mapsSources,
        searchSources: data.searchSources,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      console.error('AI chat error:', err);
      // Fallback message
      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          roleType: activeRole,
          modelUsed: 'local_fallback',
          text: "Samahani! Olli's Pizza House serves fresh Pizzas, Crunchy Chicken (Kuku wa Ngano), Sausages, Burgers, and VIBOX Combos across Dar es Salaam. Please ask specifically about any dish, branch location, or order!",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItemToCart = (
    suggested: { name: string; variant?: string; price: number; quantity: number },
    index: number
  ) => {
    const matchedItem = menuItems.find(
      (m) =>
        m.name.toLowerCase() === suggested.name.toLowerCase() ||
        m.name.toLowerCase().includes(suggested.name.toLowerCase()) ||
        suggested.name.toLowerCase().includes(m.name.toLowerCase())
    );

    if (matchedItem) {
      let selectedVariant: { label: string; price: number } | undefined = undefined;
      if (suggested.variant && matchedItem.variants && matchedItem.variants.length > 0) {
        const found = matchedItem.variants.find(
          (v) => v.label.toLowerCase() === suggested.variant?.toLowerCase()
        );
        if (found) {
          selectedVariant = found;
        }
      }
      onAddToCart(matchedItem, suggested.quantity || 1, selectedVariant);
    } else {
      const fallbackItem: MenuItem = {
        id: `custom-ai-${Date.now()}`,
        name: suggested.name,
        category: 'Combo Packs & Boxes',
        stock: 50,
        icon: 'Utensils',
        price: suggested.price,
      };
      onAddToCart(fallbackItem, suggested.quantity || 1);
    }

    const key = `${suggested.name}-${suggested.variant || ''}-${index}`;
    setAddedItemIds((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [key]: false }));
    }, 2500);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        roleType: activeRole,
        modelUsed: activeRole === 'complex' ? 'gemini-3.1-pro-preview' : activeRole === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash',
        text: `Conversation reset. Switched to **${ROLE_DEFINITIONS.find((r) => r.id === activeRole)?.name}**.\n\nHow can I help you right now?`,
        timestamp: Date.now(),
      },
    ]);
  };

  const currentRoleConfig = ROLE_DEFINITIONS.find((r) => r.id === activeRole) || ROLE_DEFINITIONS[0];

  return (
    <div
      id="ai-order-assistant-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="ai-order-assistant-modal"
        className="relative flex flex-col w-full max-w-3xl h-[92vh] max-h-[780px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#d6e0db]"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#173e31] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Olli's Gemini AI Concierge</h3>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-400/20 text-emerald-200 rounded-full border border-emerald-400/30">
                  {currentRoleConfig.badge}
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 line-clamp-1">
                {currentRoleConfig.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-xs"
              title="Reset conversation history"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              id="close-ai-assistant-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role & Grounding Navigation Bar */}
        <div className="px-3 py-2 bg-[#f0f4f2] border-b border-[#dce5e0] flex flex-wrap items-center justify-between gap-2">
          {/* Role selector pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {ROLE_DEFINITIONS.map((def) => {
              const IconComp = def.icon;
              const isActive = activeRole === def.id;
              return (
                <button
                  key={def.id}
                  id={`ai-role-tab-${def.id}`}
                  onClick={() => setActiveRole(def.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#173e31] text-white shadow-xs'
                      : 'bg-white text-[#384b42] border border-[#d2ded8] hover:bg-[#e4ede7]'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-[#173e31]'}`} />
                  <span>{def.name}</span>
                  {def.id === 'maps' && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">
                      Maps
                    </span>
                  )}
                  {def.id === 'search' && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-200">
                      Search
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Location status for Maps Grounding */}
          {activeRole === 'maps' && (
            <button
              onClick={handleRequestLiveLocation}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 transition-colors shrink-0"
              title="Click to detect GPS location for Maps Grounding"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {locationStatus === 'live_gps'
                  ? '📍 GPS: Live Coordinates'
                  : locationStatus === 'detecting'
                  ? 'Detecting Location...'
                  : '📍 Base: Dar es Salaam HQ'}
              </span>
            </button>
          )}
        </div>

        {/* Quick Prompts Carousel */}
        <div className="px-4 py-2 bg-[#f8faf9] border-b border-[#e5ece8] overflow-x-auto no-scrollbar flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#173e31] shrink-0" />
          <span className="text-[11px] font-bold text-[#55695f] uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {PROMPTS_BY_ROLE[activeRole]?.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="text-xs px-3 py-1 rounded-full bg-white border border-[#d1ded6] text-[#2c3e35] hover:bg-[#173e31] hover:text-white hover:border-[#173e31] transition-colors shrink-0 whitespace-nowrap shadow-xs disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages Body (Scrollable Thread) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fafbfb]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Role badge for model responses */}
              {msg.role === 'model' && (
                <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-[#5a6c61]">
                  <Bot className="w-3.5 h-3.5 text-[#173e31]" />
                  <span>Olli's Assistant</span>
                  {msg.modelUsed && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[#e7eee9] text-[#2c4035]">
                      {msg.modelUsed}
                    </span>
                  )}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-[#173e31] text-white rounded-br-xs'
                    : 'bg-white text-[#1f2d26] border border-[#e2e8e4] rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>

              {/* Google Maps Grounding Links */}
              {msg.mapsSources && msg.mapsSources.length > 0 && (
                <div className="mt-2.5 max-w-[88%] w-full bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 shadow-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Google Maps Grounded Locations & Places:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.mapsSources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start justify-between p-2.5 rounded-lg bg-white border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors group shadow-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-bold text-emerald-950 group-hover:text-emerald-700 truncate">
                            {source.title}
                          </div>
                          {source.snippet && (
                            <p className="text-[11px] text-[#55695f] line-clamp-2 mt-0.5">
                              "{source.snippet}"
                            </p>
                          )}
                          <span className="text-[10px] text-emerald-600 font-medium inline-flex items-center gap-0.5 mt-1">
                            Open in Google Maps
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Google Search Grounding Sources */}
              {msg.searchSources && msg.searchSources.length > 0 && (
                <div className="mt-2.5 max-w-[88%] w-full bg-blue-50/80 border border-blue-200 rounded-xl p-3 shadow-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>Google Search Grounded Web Sources:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msg.searchSources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-xs font-medium text-blue-900 transition-colors group shadow-xs"
                      >
                        <Search className="w-3 h-3 text-blue-500" />
                        <span className="truncate max-w-[220px]">{source.title}</span>
                        <ExternalLink className="w-3 h-3 text-blue-400 group-hover:text-blue-600 ml-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Calculated Order Total Card */}
              {msg.calculatedTotal !== undefined && msg.calculatedTotal > 0 && (
                <div className="mt-2.5 max-w-[88%] w-full bg-emerald-50 border border-emerald-300/80 rounded-xl p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-900 text-xs font-bold">
                      <Calculator className="w-4 h-4 text-emerald-600" />
                      <span>Calculated Bill / Order Total:</span>
                    </div>
                    <span className="text-base font-bold text-emerald-900">
                      {currency} {msg.calculatedTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Suggested Menu Items (1-Tap Cart Addition) */}
              {msg.suggestedItems && msg.suggestedItems.length > 0 && (
                <div className="mt-2.5 max-w-[88%] w-full space-y-1.5">
                  <span className="text-[11px] font-bold text-[#55695f] uppercase tracking-wider block">
                    Recommended Dishes (1-Tap Add To Order):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.suggestedItems.map((item, idx) => {
                      const key = `${item.name}-${item.variant || ''}-${idx}`;
                      const isAdded = !!addedItemIds[key];

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-white border border-[#d6e0db] rounded-xl hover:border-[#173e31] transition-colors shadow-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="text-xs font-bold text-[#1f2d26] truncate">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-[#697a70]">
                              {item.variant ? `${item.variant} • ` : ''}
                              <span className="font-semibold text-[#173e31]">
                                {currency} {item.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddItemToCart(item, idx)}
                            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0 transition-all ${
                              isAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#173e31] text-white hover:bg-[#112d24]'
                            }`}
                            title="Add item to your order"
                          >
                            {isAdded ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="text-[10px]">Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span className="text-[10px]">Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#55695f] bg-white border border-[#e2e8e4] px-4 py-3 rounded-2xl w-fit shadow-xs animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-[#173e31]" />
              <span>
                {activeRole === 'maps'
                  ? 'Querying Google Maps grounding for locations & routes...'
                  : activeRole === 'search'
                  ? 'Searching live web data with Google Search grounding...'
                  : activeRole === 'complex'
                  ? 'Generating strategic operational & margin models with gemini-3.1-pro-preview...'
                  : activeRole === 'fast'
                  ? 'Fast lightning response via gemini-3.1-flash-lite...'
                  : "Checking Olli's menu and pricing in TZS..."}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-[#e2e8e4]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              id="ai-assistant-chat-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                activeRole === 'maps'
                  ? 'Ask about Olli\'s branches, landmarks, delivery routes...'
                  : activeRole === 'search'
                  ? 'Search live culinary trends, ingredient prices, news...'
                  : activeRole === 'complex'
                  ? 'Request profit margin analysis, shift formulas, growth models...'
                  : activeRole === 'fast'
                  ? 'Quick price or item lookup...'
                  : 'Ask about pizzas, sausages, VIBOX combos, or calculate total...'
              }
              className="flex-1 px-4 py-2.5 text-sm bg-[#f4f7f5] border border-[#d6e0db] rounded-xl focus:outline-none focus:border-[#173e31] focus:bg-white transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              id="ai-assistant-send-btn"
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2.5 bg-[#173e31] text-white rounded-xl font-medium text-sm hover:bg-[#112d24] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          <div className="mt-1.5 flex flex-wrap items-center justify-between text-[11px] text-[#7a8a80] px-1 gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              {currentRoleConfig.name} ({currentRoleConfig.model})
            </span>
            <span>English & Swahili • TZS Currency • Server-Side Gemini API</span>
          </div>
        </div>
      </div>
    </div>
  );
};
