import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Camera,
  Upload,
  DollarSign,
} from 'lucide-react';
import { MenuItem, Variant } from '../types';
import { FOOD_IMAGE_PRESETS, compressImageFile } from '../utils/imageUtils';

interface NewItemModalProps {
  onClose: () => void;
  onSave: (newItem: MenuItem) => void;
  currency: string;
  restaurantId?: string;
  restaurantName?: string;
  existingCategories?: string[];
}

const DEFAULT_CATEGORIES = [
  'Pizza',
  'BBQ & Grills',
  'Burgers & Sandwiches',
  'Chicken & Meat',
  'Swahili Seafood',
  'Curries & Stews',
  'Sides & Snacks',
  'Platters & Combos',
  'Drinks & Milkshakes',
  'Beverages & Juices',
  'Saturday Special',
];

export const NewItemModal: React.FC<NewItemModalProps> = ({
  onClose,
  onSave,
  currency,
  restaurantId = 'ollis-pizza',
  restaurantName = "Olli's Pizza House",
  existingCategories = [],
}) => {
  const mergedCategories = React.useMemo(() => {
    const list = Array.from(new Set([...existingCategories.filter(Boolean), ...DEFAULT_CATEGORIES]));
    return list;
  }, [existingCategories]);

  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>(() => mergedCategories[0] || 'Mains');
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState<boolean>(false);
  const [stock, setStock] = useState<number>(20);
  const [description, setDescription] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [useVariants, setUseVariants] = useState<boolean>(false);
  const [basePrice, setBasePrice] = useState<number>(10000);
  const [variants, setVariants] = useState<Variant[]>([
    { label: 'Small', price: 10000 },
    { label: 'Medium', price: 15000 },
    { label: 'Large', price: 20000 },
  ]);
  const [isPopular, setIsPopular] = useState<boolean>(false);
  const [isSpicy, setIsSpicy] = useState<boolean>(false);
  const [isChefSpecial, setIsChefSpecial] = useState<boolean>(false);
  const [isSaturdaySpecial, setIsSaturdaySpecial] = useState<boolean>(false);
  const [showImagePresets, setShowImagePresets] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddVariant = () => {
    setVariants([...variants, { label: 'Extra', price: 10000 }]);
  };

  const handleUpdateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const next = [...variants];
    next[index] = { ...next[index], [field]: value };
    setVariants(next);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMsg('');
      const compressed = await compressImageFile(file, 600, 600, 0.82);
      setImageUrl(compressed);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process image');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter dish name');
      return;
    }

    const finalCategory = isAddingCustomCategory && customCategoryInput.trim()
      ? customCategoryInput.trim()
      : category;

    const newItem: MenuItem = {
      id: `item-${restaurantId}-${Date.now()}`,
      restaurant_id: restaurantId,
      name: name.trim(),
      category: finalCategory,
      stock: Number(stock) || 0,
      icon: 'Utensils',
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      isPopular,
      isSpicy,
      isChefSpecial,
      isSaturdaySpecial,
      price: useVariants ? undefined : Number(basePrice) || 0,
      variants: useVariants ? variants.filter((v) => v.label.trim()) : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#e2e4dc] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 px-5 border-b border-[#e2e4dc] flex items-center justify-between bg-[#fafbfa]">
          <div>
            <h3 className="text-base font-bold text-[#1b2620]">Add New Dish / Menu Item</h3>
            <p className="text-xs text-[#1f4d3e] font-semibold mt-0.5">
              Customizing for: <span className="font-extrabold">{restaurantName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#4c5a52] hover:bg-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scroll Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Dish Image / Photo Upload Box */}
          <div className="border border-[#e2e4dc] rounded-2xl p-4 bg-[#f4f5f0] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1b2620] uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#1f4d3e]" />
                <span>Attach Dish Photo</span>
              </label>
              <button
                type="button"
                onClick={() => setShowImagePresets(!showImagePresets)}
                className="text-xs font-bold text-[#1f4d3e] hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showImagePresets ? 'Hide Gallery' : 'Food Presets'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3.5">
              {/* Clickable Image Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-dashed border-[#1f4d3e]/40 hover:border-[#1f4d3e] overflow-hidden shrink-0 flex flex-col items-center justify-center relative cursor-pointer group shadow-xs transition-all"
                title="Click to upload or change dish photo"
              >
                {imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt="Dish Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity">
                      <Camera className="w-4 h-4 mb-0.5" />
                      <span>Change</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-2">
                    <Camera className="w-6 h-6 text-[#1f4d3e] mx-auto opacity-70 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] text-[#1f4d3e] font-bold block mt-1">Upload</span>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#e2e4dc] hover:bg-gray-50 text-xs font-bold text-[#1b2620] shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#1f4d3e]" />
                    <span>Upload File</span>
                  </button>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-xs text-[#b3402f] hover:underline font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Or paste image URL (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                />
              </div>
            </div>

            {showImagePresets && (
              <div className="pt-2 border-t border-[#e2e4dc]/70 space-y-2">
                <p className="text-[11px] font-bold text-[#4c5a52]">
                  Select from delicious food presets:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-xl border border-[#e2e4dc]">
                  {FOOD_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.url);
                        setShowImagePresets(false);
                      }}
                      className="group text-left p-1 rounded-lg hover:bg-[#e3ede8] transition-colors border border-transparent hover:border-[#1f4d3e]/30"
                    >
                      <div className="aspect-4/3 rounded-md overflow-hidden bg-gray-100">
                        <img
                          src={preset.url}
                          alt={preset.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>
                      <p className="text-[10px] font-bold text-[#1b2620] truncate mt-1">
                        {preset.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4c5a52] mb-1">
              Dish / Item Name <span className="text-[#b3402f]">*</span>
            </label>
            <input
              type="text"
              id="new-dish-name-input"
              placeholder="e.g. Smoky BBQ Ribs Combo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#4c5a52]">Category</label>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomCategory(!isAddingCustomCategory)}
                  className="text-[11px] font-bold text-[#1f4d3e] hover:underline"
                >
                  {isAddingCustomCategory ? 'Choose Existing' : '+ Custom Category'}
                </button>
              </div>

              {isAddingCustomCategory ? (
                <input
                  type="text"
                  placeholder="e.g. Seafood & Soups"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  className="w-full p-2.5 text-sm bg-white border border-[#1f4d3e] rounded-xl focus:outline-none ring-2 ring-[#1f4d3e]/20"
                  autoFocus
                />
              ) : (
                <select
                  id="new-dish-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                >
                  {mergedCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                Initial Stock Count
              </label>
              <input
                type="number"
                id="new-dish-stock-input"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full p-2.5 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4c5a52] mb-1">
              Description / Ingredients
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of the dish..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
            />
          </div>

          {/* Variants Toggle */}
          <div className="border border-[#e2e4dc] rounded-2xl p-4 bg-[#f4f5f0] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1b2620] uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#1f4d3e]" />
                <span>Has Sizes / Portions?</span>
              </label>
              <button
                type="button"
                onClick={() => setUseVariants(!useVariants)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  useVariants ? 'bg-[#1f4d3e] text-white' : 'bg-gray-200 text-[#4c5a52]'
                }`}
              >
                {useVariants ? 'Portions (Yes)' : 'Single Price'}
              </button>
            </div>

            {!useVariants ? (
              <div>
                <label className="block text-[11px] font-bold text-[#4c5a52] mb-1">
                  Price ({currency})
                </label>
                <input
                  type="number"
                  id="new-dish-price-input"
                  min="0"
                  step="500"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full p-2.5 text-sm font-extrabold text-[#143529] bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                />
              </div>
            ) : (
              <div className="space-y-2">
                {variants.map((v, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Size label (e.g. Small)"
                      value={v.label}
                      onChange={(e) => handleUpdateVariant(idx, 'label', e.target.value)}
                      className="flex-1 p-2 text-xs bg-white border border-[#e2e4dc] rounded-lg"
                    />
                    <input
                      type="number"
                      step="500"
                      placeholder="Price"
                      value={v.price}
                      onChange={(e) => handleUpdateVariant(idx, 'price', Number(e.target.value))}
                      className="w-28 p-2 text-xs font-extrabold text-[#143529] bg-white border border-[#e2e4dc] rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      disabled={variants.length <= 1}
                      className="p-1.5 text-[#8b978f] hover:text-[#b3402f] disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="text-xs font-bold text-[#1f4d3e] hover:underline flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Size Option</span>
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-4 text-xs font-bold text-[#4c5a52] pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded text-[#1f4d3e]"
              />
              <span>Popular</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isSpicy}
                onChange={(e) => setIsSpicy(e.target.checked)}
                className="rounded text-[#1f4d3e]"
              />
              <span>Spicy</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isChefSpecial}
                onChange={(e) => setIsChefSpecial(e.target.checked)}
                className="rounded text-[#1f4d3e]"
              />
              <span>Chef's Special</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isSaturdaySpecial}
                onChange={(e) => setIsSaturdaySpecial(e.target.checked)}
                className="rounded text-[#1f4d3e]"
              />
              <span>Saturday Special</span>
            </label>
          </div>

          {errorMsg && <p className="text-xs text-[#b3402f] font-bold">{errorMsg}</p>}
        </form>

        {/* Footer */}
        <div className="p-4 px-5 border-t border-[#e2e4dc] bg-gray-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#e2e4dc] bg-white text-[#4c5a52] text-xs font-bold hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            id="save-new-dish-btn"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] shadow-xs"
          >
            Save to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
