import { MENU_DATABASE } from '../data/menuDatabase';

export interface AssistantResponse {
  reply: string;
  suggestedItems?: Array<{
    name: string;
    variant?: string;
    price: number;
    quantity: number;
  }>;
  calculatedTotal?: number;
}

/**
 * Deterministic local fallback assistant engine for Olli's Pizza House
 * Used when Gemini API key is not provided or network is offline
 */
export function generateFallbackAiOrderResponse(query: string): AssistantResponse {
  const q = query.toLowerCase();

  // Swahili greeting check
  const isSwahili =
    q.includes('habari') ||
    q.includes('mambo') ||
    q.includes('jambo') ||
    q.includes('bei') ||
    q.includes('shingapi') ||
    q.includes('sh ngapi') ||
    q.includes('chakula') ||
    q.includes('kuku') ||
    q.includes('samaki') ||
    q.includes('naomba');

  // Pizzas inquiry
  if (q.includes('pizza')) {
    if (q.includes('magharita') || q.includes('margherita')) {
      return {
        reply: isSwahili
          ? "Magharita Pizza ina Mozzarella safi na tomato sauce ya ki-Italia:\n• Small: 8,000 TZS\n• Medium: 12,000 TZS\n• Large: 15,000 TZS."
          : "Our classic Magharita Pizza comes with fresh Mozzarella and rich herb tomato sauce:\n• Small: 8,000 TZS\n• Medium: 12,000 TZS\n• Large: 15,000 TZS.",
        suggestedItems: [
          { name: 'Magharita Pizza', variant: 'Medium', price: 12000, quantity: 1 },
        ],
        calculatedTotal: 12000,
      };
    }
    if (q.includes('sausage pizza')) {
      return {
        reply: isSwahili
          ? "Sausage Pizza yetu ina mozzarella cheese + beef viennas:\n• Small: 10,000 TZS\n• Medium: 15,000 TZS\n• Large: 25,000 TZS."
          : "Our Sausage Pizza features loaded mozzarella cheese + savory beef viennas:\n• Small: 10,000 TZS\n• Medium: 15,000 TZS\n• Large: 25,000 TZS.",
        suggestedItems: [
          { name: 'Sausage Pizza', variant: 'Medium', price: 15000, quantity: 1 },
        ],
        calculatedTotal: 15000,
      };
    }
    if (q.includes('supreme')) {
      return {
        reply: isSwahili
          ? "Supreme Pizza ni pizza yetu tajiri zaidi, loaded with premium toppings:\n• Medium: 25,000 TZS\n• Large: 35,000 TZS."
          : "Our Supreme Pizza is our most loaded recipe:\n• Medium: 25,000 TZS\n• Large: 35,000 TZS.",
        suggestedItems: [
          { name: 'Supreme Pizza', variant: 'Medium', price: 25000, quantity: 1 },
        ],
        calculatedTotal: 25000,
      };
    }
    return {
      reply: isSwahili
        ? "Karibu Olli's Pizza House! Hizi ndizo Pizza zetu:\n• Sausage Pizza: Small 10,000 / Med 15,000 / Large 25,000 TZS\n• Chicken Pizza: Small 15,000 / Med 20,000 / Large 30,000 TZS\n• Beef Pizza: Small 15,000 / Med 20,000 / Large 30,000 TZS\n• Supreme Pizza: Med 25,000 / Large 35,000 TZS\n• Magharita Pizza: Small 8,000 / Med 12,000 / Large 15,000 TZS\n• Vegetable Pizza: Small 8,000 / Med 12,000 / Large 15,000 TZS\n• Extra Cheese: 3,000 TZS | Extra Toppings: 4,000 TZS"
        : "Welcome to Olli's Pizza House! Here are our pizzas:\n• Sausage Pizza: Small 10k / Med 15k / Large 25k TZS\n• Chicken Pizza: Small 15k / Med 20k / Large 30k TZS\n• Beef Pizza: Small 15k / Med 20k / Large 30k TZS\n• Supreme Pizza: Med 25k / Large 35k TZS\n• Magharita Pizza: Small 8k / Med 12k / Large 15k TZS\n• Vegetable Pizza: Small 8k / Med 12k / Large 15k TZS\n• Extra Cheese: 3,000 TZS | Extra Toppings: 4,000 TZS",
      suggestedItems: [
        { name: 'Chicken Pizza', variant: 'Medium', price: 20000, quantity: 1 },
      ],
      calculatedTotal: 20000,
    };
  }

  // Chicken & Meat inquiry
  if (q.includes('chicken') || q.includes('kuku') || q.includes('crunchy')) {
    if (q.includes('crunchy') || q.includes('ngano')) {
      return {
        reply: isSwahili
          ? "Crunchy Chicken (Kuku wa Ngano) ni maarufu sana:\n• 2 Pcs: 5,000 TZS\n• 4 Pcs: 10,000 TZS\n• Bucket 10 Pcs: 22,000 TZS\n• Bucket 15 Pcs: 32,000 TZS."
          : "Our Crunchy Chicken (Kuku wa Ngano) is crispy golden perfection:\n• 2 Pcs: 5,000 TZS\n• 4 Pcs: 10,000 TZS\n• Bucket 10 Pcs: 22,000 TZS\n• Bucket 15 Pcs: 32,000 TZS.",
        suggestedItems: [
          { name: 'Crunchy Chicken (Kuku wa Ngano)', variant: '4 Pcs', price: 10000, quantity: 1 },
        ],
        calculatedTotal: 10000,
      };
    }
    return {
      reply: isSwahili
        ? "Tuna kuku wa aina mbalimbali:\n• Crunchy Chicken (Kuku wa Ngano): kuanzia 5,000 TZS\n• Kuku wa Kukaanga Plain: Robo 5k / Nusu 10k / Full 20k TZS\n• Changamoto Plain: 8,000 TZS\n• Changamoto na Chips: 10,000 TZS\n• Makange Plain: 8,000 TZS\n• Chicken Nuggets: 10,000 TZS\n• Pasta Penne na Kuku robo: 10,000 TZS"
        : "Here are our Chicken options:\n• Crunchy Chicken: from 5,000 TZS\n• Fried Chicken Plain: Quarter 5k / Half 10k / Full 20k TZS\n• Changamoto with Chips: 10,000 TZS\n• Chicken Nuggets: 10,000 TZS\n• Pasta Penne with chicken: 10,000 TZS",
      suggestedItems: [
        { name: 'Changamoto Na Chips', price: 10000, quantity: 1 },
      ],
      calculatedTotal: 10000,
    };
  }

  // Sausages inquiry
  if (q.includes('sausage') || q.includes('vienna') || q.includes('choma')) {
    return {
      reply: isSwahili
        ? "Aina za Sausages zilizopo:\n• Russian Sausages: 2,500 TZS (Sausage kubwa ya kuchoma yenye pilipili)\n• Vienna Packs: 9,000 TZS (Viennas 10 + chips kavu)\n• Choma Sausage Mbichi Pakti 1: 15,000 TZS (Zinakuwa 8)\n• Family Pack Viennas Sausage: 27,000 TZS (50 pcs)\n• Viennas Sausage (1 pc): 1,000 TZS."
        : "Available Sausages:\n• Russian Sausages: 2,500 TZS (Spiced grilled large sausage)\n• Vienna Packs: 9,000 TZS (10 Viennas + seasoned fries)\n• Choma Sausage Raw Pack: 15,000 TZS (8 pcs)\n• Family Pack Viennas: 27,000 TZS (50 pcs)\n• Vienna Single Piece: 1,000 TZS.",
      suggestedItems: [
        { name: 'Russian Sausages', price: 2500, quantity: 2 },
      ],
      calculatedTotal: 5000,
    };
  }

  // Combo boxes / VIBOX inquiry
  if (q.includes('box') || q.includes('combo') || q.includes('pack') || q.includes('vibox')) {
    if (q.includes('vibox')) {
      return {
        reply: isSwahili
          ? "VIBOX zetu (Numbered combo meal boxes):\n• VIBOX #1: 36,000 TZS | #2: 45,000 TZS\n• VIBOX #3: 22,000 TZS | #4: 35,000 TZS\n• VIBOX #5: 15,000 TZS | #6: 20,000 TZS\n• VIBOX #7: 20,000 TZS | #8: 30,000 TZS\n• VIBOX #9: 38,000 TZS | #10: 50,000 TZS."
          : "Our signature VIBOX combos:\n• VIBOX #1: 36,000 TZS | #2: 45,000 TZS\n• VIBOX #3: 22,000 TZS | #4: 35,000 TZS\n• VIBOX #5: 15,000 TZS | #6: 20,000 TZS\n• VIBOX #7: 20,000 TZS | #8: 30,000 TZS\n• VIBOX #9: 38,000 TZS | #10: 50,000 TZS.",
        suggestedItems: [
          { name: 'VIBOX', variant: 'Box #5', price: 15000, quantity: 1 },
        ],
        calculatedTotal: 15000,
      };
    }
    return {
      reply: isSwahili
        ? "Combo Packs maalum:\n• Hostel Pack: 10,000 TZS (Kuku robo + sausages 4 + chips)\n• Hostel Pack Extra: 15,000 TZS (Chips + kuku nusu + viennas 4)\n• Extra Pressure: 17,000 TZS (Choma 2 + fries + crunchy chicken 4)\n• Me And You (watu 2): 12,000 TZS (2 OFC + 2 Sausages + Fries)\n• All By Myself: 12,000 TZS (Burger + 2 chicken + fries)\n• Bill Ya Ally: 45,000 TZS (Med chicken pizza + 2 chips + bucket 10 chicken)\n• Where My Friends At?: 35,000 TZS (10 Pcs chicken + Large Magharita Pizza)\n• Finale: 50,000 TZS (Vuruga, Makange, Chips, Chapati 4, OFC 4, Medium Sausage Pizza)."
        : "Special Combo Packs:\n• Hostel Pack: 10,000 TZS (Quarter chicken + 4 sausages + fries)\n• Hostel Pack Extra: 15,000 TZS (Fries + half chicken + 4 viennas)\n• Me And You (2 people): 12,000 TZS (2 fried chicken + 2 sausages + fries)\n• Bill Ya Ally: 45,000 TZS (Med chicken pizza + 2 fries + bucket 10 chicken)\n• Where My Friends At?: 35,000 TZS (10 chicken + Large Magharita)\n• Finale Feast: 50,000 TZS (Full loaded spread).",
      suggestedItems: [
        { name: 'Me And You', price: 12000, quantity: 1 },
      ],
      calculatedTotal: 12000,
    };
  }

  // Soups & Local Meals inquiry
  if (q.includes('supu') || q.includes('soup') || q.includes('samaki') || q.includes('fish') || q.includes('ugali')) {
    return {
      reply: isSwahili
        ? "Supu na Milo ya Kiasili:\n• Supu ya Samaki (Fish Soup): 10,000 TZS (Kitoga na Njege, inakuja na ndizi au viazi)\n• Chicken Soup: 10,000 TZS (Kuku wa kisasa na ndizi/viazi/mixed)\n• Newton First Law (Ugali): 10,000 TZS (Ugali, makange robo na mboga za majani)."
        : "Fresh Soups & Local Meals:\n• Supu ya Samaki (Fish Soup): 10,000 TZS (Fresh local fish served with cooked plantains or potatoes)\n• Chicken Soup: 10,000 TZS (Tender chicken broth with potatoes/plantains)\n• Newton First Law (Ugali): 10,000 TZS (Ugali with quarter chicken makange and greens).",
      suggestedItems: [
        { name: 'Supu ya Samaki (Fish Soup)', price: 10000, quantity: 1 },
      ],
      calculatedTotal: 10000,
    };
  }

  // Drinks / Milkshakes
  if (q.includes('drink') || q.includes('juice') || q.includes('milkshake') || q.includes('soda') || q.includes('kinywaji')) {
    return {
      reply: isSwahili
        ? "Vinywaji Baridi:\n• Oreo Combo Milkshake: 5,000 TZS (Maziwa na karanga/nuts)\n• Premium Taste Fresh Juices: 4,000 TZS (Matunda freshi)\n• Soda Takeaways (Pepsi, Coca, Sprite, Sparletta, Fanta): 1,000 TZS."
        : "Refreshing Beverages:\n• Oreo Combo Milkshake: 5,000 TZS\n• Premium Taste Fresh Juices: 4,000 TZS\n• Soda Takeaways (Pepsi, Coke, Sprite, Fanta, etc.): 1,000 TZS.",
      suggestedItems: [
        { name: 'Oreo Combo Milkshake', price: 5000, quantity: 1 },
      ],
      calculatedTotal: 5000,
    };
  }

  // General greeting / overview
  return {
    reply: isSwahili
      ? "Karibu Olli's Pizza House & Take Aways! Mimi ni Msaidizi wako wa AI wa Kuagiza Chakula. Ninaweza kukusaidia kuchagua vyakula, kueleza bei zetu kwa TZS, kukokotoa jumla ya oda yako, na kukupendekezea combo nzuri. Je, ungependa kuagiza Pizza, Kuku wa Ngano, Sausages, Burgers, au VIBOX?"
      : "Welcome to Olli's Pizza House & Take Aways! I am your AI Order Assistant. I can help you explore our menu, calculate your order total in TZS, check prices, and recommend delicious combos like VIBOX, Pizzas, Crunchy Chicken, or Sausages. What would you like to enjoy today?",
    suggestedItems: [
      { name: 'Sausage Pizza', variant: 'Medium', price: 15000, quantity: 1 },
      { name: 'Oreo Combo Milkshake', price: 5000, quantity: 1 },
    ],
    calculatedTotal: 20000,
  };
}
