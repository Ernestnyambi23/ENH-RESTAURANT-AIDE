import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  Sparkles,
  Flame,
  Star,
  Pizza,
  Sandwich,
  Drumstick,
  Utensils,
  CupSoda,
  AlertCircle,
  X,
  ChefHat,
  ShoppingBag,
  ArrowRight,
  Camera,
  Edit2,
  Image as ImageIcon,
  Bot,
  CookingPot,
  Package,
  Salad,
} from 'lucide-react';
import { MenuItem, CartItem, Variant } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CustomerMenuProps {
  items: MenuItem[];
  cart: CartItem[];
  currency: string;
  isAdminUnlocked?: boolean;
  onAddToCart: (item: MenuItem, variant?: Variant, specialInstructions?: string) => void;
  onUpdateCartQuantity: (cartItemId: string, newQty: number) => void;
  onOpenCart: () => void;
  onSelectItemForCustomization: (item: MenuItem) => void;
  onEditDish?: (item: MenuItem) => void;
  onChangeDishImage?: (item: MenuItem) => void;
  onOpenAiAssistant?: () => void;
}

const CATEGORIES = [
  'All',
  'Pizza',
  'Sausages',
  'Burgers & Sandwiches',
  'Chicken & Meat',
  'Sides & Snacks',
  'Soups & Local Meals',
  'Salads',
  'Combo Packs & Boxes',
  'Drinks & Milkshakes',
  'Groceries & Extras',
];

export const CustomerMenu: React.FC<CustomerMenuProps> = ({
  items,
  cart,
  currency,
  isAdminUnlocked = false,
  onAddToCart,
  onUpdateCartQuantity,
  onOpenCart,
  onSelectItemForCustomization,
  onEditDish,
  onChangeDishImage,
  onOpenAiAssistant,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter items based on category and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  // Cart count & total
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  // Helper to get total qty of a menuItem currently in cart
  const getMenuItemQuantityInCart = (itemId: string): number => {
    return cart
      .filter((c) => c.menuItemId === itemId)
      .reduce((acc, c) => acc + c.quantity, 0);
  };

  // Helper to render icon for dish
  const renderItemIcon = (category: string) => {
    switch (category) {
      case 'Sausages':
        return <Flame className="w-5 h-5 text-[#c2410c]" />;
      case 'Pizza':
        return <Pizza className="w-5 h-5 text-[#1f4d3e]" />;
      case 'Burgers & Sandwiches':
        return <Sandwich className="w-5 h-5 text-[#1f4d3e]" />;
      case 'Chicken & Meat':
      case 'Chicken':
        return <Drumstick className="w-5 h-5 text-[#1f4d3e]" />;
      case 'Sides & Snacks':
      case 'Sides & Extras':
        return <Utensils className="w-5 h-5 text-[#1f4d3e]" />;
      case 'Soups & Local Meals':
        return <CookingPot className="w-5 h-5 text-[#1f4d3e]" />;
      case 'Salads':
        return <Salad className="w-5 h-5 text-[#16a34a]" />;
      case 'Combo Packs & Boxes':
      case 'Meals & Plates':
        return <Package className="w-5 h-5 text-[#d97706]" />;
      case 'Drinks & Milkshakes':
      case 'Drinks':
        return <CupSoda className="w-5 h-5 text-[#0284c7]" />;
      case 'Groceries & Extras':
        return <ShoppingBag className="w-5 h-5 text-[#7c3aed]" />;
      default:
        return <Utensils className="w-5 h-5 text-[#1f4d3e]" />;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* AI Order Assistant Card */}
      {onOpenAiAssistant && (
        <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-[#1f4d3e] to-[#14352b] text-white rounded-2xl shadow-sm border border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-emerald-200">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <span>AI Order Assistant</span>
                <span className="px-1.5 py-0.2 text-[9px] bg-emerald-400 text-black font-extrabold rounded">
                  NEW MENU
                </span>
              </h4>
              <p className="text-xs text-emerald-100/80">
                Ask dish questions, prices in TZS, or calculate your order total
              </p>
            </div>
          </div>
          <button
            type="button"
            id="open-ai-assistant-banner-btn"
            onClick={onOpenAiAssistant}
            className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs rounded-xl shadow-sm transition-all shrink-0 flex items-center gap-1 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chat AI</span>
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b978f]" />
        <input
          type="text"
          id="menu-search-input"
          placeholder="Search pizzas, sausages, chicken, burgers, VIBOX..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 bg-white border border-[#e2e4dc] rounded-xl text-sm placeholder-[#8b978f] focus:outline-none focus:border-[#1f4d3e] focus:ring-1 focus:ring-[#1f4d3e] transition-all shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b978f] hover:text-[#1b2620]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Chips Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              id={`cat-chip-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all shadow-2xs ${
                isActive
                  ? 'bg-[#1f4d3e] text-white shadow-sm'
                  : 'bg-white text-[#4c5a52] border border-[#e2e4dc] hover:border-[#1f4d3e]/40'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Items Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#8b978f]">
            {selectedCategory === 'All' ? 'Full Menu' : selectedCategory} ({filteredItems.length})
          </h2>
          {selectedCategory !== 'All' && (
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-semibold text-[#1f4d3e] hover:underline"
            >
              View All
            </button>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#e2e4dc] p-6">
            <Utensils className="w-10 h-10 text-[#8b978f] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-[#4c5a52]">No dishes match your search</p>
            <p className="text-xs text-[#8b978f] mt-1">Try searching for different keywords</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-3 px-4 py-1.5 rounded-lg bg-[#1f4d3e] text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const hasVariants = Boolean(item.variants && item.variants.length > 0);
            const isOutOfStock = item.stock <= 0;
            const isLowStock = item.stock > 0 && item.stock <= 5;
            const qtyInCart = getMenuItemQuantityInCart(item.id);

            return (
              <div
                key={item.id}
                id={`item-card-${item.id}`}
                className={`bg-white border rounded-2xl p-3.5 transition-all shadow-xs ${
                  isOutOfStock
                    ? 'border-[#e2e4dc] opacity-70 bg-gray-50/50'
                    : 'border-[#e2e4dc] hover:border-[#1f4d3e]/30'
                }`}
              >
                <div className="flex gap-3 items-start">
                  {/* Dish Image Box with Admin Clickable Photo Changer */}
                  <div
                    onClick={() => {
                      if (isAdminUnlocked && (onChangeDishImage || onEditDish)) {
                        if (onChangeDishImage) onChangeDishImage(item);
                        else if (onEditDish) onEditDish(item);
                      }
                    }}
                    className={`relative group w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-[#e3ede8] border border-[#1f4d3e]/15 flex items-center justify-center shrink-0 shadow-2xs transition-all ${
                      isAdminUnlocked ? 'cursor-pointer hover:ring-2 hover:ring-[#1f4d3e]' : ''
                    }`}
                    title={isAdminUnlocked ? 'Admin: Click to attach or change dish photo' : item.name}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#1f4d3e]">
                        {renderItemIcon(item.category)}
                      </div>
                    )}

                    {/* Admin Photo Overlay Trigger */}
                    {isAdminUnlocked && (
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                        <Camera className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase mt-0.5">Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-[15px] font-bold text-[#1b2620] leading-snug">
                        {item.name}
                      </h3>
                      {item.isChefSpecial && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#f7e9d6] text-[#c8791f] border border-[#c8791f]/20">
                          <ChefHat className="w-2.5 h-2.5" /> Chef Special
                        </span>
                      )}
                      {item.isSpicy && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#f6e2de] text-[#b3402f] border border-[#b3402f]/20">
                          <Flame className="w-2.5 h-2.5" /> Spicy
                        </span>
                      )}
                      {item.isPopular && !item.isChefSpecial && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Popular
                        </span>
                      )}

                      {/* Admin Quick Edit Pencil Button */}
                      {isAdminUnlocked && onEditDish && (
                        <button
                          type="button"
                          id={`admin-edit-dish-${item.id}`}
                          onClick={() => onEditDish(item)}
                          className="ml-auto p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold flex items-center gap-1 transition-all shadow-2xs"
                          title="Admin: Edit dish name, price & photo"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Edit Dish</span>
                        </button>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-[12.5px] text-[#8b978f] mt-1 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Price and Stock status row */}
                    <div className="flex items-center justify-between mt-2.5 flex-wrap gap-2">
                      <div>
                        {hasVariants ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-[11.5px] text-[#8b978f]">From</span>
                            <span className="text-[14.5px] font-extrabold text-[#143529]">
                              {formatCurrency(
                                Math.min(...item.variants!.map((v) => v.price)),
                                currency
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[14.5px] font-extrabold text-[#143529]">
                            {formatCurrency(item.price || 0, currency)}
                          </span>
                        )}

                        <div className="text-[11px] mt-0.5 font-semibold">
                          {isOutOfStock ? (
                            <span className="text-[#b3402f] flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Sold Out
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[#c8791f]">
                              Only {item.stock} left in stock
                            </span>
                          ) : (
                            <span className="text-[#8b978f]">{item.stock} available</span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {isOutOfStock ? (
                          <button
                            disabled
                            className="px-3 py-1.5 rounded-lg bg-gray-100 text-[#8b978f] text-xs font-bold cursor-not-allowed"
                          >
                            Unavailable
                          </button>
                        ) : hasVariants ? (
                          <button
                            type="button"
                            id={`choose-size-btn-${item.id}`}
                            onClick={() => onSelectItemForCustomization(item)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] transition-all shadow-xs flex items-center gap-1"
                          >
                            <span>Choose Size</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : qtyInCart > 0 ? (
                          <div className="flex items-center gap-2 bg-[#e3ede8] p-1 rounded-xl border border-[#1f4d3e]/20">
                            <button
                              type="button"
                              onClick={() => {
                                const cartItem = cart.find((c) => c.menuItemId === item.id);
                                if (cartItem) {
                                  onUpdateCartQuantity(cartItem.id, cartItem.quantity - 1);
                                }
                              }}
                              className="w-7 h-7 rounded-lg bg-white text-[#143529] font-bold flex items-center justify-center shadow-2xs hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-extrabold text-[#143529] px-1 min-w-[16px] text-center">
                              {qtyInCart}
                            </span>
                            <button
                              type="button"
                              disabled={qtyInCart >= item.stock}
                              onClick={() => onAddToCart(item)}
                              className="w-7 h-7 rounded-lg bg-[#1f4d3e] text-white font-bold flex items-center justify-center shadow-2xs hover:bg-[#143529] transition-colors disabled:opacity-40"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            id={`add-btn-${item.id}`}
                            onClick={() => onAddToCart(item)}
                            className="w-9 h-9 rounded-xl border-1.5 border-[#1f4d3e] text-[#143529] bg-white hover:bg-[#e3ede8] transition-colors flex items-center justify-center font-bold shadow-xs"
                          >
                            <Plus className="w-5 h-5 stroke-[2.5]" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inline Variant Options for Quick Add */}
                {hasVariants && (
                  <div className="mt-3 pt-2.5 border-t border-dashed border-[#e2e4dc] space-y-1.5">
                    {item.variants!.map((v) => {
                      const variantCartKey = `${item.id}_${v.label}`;
                      const cartMatch = cart.find((c) => c.id === variantCartKey);
                      const varQty = cartMatch ? cartMatch.quantity : 0;

                      return (
                        <div
                          key={v.label}
                          className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-[#f4f5f0]/80 transition-colors text-xs"
                        >
                          <span className="font-semibold text-[#4c5a52]">
                            {v.label}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-[#143529]">
                              {formatCurrency(v.price, currency)}
                            </span>
                            {varQty > 0 ? (
                              <div className="flex items-center gap-1.5 bg-[#e3ede8] p-0.5 rounded-lg">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateCartQuantity(variantCartKey, varQty - 1)
                                  }
                                  className="w-5 h-5 rounded bg-white text-[#143529] flex items-center justify-center font-bold"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-extrabold text-xs text-[#143529] px-1">
                                  {varQty}
                                </span>
                                <button
                                  type="button"
                                  disabled={varQty >= item.stock}
                                  onClick={() => onAddToCart(item, v)}
                                  className="w-5 h-5 rounded bg-[#1f4d3e] text-white flex items-center justify-center font-bold disabled:opacity-40"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={isOutOfStock}
                                onClick={() => onAddToCart(item, v)}
                                className="px-2.5 py-1 rounded-md border border-[#1f4d3e] text-[#143529] font-bold text-[11px] hover:bg-[#1f4d3e] hover:text-white transition-colors"
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Cart Quick Bar when items exist in cart */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl z-25 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <button
            type="button"
            id="floating-cart-bar-btn"
            onClick={onOpenCart}
            className="w-full bg-[#143529] text-white rounded-2xl p-3.5 px-4 flex items-center justify-between shadow-[0_8px_24px_rgba(20,53,41,0.35)] border border-emerald-900 hover:bg-[#102d23] transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="bg-[#c8791f] text-white text-xs font-extrabold px-2.5 py-1 rounded-full">
                {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
              </span>
              <span className="text-sm font-semibold text-[#cfe0d7]">
                View Order
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-extrabold text-white">
                {formatCurrency(cartSubtotal, currency)}
              </span>
              <ArrowRight className="w-4 h-4 text-[#cfe0d7]" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
