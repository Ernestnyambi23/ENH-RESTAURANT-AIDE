/**
 * Olli's Pizza House & Take Aways
 * Updated Official Menu Database & Gemini AI System Instruction
 */

export interface MenuItemDatabaseItem {
  name: string;
  price_tzs?: number;
  prices_tzs?: Record<string, number>;
  description: string;
}

export type MenuDatabaseCategoryKey =
  | 'sausages'
  | 'pizzas'
  | 'burgers_and_sandwiches'
  | 'chicken_and_meat'
  | 'sides_and_snacks'
  | 'soups_and_local_meals'
  | 'salads'
  | 'combo_packs_and_special_boxes'
  | 'drinks_and_milkshakes'
  | 'groceries_and_extras';

export const MENU_DATABASE: Record<MenuDatabaseCategoryKey, MenuItemDatabaseItem[]> = {
  sausages: [
    {
      name: 'Russian Sausages',
      price_tzs: 2500,
      description: 'Sausage moja ya kuchoma ina pilipili, ni kubwa zaidi ya vienna.',
    },
    {
      name: 'Vienna Packs',
      price_tzs: 9000,
      description: 'Viennas 10 + chips kavu.',
    },
    {
      name: 'Choma Sausage Mbichi Pakti 1',
      price_tzs: 15000,
      description: 'Zinakuwa 8 (Raw pack of 8).',
    },
    {
      name: 'Family Pack Viennas Sausage',
      price_tzs: 27000,
      description: '50pcs (Viennas sausage 1 piece = 750 TZS).',
    },
    {
      name: 'Viennas Sausage (1 piece)',
      price_tzs: 1000,
      description: 'Standalone single piece.',
    },
  ],
  pizzas: [
    {
      name: 'Sausage Pizza',
      prices_tzs: { small: 10000, medium: 15000, large: 25000 },
      description: 'Mozzarella cheese + beef viennas.',
    },
    {
      name: 'Chicken Pizza',
      prices_tzs: { small: 15000, medium: 20000, large: 30000 },
      description: 'Any extra topping will cost extra money.',
    },
    {
      name: 'Beef Pizza',
      prices_tzs: { small: 15000, medium: 20000, large: 30000 },
      description: 'Classic beef pizza.',
    },
    {
      name: 'Supreme Pizza',
      prices_tzs: { medium: 25000, large: 35000 },
      description: 'Loaded supreme pizza.',
    },
    {
      name: 'Magharita Pizza',
      prices_tzs: { small: 8000, medium: 12000, large: 15000 },
      description: 'Classic Margherita.',
    },
    {
      name: 'Vegetable Pizza',
      prices_tzs: { small: 8000, medium: 12000, large: 15000 },
      description: 'Loaded fresh veggies.',
    },
    {
      name: 'Extra Cheese',
      price_tzs: 3000,
      description: 'Add-on extra cheese.',
    },
    {
      name: 'Extra Toppings',
      price_tzs: 4000,
      description: 'Extra toppings of your choice.',
    },
  ],
  burgers_and_sandwiches: [
    {
      name: 'Cheat Day Single Beef Burger',
      price_tzs: 5000,
      description: 'Single beef patty burger.',
    },
    {
      name: 'Cheat Day Double Beef Burger',
      price_tzs: 8000,
      description: '2 meat patties + 2 slices cheddar cheese.',
    },
    {
      name: 'Single Chicken Burger',
      price_tzs: 8000,
      description: 'Fried chicken patty with tomatoes and onions on a toasted sesame bun.',
    },
    {
      name: 'They Fit...',
      price_tzs: 10000,
      description: 'Triple-stacked beef burger with cheese, sauce, and a soft bun.',
    },
    {
      name: 'Future Billionaire',
      price_tzs: 15000,
      description: '2 crunchy chicken patties, 2 slices of cheddar cheese.',
    },
    {
      name: 'Chicken/Beef Sandwich',
      price_tzs: 5000,
      description: 'Cheddar + beef/chicken slices of bread. Serves 1.',
    },
  ],
  chicken_and_meat: [
    {
      name: 'Crunchy Chicken (Kuku wa Ngano)',
      prices_tzs: {
        '2pcs': 5000,
        '4pcs': 10000,
        bucket_10pcs: 22000,
        bucket_15pcs: 32000,
      },
      description: 'Crispy fried chicken pieces.',
    },
    {
      name: 'Kuku wa Kukaanga Plain',
      prices_tzs: { full: 20000, half: 10000, quarter: 5000 },
      description: 'Plain fried local chicken.',
    },
    {
      name: 'Changamoto Plain',
      price_tzs: 8000,
      description: 'Kuku wa kisasa robo na vitunguu.',
    },
    {
      name: 'Changamoto Na Chips',
      price_tzs: 10000,
      description: 'Kuku robo aliechemishwa akawekwa vitunguu + chips plain.',
    },
    {
      name: 'Makange Plain',
      price_tzs: 8000,
      description: 'Makange ya kuku wa kisasa Robo.',
    },
    {
      name: 'Chicken Nuggets',
      price_tzs: 10000,
      description: 'Small cut pieces of chicken breast coated.',
    },
    {
      name: 'Pasta Penne',
      price_tzs: 10000,
      description: 'Pasta na Kuku robo.',
    },
  ],
  sides_and_snacks: [
    {
      name: 'Egg (1 piece)',
      price_tzs: 500,
      description: 'Boiled/fried single egg.',
    },
    {
      name: 'Plain Penne',
      price_tzs: 5000,
      description: 'Pasta Penne na Sauce bila nyama (No meat).',
    },
    {
      name: 'Sambusa za Nyama ya Ng\'ombe',
      price_tzs: 1000,
      description: 'Beef Samosa single piece.',
    },
    {
      name: 'Chips Plain',
      price_tzs: 2000,
      description: 'Chips with side sauces like tomato, pilipili, and mayonnaise.',
    },
    {
      name: 'Chips Masala',
      price_tzs: 3000,
      description: 'Chips mixed with sauce, haina nyama (no meat).',
    },
    {
      name: 'Chips Vuruga',
      price_tzs: 10000,
      description: 'Kuku robo na chips mixed.',
    },
    {
      name: 'Zege / Chips Mayai',
      price_tzs: 3000,
      description: 'Chips + mayai 2.',
    },
    {
      name: 'Chapati',
      price_tzs: 1000,
      description: 'Chapati za ngano nyeupe, zina maziwa na Butter/Margarine.',
    },
    {
      name: 'Mashed Potatoes',
      price_tzs: 10000,
      description: 'Mashed potatoes with milk and unsalted butter, served with chicken stew.',
    },
  ],
  soups_and_local_meals: [
    {
      name: 'Supu ya Samaki (Fish Soup)',
      price_tzs: 10000,
      description: 'Any available fish mainly Kitoga na Njege, served with Ndizi or Viazi.',
    },
    {
      name: 'Chicken Soup',
      price_tzs: 10000,
      description: 'Kuku wa kisasa, ndizi/viazi/mixed.',
    },
    {
      name: 'Newton First Law (Ugali)',
      price_tzs: 10000,
      description: 'Ugali, makange robo, veggies.',
    },
  ],
  salads: [
    {
      name: 'Clock It!',
      price_tzs: 12000,
      description: 'Chicken Breast, Eggs, Greens, Raisins/Almonds, and salad sauce.',
    },
    {
      name: 'Avocado Salad',
      price_tzs: 8000,
      description: 'Includes avocado, tomatoes, cucumbers, onions, and raisins/almonds with salad sauce.',
    },
    {
      name: 'Sweet Corn Salad',
      price_tzs: 10000,
      description: 'Boiled sweet corn, veggies, salad Sauce.',
    },
  ],
  combo_packs_and_special_boxes: [
    {
      name: 'Hostel Pack',
      price_tzs: 10000,
      description: 'Kuku robo wa kisasa + sausage za nyama 4 + chips.',
    },
    {
      name: 'Hostel Pack Extra',
      price_tzs: 15000,
      description: 'Chips plain + kuku wa kisasa kaangwa nusu + beef viennas 4.',
    },
    {
      name: 'Extra Pressure',
      price_tzs: 17000,
      description: 'Choma sausages 2 + fries + crunchy chicken 4.',
    },
    {
      name: 'All By Myself',
      price_tzs: 12000,
      description: '1 Beef burger, 2 Crunchy chicken pieces, and Fries.',
    },
    {
      name: 'Me And You',
      price_tzs: 12000,
      description: '2 PCS OFC, 2 PCS Russian/Choma Sausages, and Fries.',
    },
    {
      name: 'Don\'t Tell My Trainer',
      price_tzs: 10000,
      description: '3 beef samosas, 2 crunchy chicken pieces, and fries.',
    },
    {
      name: 'Spicy As You Are',
      price_tzs: 13000,
      description: '4 Spicy sausages served on Zege/Chips Yai.',
    },
    {
      name: 'Bill Ya Ally',
      price_tzs: 45000,
      description: 'Medium chicken pizza, 2 plates of plain chips, and a bucket of 10 crunchy chicken.',
    },
    {
      name: 'Where My Friends At?',
      price_tzs: 35000,
      description: '10 Pcs Crunchy chicken + Large Magharita Pizza.',
    },
    {
      name: 'Finale',
      price_tzs: 50000,
      description: 'Vuruga 1, Makange, Chips plain, Chapati 4, OFC 4, and a medium sausage pizza.',
    },
    {
      name: 'VIBOX',
      prices_tzs: {
        box_1: 36000,
        box_2: 45000,
        box_3: 22000,
        box_4: 35000,
        box_5: 15000,
        box_6: 20000,
        box_7: 20000,
        box_8: 30000,
        box_9: 38000,
        box_10: 50000,
      },
      description: 'Numbered combo meal boxes.',
    },
  ],
  drinks_and_milkshakes: [
    {
      name: 'Oreo Combo Milkshake',
      price_tzs: 5000,
      description: 'Contains milk and nuts.',
    },
    {
      name: 'Premium Taste Fresh Juices',
      price_tzs: 4000,
      description: 'Flavour depends on available fruits.',
    },
    {
      name: 'Soda Takeaways',
      price_tzs: 1000,
      description: 'Pepsi, Coca, Sprite, Sparletta, Fanta pineapple.',
    },
  ],
  groceries_and_extras: [
    {
      name: 'Mozzarella Cheese',
      prices_tzs: { '1kg': 36000, '0.5kg': 18000 },
      description: 'We don\'t sell a quarter kg.',
    },
    {
      name: 'Unsalted Butter',
      price_tzs: 20000,
      description: '500gm/nusu kilo.',
    },
    {
      name: 'Where My Meat At?? (Zipper Bags)',
      price_tzs: 10000,
      description: 'Zipper bag for storage, 50 plastic bags inside.',
    },
  ],
};

export function buildOfficialMenuItems(restaurantId: string = 'ollis-pizza'): import('../types').MenuItem[] {
  const items: import('../types').MenuItem[] = [];

  const categoryLabels: Record<MenuDatabaseCategoryKey, string> = {
    sausages: 'Sausages',
    pizzas: 'Pizza',
    burgers_and_sandwiches: 'Burgers & Sandwiches',
    chicken_and_meat: 'Chicken & Meat',
    sides_and_snacks: 'Sides & Snacks',
    soups_and_local_meals: 'Soups & Local Meals',
    salads: 'Salads',
    combo_packs_and_special_boxes: 'Combo Packs & Boxes',
    drinks_and_milkshakes: 'Drinks & Milkshakes',
    groceries_and_extras: 'Groceries & Extras',
  };

  const categoryIcons: Record<MenuDatabaseCategoryKey, string> = {
    sausages: 'Flame',
    pizzas: 'Pizza',
    burgers_and_sandwiches: 'Sandwich',
    chicken_and_meat: 'Drumstick',
    sides_and_snacks: 'Utensils',
    soups_and_local_meals: 'CookingPot',
    salads: 'Salad',
    combo_packs_and_special_boxes: 'Package',
    drinks_and_milkshakes: 'CupSoda',
    groceries_and_extras: 'ShoppingBag',
  };

  const formatVariantLabel = (rawKey: string): string => {
    switch (rawKey) {
      case 'small':
        return 'Small';
      case 'medium':
        return 'Medium';
      case 'large':
        return 'Large';
      case 'quarter':
        return 'Quarter (Robo)';
      case 'half':
        return 'Half (Nusu)';
      case 'full':
        return 'Full';
      case '2pcs':
        return '2 Pcs';
      case '4pcs':
        return '4 Pcs';
      case 'bucket_10pcs':
        return 'Bucket 10 Pcs';
      case 'bucket_15pcs':
        return 'Bucket 15 Pcs';
      case '0.5kg':
        return '0.5kg (Nusu Kilo)';
      case '1kg':
        return '1kg';
      default:
        if (rawKey.startsWith('box_')) {
          const num = rawKey.replace('box_', '');
          return `Box #${num}`;
        }
        return rawKey.charAt(0).toUpperCase() + rawKey.slice(1);
    }
  };

  for (const [catKey, rawItems] of Object.entries(MENU_DATABASE) as [
    MenuDatabaseCategoryKey,
    MenuItemDatabaseItem[]
  ][]) {
    const category = categoryLabels[catKey];
    const defaultIcon = categoryIcons[catKey];

    rawItems.forEach((raw, idx) => {
      const slug = raw.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const id = `item-${catKey.slice(0, 4)}-${slug || idx}`;

      let variants: import('../types').Variant[] | undefined = undefined;
      let price: number | undefined = raw.price_tzs;

      if (raw.prices_tzs) {
        variants = Object.entries(raw.prices_tzs).map(([vKey, vPrice]) => ({
          label: formatVariantLabel(vKey),
          price: Number(vPrice),
        }));
        // Base price defaults to lowest variant
        if (!price && variants.length > 0) {
          price = variants[0].price;
        }
      }

      const isSpicy =
        raw.description.toLowerCase().includes('pilipili') ||
        raw.name.toLowerCase().includes('spicy') ||
        raw.description.toLowerCase().includes('spicy');

      const isChefSpecial =
        catKey === 'combo_packs_and_special_boxes' ||
        raw.name.includes('Supreme') ||
        raw.name.includes('Future Billionaire') ||
        raw.name.includes('Finale');

      const isPopular =
        raw.name.includes('Chicken Pizza') ||
        raw.name.includes('Crunchy Chicken') ||
        raw.name.includes('Russian Sausages') ||
        raw.name.includes('Chips Plain') ||
        raw.name.includes('Hostel Pack');

      items.push({
        id,
        restaurant_id: restaurantId,
        name: raw.name,
        category,
        stock: 35,
        icon: defaultIcon,
        price,
        variants,
        description: raw.description,
        isPopular,
        isSpicy,
        isChefSpecial,
      });
    });
  }

  // Also include Saturday Biriani Special
  items.push({
    id: 'm-sat-birian',
    restaurant_id: restaurantId,
    name: 'Birian (Beef) 1 plate - Saturday Special',
    category: 'Soups & Local Meals',
    stock: 40,
    icon: 'Sparkles',
    price: 10000,
    description: '⭐ Saturday Special Biriani: Jumbo portion of tender slow-cooked beef with royal saffron rice and kachumbari.',
    isSaturdaySpecial: true,
    isPopular: true,
    isChefSpecial: true,
  });

  return items;
}

/**
 * System Instruction for Google AI Studio / Gemini API
 */
export const AI_ORDER_ASSISTANT_SYSTEM_INSTRUCTION = `You are an AI order assistant for our restaurant: OLLI'S PIZZA HOUSE & TAKE AWAYS.
Use the following updated menu data to answer customer inquiries and calculate order totals:

${JSON.stringify(MENU_DATABASE, null, 2)}

Instructions:
1. Greet guests warmly and assist them in English or Swahili (e.g., "Karibu Olli's Pizza House!").
2. Answer customer inquiries about items, ingredients, sizes, prices in TZS (Tanzanian Shillings), availability, recommendations, and dietary preferences.
3. Calculate order totals accurately based on item prices and chosen variants (small/medium/large, pieces, boxes, etc.).
4. When suggesting items, provide clear names, prices, and brief mouth-watering descriptions.
5. In addition to natural conversational text, when recommending specific items or answering order requests, output an optional JSON block at the end of your response with this format:
\`\`\`json
{
  "suggestedItems": [
    { "name": "Magharita Pizza", "variant": "Large", "price": 15000, "quantity": 1 },
    { "name": "Oreo Combo Milkshake", "price": 5000, "quantity": 1 }
  ],
  "calculatedTotal": 20000
}
\`\`\`
This enables the customer to add suggested items directly to their order with 1 tap.`;
