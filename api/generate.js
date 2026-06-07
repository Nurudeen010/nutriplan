// api/generate.js
// Vercel Serverless Function — Claude API Proxy
// This file runs on the SERVER. The API key never reaches the browser.

export default async function handler(req, res) {

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS — only allow requests from your own domain
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Destructure and validate user preferences from request body
  const { diet, goal, budget, cuisines, meals, shoppingList, timetableContext } = req.body;

  // ── SHOPPING LIST MODE ──
  if (shoppingList && timetableContext) {
    const safeContext = String(timetableContext).slice(0, 2000);
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
          max_tokens: 800,
          messages: [{
            role: 'user',
            content: `Based on this 7-day meal plan:\n\n${safeContext}\n\nGenerate a concise weekly shopping list organized by category:\n- Produce\n- Proteins\n- Grains & Carbs\n- Dairy & Eggs\n- Pantry & Spices\n\nBudget target: ₦${safeBudgetSL.toLocaleString()}/week (Nigerian Naira). List Nigerian market ingredients. Keep it practical, no duplicates.`
          }]
        })
      });
      const data = await response.json();
      const list = data.content.map(b => b.text || '').join('');
      return res.status(200).json({ success: true, shoppingList: list });
    } catch(e) {
      return res.status(200).json({ success: false, shoppingList: 'Could not generate shopping list.' });
    }
  }

  if (!diet || !goal || !budget || !meals) {
    return res.status(400).json({ error: 'Missing required preferences' });
  }

  // Input sanitization — prevent prompt injection
  const safeDiet    = String(diet).slice(0, 50).replace(/[^a-zA-Z_\s]/g, '');
  const safeGoal    = String(goal).slice(0, 50).replace(/[^a-zA-Z_\s]/g, '');
  const safeBudget  = Math.min(Math.max(parseInt(budget) || 20000, 10000), 150000);
  const safeMeals   = Math.min(Math.max(parseInt(meals) || 3, 2), 4);
  const safeCuisines = Array.isArray(cuisines)
    ? cuisines.map(c => String(c).slice(0, 30).replace(/[^a-zA-Z_\s]/g, '')).slice(0, 6)
    : ['any'];

  const mealTypes = [];
  if (safeMeals >= 3) mealTypes.push('breakfast');
  mealTypes.push('lunch', 'dinner');
  if (safeMeals === 4) mealTypes.push('snack');

  // Construct the prompt
  const prompt = `You are a professional Nigerian nutritionist and meal planner based in Nigeria.
Generate a personalized 7-day meal timetable (Monday–Sunday) for a Nigerian user.

User profile:
- Dietary preference: ${safeDiet}
- Health goal: ${safeGoal}
- Meals per day: ${safeMeals} (${mealTypes.join(', ')})
- Weekly budget: ₦${safeBudget.toLocaleString()} (Nigerian Naira)
- Cuisine preferences: ${safeCuisines.join(', ')}

Return ONLY valid JSON — no markdown fences, no explanation, no preamble.

Required JSON structure:
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
- Meal names: 3–6 words max, use Nigerian dish names (e.g. Jollof Rice, Egusi Soup, Pounded Yam, Suya, Akara, Moi Moi, Ofada Rice, Banga Soup, Afang Soup, Tuwo Shinkafa, Miyan Kuka, Ogbono Soup, Efo Riro, Eba, Amala)
- Breakfast options: Akara & pap, Moi Moi & bread, Ogi & akara, Scrambled eggs & agege bread, Yam & egg sauce
- Snack options: Chin chin, Puff puff, Roasted plantain, Groundnuts, Kuli kuli, Zobo drink
- No dish repeated more than twice across the week
- Cuisine breakdown by preference: Yoruba=Amala/Ewedu/Gbegiri/Efo Riro, Igbo=Ofe Onugbu/Jikokor/Oha Soup, Hausa=Tuwo/Miyan Kuka/Suya/Kilishi, Delta=Banga Soup/Starch/Fisherman Soup
- Budget estimate MUST be in Nigerian Naira (₦) and realistic for Nigerian markets
- Budget must be within ±15% of ₦${safeBudget.toLocaleString()}/week`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,  // ← Secure: server-side only
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
      return res.status(502).json({ error: 'AI service unavailable', fallback: true });
    }

    const data = await response.json();
    const raw = data.content
      .map(block => block.text || '')
      .join('')
      .replace(/```json|```/g, '')
      .trim();

    const plan = JSON.parse(raw);

    // Validate the response has the expected shape
    if (!plan.days || !plan.days.Monday) {
      throw new Error('Invalid plan structure from AI');
    }

    // Force Naira — replace any dollar signs Claude may have used
    if (plan.estimated_weekly_cost) {
      plan.estimated_weekly_cost = plan.estimated_weekly_cost
        .replace(/\$/g, '₦')
        .replace(/USD/g, '₦')
        .replace(/usd/g, '₦');
    }

    return res.status(200).json({ success: true, plan });

  } catch (error) {
    console.error('Generate error:', error.message);
    // Return fallback signal — frontend handles the fallback plan
    return res.status(200).json({ success: false, fallback: true, error: error.message });
  }
}
