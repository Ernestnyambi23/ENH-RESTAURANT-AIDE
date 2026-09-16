/**
 * Utility functions for handling, compressing, and managing dish images
 */

export interface FoodImagePreset {
  id: string;
  label: string;
  category: string;
  url: string;
}

export const FOOD_IMAGE_PRESETS: FoodImagePreset[] = [
  {
    id: 'biriani-beef',
    label: 'Biriani (Beef & Saffron Rice)',
    category: 'Meals & Plates',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'pilau-beef',
    label: 'Spiced Pilau Rice',
    category: 'Meals & Plates',
    url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'chips-chicken',
    label: 'Crispy Chips & Chicken',
    category: 'Chicken',
    url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'bbq-chicken',
    label: 'BBQ Wings & Drumsticks',
    category: 'Chicken',
    url: 'https://images.unsplash.com/photo-1527477321055-436158a257a5?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'rice-beans',
    label: 'Rice & Coconut Beans',
    category: 'Meals & Plates',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'pizza-special',
    label: 'Stone-Baked Pizza',
    category: 'Pizza',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'burger-special',
    label: 'Gourmet Beef Burger',
    category: 'Burgers & Sandwiches',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'shawarma-wrap',
    label: 'Chicken Shawarma Wrap',
    category: 'Burgers & Sandwiches',
    url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'samosas-pastry',
    label: 'Golden Crispy Samosas',
    category: 'Sides & Extras',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'mandazi-donut',
    label: 'Swahili Mandazi / Pastry',
    category: 'Sides & Extras',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'french-fries',
    label: 'Crispy Seasoned Fries',
    category: 'Sides & Extras',
    url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'fresh-juice',
    label: 'Tropical Fruit Juice',
    category: 'Drinks',
    url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cold-soda',
    label: 'Chilled Soda & Ice',
    category: 'Drinks',
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'milkshake-drink',
    label: 'Creamy Milkshake',
    category: 'Drinks',
    url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'coffee-tea',
    label: 'Spiced Spiced Tea / Coffee',
    category: 'Drinks',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
  },
];

/**
 * Compresses an image file from the user to a lightweight base64 Data URL
 * to avoid blowing up localStorage while maintaining crisp quality.
 */
export function compressImageFile(
  file: File,
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image data'));
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          // Scale dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
