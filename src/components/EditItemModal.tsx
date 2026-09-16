import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Camera,
  Upload,
  Image as ImageIcon,
  Flame,
  ChefHat,
  Star,
  Layers,
  DollarSign,
} from 'lucide-react';
import { MenuItem, Variant } from '../types';
import { FOOD_IMAGE_PRESETS, compressImageFile } from '../utils/imageUtils';

interface EditItemModalProps {
  item: MenuItem;
  currency: string;
  isOpen?: boolean;
  onClose: () => void;
  onSave: (updatedItem: MenuItem) => void;
  onDelete?: (itemId: string) => void;
  onChangeImage?: (item: MenuItem) => void;
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

export const EditItemModal: React.FC<EditItemModalProps> = ({
  item,
  currency,
  isOpen = true,
  onClose,
  onSave,
  onDelete,
  onChangeImage,
  restaurantId,
  restaurantName,
  existingCategories = [],
}) => {
  const [name, setName] = useState<string>(item.name);
  const [category, setCategory] = useState<string>(item.category || 'Meals & Plates');
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState<boolean>(false);
  const [stock, setStock] = useState<number>(item.stock);
  const [description, setDescription] = useState<string>(item.description || '');
  const [imageUrl, setImageUrl] = useState<string>(item.imageUrl || '');
  const [isPopular, setIsPopular] = useState<boolean>(Boolean(item.isPopular));
  const [isSpicy, setIsSpicy] = useState<boolean>(Boolean(item.isSpicy));
  const [isChefSpecial, setIsChefSpecial] = useState<boolean>(Boolean(item.isChefSpecial));
  const [isSaturdaySpecial, setIsSaturdaySpecial] = useState<boolean>(Boolean(item.isSaturdaySpecial));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const hasInitialVariants = Boolean(item.variants && item.variants.length > 0);
  const [useVariants, setUseVariants] = useState<boolean>(hasInitialVariants);
  const [basePrice, setBasePrice] = useState<number>(item.price || 0);
  const [variants, setVariants] = useState<Variant[]>(
    hasInitialVariants && item.variants && item.variants.length > 0
      ? item.variants
      : [
          { label: 'Small', price: item.price || 5000 },
          { label: 'Medium', price: (item.price || 5000) * 1.5 },
          { label: 'Large', price: (item.price || 5000) * 2 },
        ]
  );

  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize state if item changes
  React.useEffect(() => {
    setName(item.name || '');
    setCategory(item.category || 'Meals & Plates');
    setStock(item.stock ?? 0);
    setDescription(item.description || '');
    setImageUrl(item.imageUrl || '');
    setIsPopular(Boolean(item.isPopular));
    setIsSpicy(Boolean(item.isSpicy));
    setIsChefSpecial(Boolean(item.isChefSpecial));
    setIsSaturdaySpecial(Boolean(item.isSaturdaySpecial));

    const hasVars = Boolean(item.variants && item.variants.length > 0);
    setUseVariants(hasVars);
    setBasePrice(item.price || 0);
    setVariants(
      hasVars && item.variants && item.variants.length > 0
        ? item.variants
        : [
            { label: 'Small', price: item.price || 5000 },
            { label: 'Medium', price: (item.price || 5000) * 1.5 },
            { label: 'Large', price: (item.price || 5000) * 2 },
          ]
    );
    setErrorMessage('');
  }, [item]);

  const availableCategories = React.useMemo(() => {
    const list = Array.from(new Set([
      item.category,
      ...existingCategories.filter(Boolean),
      ...DEFAULT_CATEGORIES,
    ].filter(Boolean)));
    return list;
  }, [item.category, existingCategories]);

  if (isOpen === false) return null;

  const handleAddVariant = () => {
    setVariants([...variants, { label: 'Extra', price: 5000 }]);
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
      setErrorMessage('');
      const compressed = await compressImageFile(file, 600, 600, 0.82);
      setImageUrl(compressed);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process image');
    }
  };

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (!name.trim()) {
      setErrorMessage('Please provide a valid dish name.');
      return;
    }

    if (useVariants) {
      const validVariants = variants.filter((v) => v.label.trim());
      if (validVariants.length === 0) {
        setErrorMessage('Please provide at least one portion size and price.');
        return;
      }
    }

    const finalCategory = isAddingCustomCategory && customCategoryInput.trim()
      ? customCategoryInput.trim()
      : category;

    const updatedItem: MenuItem = {
      ...item,
      restaurant_id: item.restaurant_id || restaurantId || 'ollis-pizza',
      name: name.trim(),
      category: finalCategory,
      stock: Math.max(0, Number(stock) || 0),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      isPopular,
      isSpicy,
      isChefSpecial,
      isSaturdaySpecial,
      price: useVariants ? (variants[0]?.price || 0) : Math.max(0, Number(basePrice) || 0),
      variants: useVariants ? variants.filter((v) => v.label.trim()) : undefined,
      updatedAt: Date.now(),
    };

    onSave(updatedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#e2e4dc] flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e2e4dc] flex items-center justify-between bg-[#fafbfa]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#1f4d3e]/10 text-[#1f4d3e] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1b2620]">Edit Dish Details</h3>
              <p className="text-xs text-[#1f4d3e] font-semibold">
                {restaurantName ? `Restaurant: ${restaurantName}` : 'Customized Restaurant Dish'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#4c5a52] hover:bg-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* Dish Image Section with Clickable Action */}
          <div className="border border-[#e2e4dc] rounded-2xl p-4 bg-[#f4f5f0] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1b2620] uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#1f4d3e]" />
                <span>Dish Image / Photo</span>
              </label>
              <button
                type="button"
                onClick={() => setShowImagePicker(!showImagePicker)}
                className="text-xs font-bold text-[#1f4d3e] hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showImagePicker ? 'Hide Gallery' : 'Choose from Gallery'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3.5">
              {/* Clickable Image Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-dashed border-[#1f4d3e]/40 hover:border-[#1f4d3e] overflow-hidden shrink-0 flex flex-col items-center justify-center relative cursor-pointer group shadow-xs transition-all"
                title="Click to change or upload dish photo"
              >
                {imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt={name || 'Dish'}
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
                  {onChangeImage && (
                    <button
                      type="button"
                      onClick={() => onChangeImage(item)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#e2e4dc] hover:bg-gray-50 text-xs font-bold text-[#1f4d3e] shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      title="Open full photo picker"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Photo Picker</span>
                    </button>
                  )}
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-xs text-[#b3402f] hover:underline font-semibold cursor-pointer"
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

            {/* Quick Gallery Presets Drawer */}
            {showImagePicker && (
              <div className="pt-2 border-t border-[#e2e4dc]/70 space-y-2">
                <p className="text-[11px] font-bold text-[#4c5a52]">
                  Quick Pick Delicious Food Presets:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-xl border border-[#e2e4dc]">
                  {FOOD_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.url);
                        setShowImagePicker(false);
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

          {/* Dish Name */}
          <div>
            <label className="block text-xs font-bold text-[#4c5a52] mb-1">
              Dish Name <span className="text-[#b3402f]">*</span>
            </label>
            <input
              type="text"
              id="edit-dish-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Zanzibar Spiced Pilau"
              required
              className="w-full p-2.5 text-sm bg-white border border-[#e2e4dc] rounded-xl font-bold text-[#1b2620] focus:outline-none focus:border-[#1f4d3e]"
            />
          </div>

          {/* Category & Stock Row */}
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
                  id="edit-dish-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                >
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4c5a52] mb-1">Stock Count</label>
              <input
                type="number"
                id="edit-dish-stock-input"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full p-2.5 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
              />
            </div>
          </div>

          {/* Pricing & Sizes Section */}
          <div className="border border-[#e2e4dc] rounded-2xl p-4 bg-[#f4f5f0] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1b2620] uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#1f4d3e]" />
                <span>Pricing &amp; Portions</span>
              </label>
              <button
                type="button"
                id="toggle-variants-btn"
                onClick={() => setUseVariants(!useVariants)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  useVariants ? 'bg-[#1f4d3e] text-white' : 'bg-gray-200 text-[#4c5a52]'
                }`}
              >
                {useVariants ? 'Multiple Sizes (Yes)' : 'Single Price'}
              </button>
            </div>

            {!useVariants ? (
              <div>
                <label className="block text-[11px] font-bold text-[#4c5a52] mb-1">
                  Base Price ({currency})
                </label>
                <input
                  type="number"
                  id="edit-dish-price-input"
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
                      className="flex-1 p-2 text-xs bg-white border border-[#e2e4dc] rounded-lg font-semibold"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-[#8b978f]">{currency}</span>
                      <input
                        type="number"
                        step="500"
                        placeholder="Price"
                        value={v.price}
                        onChange={(e) => handleUpdateVariant(idx, 'price', Number(e.target.value))}
                        className="w-24 p-2 text-xs font-extrabold text-[#143529] bg-white border border-[#e2e4dc] rounded-lg"
                      />
                    </div>
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

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#4c5a52] mb-1">
              Description / Ingredients
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the dish ingredients, allergens, or serving style..."
              className="w-full p-2.5 text-xs bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
            />
          </div>

          {/* Badges & Flags */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <label className="flex items-center gap-2 p-2.5 bg-gray-50 border border-[#e2e4dc] rounded-xl cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded text-[#1f4d3e]"
              />
              <span className="text-xs font-bold text-[#1b2620] flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Popular
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-gray-50 border border-[#e2e4dc] rounded-xl cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={isSpicy}
                onChange={(e) => setIsSpicy(e.target.checked)}
                className="rounded text-[#1f4d3e]"
              />
              <span className="text-xs font-bold text-[#1b2620] flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#b3402f]" /> Spicy
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-gray-50 border border-[#e2e4dc] rounded-xl cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={isChefSpecial}
                onChange={(e) => setIsChefSpecial(e.target.checked)}
                className="rounded text-[#1f4d3e]"
              />
              <span className="text-xs font-bold text-[#1b2620] flex items-center gap-1">
                <ChefHat className="w-3.5 h-3.5 text-[#c8791f]" /> Chef's
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-gray-50 border border-[#e2e4dc] rounded-xl cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={isSaturdaySpecial}
                onChange={(e) => setIsSaturdaySpecial(e.target.checked)}
                className="rounded text-[#1f4d3e]"
              />
              <span className="text-xs font-bold text-[#1b2620] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Special
              </span>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#e2e4dc] bg-gray-50 flex items-center justify-between gap-3">
          <div>
            {onDelete && (
              showDeleteConfirm ? (
                <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                  <span className="text-xs font-bold text-red-700">Delete "{item.name}"?</span>
                  <button
                    type="button"
                    id="confirm-delete-dish-btn"
                    onClick={() => {
                      onDelete(item.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-xs cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-[#e2e4dc] hover:bg-gray-100 text-gray-700 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="delete-dish-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3.5 py-2 rounded-xl text-[#b3402f] hover:bg-red-50 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Dish</span>
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#e2e4dc] bg-white text-[#4c5a52] text-xs font-bold hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              id="save-dish-changes-btn"
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
