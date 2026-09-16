import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Check,
  Trash2,
  ExternalLink,
  Camera,
  Layers,
} from 'lucide-react';
import { MenuItem } from '../types';
import { FOOD_IMAGE_PRESETS, compressImageFile } from '../utils/imageUtils';

interface ImagePickerModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onSaveImage: (itemId: string, imageUrl: string | undefined) => void;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  item,
  isOpen,
  onClose,
  onSaveImage,
}) => {
  const [selectedUrl, setSelectedUrl] = useState<string>(item.imageUrl || '');
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [urlInput, setUrlInput] = useState<string>(item.imageUrl || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setErrorMessage('');
      const compressedDataUrl = await compressImageFile(file, 600, 600, 0.82);
      setSelectedUrl(compressedDataUrl);
      setUrlInput(compressedDataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process image file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectPreset = (url: string) => {
    setSelectedUrl(url);
    setUrlInput(url);
    setErrorMessage('');
  };

  const handleSave = () => {
    onSaveImage(item.id, selectedUrl.trim() || undefined);
    onClose();
  };

  const handleRemove = () => {
    setSelectedUrl('');
    setUrlInput('');
    onSaveImage(item.id, undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#e2e4dc] flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e2e4dc] flex items-center justify-between bg-[#fafbfa]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#1f4d3e]/10 text-[#1f4d3e] flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#1b2620] truncate">
                Dish Photo &amp; Image
              </h3>
              <p className="text-xs text-[#8b978f] truncate">
                Attach or update image for <strong>{item.name}</strong>
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

        {/* Current Image Preview & Quick Actions */}
        <div className="p-4 bg-[#f4f5f0] border-b border-[#e2e4dc] flex items-center gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-dashed border-[#1f4d3e]/30 overflow-hidden shrink-0 flex items-center justify-center relative shadow-xs">
            {selectedUrl ? (
              <img
                src={selectedUrl}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2">
                <ImageIcon className="w-6 h-6 text-[#8b978f] mx-auto opacity-50" />
                <span className="text-[10px] text-[#8b978f] font-semibold block mt-0.5">No image</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1b2620]">Live Card Preview</span>
              {selectedUrl && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-xs text-[#b3402f] hover:underline font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Image</span>
                </button>
              )}
            </div>
            <p className="text-xs text-[#8b978f] line-clamp-2">
              {selectedUrl
                ? 'This photo will display on customer menu cards, kiosk screens, and kitchen receipts.'
                : 'Choose a curated food photo preset, upload a custom dish photo, or paste an image URL.'}
            </p>
          </div>
        </div>

        {/* Tabs: Presets / File Upload / URL */}
        <div className="flex border-b border-[#e2e4dc] px-4 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'presets'
                ? 'border-[#1f4d3e] text-[#1f4d3e]'
                : 'border-transparent text-[#8b978f] hover:text-[#1b2620]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Food Gallery Presets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#1f4d3e] text-[#1f4d3e]'
                : 'border-transparent text-[#8b978f] hover:text-[#1b2620]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'border-[#1f4d3e] text-[#1f4d3e]'
                : 'border-transparent text-[#8b978f] hover:text-[#1b2620]'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
              {errorMessage}
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[#4c5a52]">
                Click any high-resolution food photo to apply immediately:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {FOOD_IMAGE_PRESETS.map((preset) => {
                  const isSelected = selectedUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`group relative rounded-2xl overflow-hidden border-2 text-left transition-all p-1 bg-white cursor-pointer ${
                        isSelected
                          ? 'border-[#1f4d3e] shadow-md ring-2 ring-[#1f4d3e]/30'
                          : 'border-[#e2e4dc] hover:border-gray-400'
                      }`}
                    >
                      <div className="aspect-4/3 rounded-xl overflow-hidden bg-gray-100 relative">
                        <img
                          src={preset.url}
                          alt={preset.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#1f4d3e] text-white flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="p-1.5">
                        <p className="text-[11.5px] font-bold text-[#1b2620] leading-tight truncate">
                          {preset.label}
                        </p>
                        <span className="text-[10px] text-[#8b978f] font-semibold">
                          {preset.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#1f4d3e]/40 hover:border-[#1f4d3e] bg-[#fafbfa] hover:bg-[#e3ede8]/30 rounded-3xl p-8 text-center cursor-pointer transition-all space-y-2.5"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1f4d3e]/10 text-[#1f4d3e] flex items-center justify-center mx-auto">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1b2620]">
                    Click to browse dish photo
                  </p>
                  <p className="text-xs text-[#8b978f] mt-1">
                    Supports JPG, PNG, WEBP from phone camera or gallery (auto-compressed for fast loading)
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-[#1f4d3e] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Select Image File</span>
                </button>
              </div>

              {isUploading && (
                <div className="text-center py-2 text-xs font-bold text-[#1f4d3e] flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#1f4d3e] border-t-transparent rounded-full animate-spin" />
                  <span>Processing and optimizing image...</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                  Direct Web Image Link (URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/dish-photo.jpg"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setSelectedUrl(e.target.value);
                    }}
                    className="flex-1 p-2.5 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedUrl(urlInput)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#1b2620] font-bold text-xs rounded-xl"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#e2e4dc] bg-gray-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#e2e4dc] bg-white text-[#4c5a52] text-xs font-bold hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            id="save-dish-photo-btn"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Save &amp; Apply Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
