// api/generate.js
// Vercel Serverless Function — Claude API Proxy
// API key never reaches the browser. All inputs sanitized server-side.
// v20 — Updated: new health goals, goal-specific nutrition guidance

// ── 2026 NIGERIAN MARKET PRICE REFERENCE ──────────────────────────────────
// Sources: NBS Food Price Watch, NigerianQueries April 2026, McEbisco Market Data
// Prices are Lagos/South averages. Northern markets may be 10–20% cheaper.
// Updated: June 2026. Review monthly for accuracy.
const NIGERIAN_MARKET_PRICES = `
CURRENT NIGERIAN MARKET PRICES (June 2026 — Lagos/South average):

GRAINS & STAPLES:
- Rice (local, 1kg loose): ₦1,300–₦1,500
- Rice (foreign/parboiled, 1kg): ₦1,600–₦1,900
- Garri (white, 1kg): ₦800–₦1,200
- Garri (yellow, 1kg): ₦900–₦1,300
- Semovita (1kg): ₦1,200–₦1,500
- Wheat flour (1kg): ₦1,500–₦1,800
- Maize (1kg): ₦600–₦800
- Millet (1kg): ₦700–₦900

PROTEINS:
- Beans/Brown beans (1kg): ₦1,500–₦2,000
- Chicken (whole, per kg): ₦3,500–₦4,500
- Beef (1kg): ₦4,000–₦6,000
- Goat meat (1kg): ₦5,000–₦7,000
- Fresh fish (catfish, 1kg): ₦2,500–₦3,500
- Dried fish (medium piece): ₦800–₦1,500
- Stockfish (medium piece): ₦1,500–₦3,000
- Eggs (1 crate/30): ₦4,500–₦5,500
- Egg (single): ₦150–₦200
- Egusi/Melon seeds (1kg): ₦3,000–₦4,500
- Groundnuts (1kg): ₦1,200–₦1,800

TUBERS & SWALLOWS:
- Yam (1 medium tuber): ₦2,000–₦4,000
- Yam (1kg): ₦600–₦900
- Plantain (bunch): ₦2,000–₦3,500
- Plantain (single finger): ₦200–₦400
- Sweet potato (1kg): ₦600–₦900
- Cocoyam (1kg): ₦800–₦1,200
- Cassava (1kg): ₦300–₦500

VEGETABLES & PRODUCE:
- Tomatoes (1kg retail): ₦1,500–₦2,500
- Tomatoes (small basket): ₦4,000–₦6,000
- Pepper (tatashe/bell, 1kg): ₦1,500–₦2,500
- Scotch bonnet (atarodo, 100g): ₦500–₦800
- Onions (1kg): ₦1,200–₦1,800
- Spinach/Efo (bunch): ₦300–₦600
- Ugu/Fluted pumpkin (bunch): ₦400–₦700
- Bitter leaf (bunch): ₦300–₦500
- Waterleaf (bunch): ₦300–₦500

OILS & CONDIMENTS:
- Palm oil (1 litre): ₦1,500–₦2,000
- Vegetable oil (1 litre): ₦1,800–₦2,500
- Vegetable oil (5 litres): ₦9,000–₦12,000
- Groundnut oil (1 litre): ₦2,000–₦2,800
- Seasoning cubes (Maggi/Knorr, 1 pack): ₦300–₦500
- Salt (1 sachet): ₦50–₦100
- Crayfish (100g): ₦800–₦1,500

DAIRY & BEVERAGES:
- Milk (Peak, 1 tin): ₦1,200–₦1,600
- Milo/Ovaltine (500g): ₦2,500–₦3,200
- Oat (Golden Morn, 500g): ₦1,500–₦2,000
- Bread (standard loaf): ₦800–₦1,200

FRUITS:
- Orange (3 pieces): ₦300–₦500
- Banana (bunch): ₦1,000–₦1,800
- Pawpaw (medium): ₦500–₦1,000
- Watermelon (medium): ₦2,000–₦4,000

NOTE: Prices vary by location (Lagos is 10–20% higher than Northern markets),
season, and whether buying at open market vs supermarket.
Bulk purchases reduce cost by 15–30%.
`;

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { diet, goal, budget, cuisines, meals, shoppingList, timetableContext } = req.body;

  // ── SHOPPING LIST MODE ──────────────────────────────────────────────────
  if (shoppingList && timetableContext) {
    const safeContext  = String(timetableContext).slice(0, 2000);
    const safeBudgetSL = Math.min(Math.max(parseInt(budget) || 20000, 10000), 150000);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1200,
          messages: [{
            role: 'user',
            content: `You are a Nigerian market shopping expert based in Lagos.

Generate a weekly shopping list for this 7-day Nigerian meal plan:

${safeContext}

USER'S WEEKLY BUDGET: ₦${safeBudgetSL.toLocaleString()}

Use ONLY these verified current market prices when estimating costs:

${NIGERIAN_MARKET_PRICES}

Format the shopping list EXACTLY like this — do not deviate:

📦 GRAINS & STAPLES
• [Item name] — [quantity] — ₦[price range]

🥩 PROTEINS
• [Item name] — [quantity] — ₦[price range]

🥬 VEGETABLES & PRODUCE
• [Item name] — [quantity] — ₦[price range]

🫙 OILS & CONDIMENTS
• [Item name] — [quantity] — ₦[price range]

🧺 OTHER ITEMS
• [Item name] — [quantity] — ₦[price range]

💰 ESTIMATED WEEKLY TOTAL: ₦[sum of all items]
💡 BUDGET TIP: [one practical tip for buying these items cheaper in Nigerian markets]

Rules:
- Use ONLY the price reference above — do not invent prices
- List realistic quantities for one person for one week
- All prices in Naira (₦) only — no dollars
- Keep the list practical for Nigerian open markets
- If budget is tight, suggest smaller quantities or cheaper alternatives
- Every item line MUST start with • and follow the exact format above`
          }]
        })
      });

      const data     = await response.json();
      const list     = data.content.map(b => b.text || '').join('');

      return res.status(200).json({ success: true, shoppingList: list });

    } catch (e) {
      console.error('Shopping list error:', e.message);
      return res.status(200).json({
        success: false,
        shoppingList: 'Could not generate shopping list. Please try again.'
      });
    }
  }

  // ── MEAL PLAN MODE ──────────────────────────────────────────────────────
  if (!diet || !goal || !budget || !meals) {
    return res.status(400).json({ error: 'Missing required preferences' });
  }

  const safeDiet     = String(diet).slice(0, 50).replace(/[^a-zA-Z_\s]/g, '');
  const safeGoal     = String(goal).slice(0, 50).replace(/[^a-zA-Z_\s]/g, '');
  const safeBudget   = Math.min(Math.max(parseInt(budget) || 20000, 10000), 150000);
  const safeMeals    = Math.min(Math.max(parseInt(meals) || 3, 2), 4);
  const safeCuisines = Array.isArray(cuisines)
    ? cuisines.map(c => String(c).slice(0, 30).replace(/[^a-zA-Z_\s]/g, '')).slice(0, 6)
    : ['national'];

  const mealTypes = [];
  if (safeMeals >= 3) mealTypes.push('breakfast');
  mealTypes.push('lunch', 'dinner');
  if (safeMeals === 4) mealTypes.push('snack');

  const prompt = `You are a professional Nigerian nutritionist and meal planner based in Lagos.
Generate a personalized 7-day meal timetable (Monday–Sunday) for a Nigerian user.

User profile:
- Dietary preference: ${safeDiet}
- Health goal: ${safeGoal}
- Meals per day: ${safeMeals} (${mealTypes.join(', ')})
- Weekly budget: ₦${safeBudget.toLocaleString()} (Nigerian Naira)
- Cuisine preferences: ${safeCuisines.join(', ')}

Return ONLY valid JSON — no markdown, no explanation, no preamble.

{
  "days": {
    "Monday":    { "breakfast": "...", "lunch": "...", "dinner": "...", "snack": "..." },
    "Tuesday":   { "breakfast": "...", "lunch": "...", "dinner": "...", "snack": "..." },
    "Wednesday": { "breakfast": "...", "lunch": "...", "dinner": "...", "snack": "..." },
    "Thursday":  { "breakfast": "...", "lunch": "...", "dinner": "...", "snack": "..." },
    "Friday":    { "breakfast": "...", "lunch": "...", "dinner": "...", "snack": "..." },
    "Saturday":  { "breakfast": "...", "lunch": "...", "dinner": "...", "snack": "..." },
    "Sunday":    { "breakfast": "...", "lunch": "...", "dinner": "...", "snack": "..." }
  },
  "estimated_weekly_cost": "₦XX,000–₦XX,000",
  "avg_calories_per_day": "XXXX kcal",
  "notes": "One sentence describing the plan."
}

Rules:
- Only include meal keys for: ${mealTypes.join(', ')}
- Meal names: 3–6 words max
- Use Nigerian dish names: Jollof Rice, Egusi Soup, Pounded Yam, Amala, Ewedu, Gbegiri, Ofada Rice, Banga Soup, Efo Riro, Ofe Onugbu, Oha Soup, Afang Soup, Tuwo Shinkafa, Miyan Kuka, Ogbono Soup, Suya, Akara, Moi Moi, Eba, Fufu
- Breakfast options: Akara & pap, Moi moi & bread, Yam & egg sauce, Ogi & akara, Plantain & eggs, Bread & Akara
- Snack options: Chin chin, Puff puff, Roasted plantain, Groundnuts, Suya, Kuli kuli, Zobo, Roasted corn
- No dish repeated more than twice across the week
- Cuisine breakdown: Yoruba=Amala/Ewedu/Gbegiri/Efo Riro, Igbo=Ofe Onugbu/Oha Soup, Hausa=Tuwo/Miyan Kuka/Suya, Delta=Banga Soup/Starch/Fisherman Soup
- Goal-specific guidance:
    weight_loss      = low calorie Nigerian meals, smaller portions, avoid fried foods
    muscle_gain      = high protein (eggs/fish/chicken/beans featured every day)
    maintenance      = balanced macros, variety across the week
    energy           = complex carbs and iron-rich Nigerian foods (beans, ofada rice, ugu)
    increase_appetite = small frequent calorie-dense meals to stimulate hunger (peanut butter, agege bread, ogi with milk, groundnut soup)
    weight_gain      = calorie surplus with healthy Nigerian foods (fried plantain, groundnut soup, agege bread, full-fat milk, beans)
    high_protein     = prioritize eggs, fish, chicken, beans, egusi at every meal
    low_carb         = reduce rice, yam, fufu — increase vegetables, fish, eggs, meat
- Budget estimate MUST be in Naira (₦) and within ±15% of ₦${safeBudget.toLocaleString()}/week`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Anthropic API error:', err);
      return res.status(200).json({ success: false, fallback: true });
    }

    const data = await response.json();
    const raw  = data.content
      .map(block => block.text || '')
      .join('')
      .replace(/```json|```/g, '')
      .trim();

    const plan = JSON.parse(raw);

    if (!plan.days || !plan.days.Monday) {
      throw new Error('Invalid plan structure from AI');
    }

    // Force Naira — strip any dollar signs Claude may have returned
    if (plan.estimated_weekly_cost) {
      plan.estimated_weekly_cost = plan.estimated_weekly_cost
        .replace(/\$/g, '₦')
        .replace(/USD/gi, '₦');
    }

    return res.status(200).json({ success: true, plan });

  } catch (error) {
    console.error('Generate error:', error.message);
    return res.status(200).json({ success: false, fallback: true, error: error.message });
  }
}
