# NutriPlan 🥗
**AI-powered weekly meal planner** — tailored to your diet, health goals, budget, and cuisine.

Built as a TPM portfolio project. [Live demo →](https://nutriplan.vercel.app)

---

## What it does
NutriPlan generates a personalized 7-day meal timetable using Claude AI, based on:
- Dietary preference (Balanced, Vegan, Keto, Vegetarian, Paleo, Mediterranean)
- Health goal (Weight loss, Muscle gain, Maintenance, Energy)
- Weekly budget ($20–$300)
- Cuisine preference (West African, Asian, Mediterranean, American, Middle Eastern)
- Meals per day (2, 3, or 4)

---

## Tech stack
| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML/CSS/JS (no build step) |
| Backend | Vercel Serverless Functions (Node.js) |
| AI | Anthropic Claude Sonnet |
| Hosting | Vercel |

---

## Project structure
```
nutriplan/
├── api/
│   └── generate.js    ← Secure Claude API proxy (server-side only)
├── public/
│   └── index.html     ← Full frontend
├── vercel.json        ← Routing config
├── .env.example       ← Environment variable template
├── .gitignore
└── README.md
```

---

## Local development
```bash
# 1. Clone the repo
git clone https://github.com/yourusername/nutriplan.git
cd nutriplan

# 2. Install Vercel CLI
npm install -g vercel

# 3. Copy environment variables
cp .env.example .env
# → Add your ANTHROPIC_API_KEY to .env

# 4. Run locally
vercel dev
# → Opens on http://localhost:3000
```

---

## Deploy to Vercel
```bash
# 1. Push to GitHub
git add . && git commit -m "Initial commit" && git push

# 2. Import on Vercel dashboard
# → vercel.com/new → Import Git Repository

# 3. Add environment variables in Vercel dashboard:
#    ANTHROPIC_API_KEY = your key
#    ALLOWED_ORIGIN = https://your-domain.vercel.app

# 4. Deploy — done!
```

---

## Security
- ✅ Claude API key is **never** exposed to the browser
- ✅ All user inputs sanitized server-side before prompt construction
- ✅ Rate limiting via Vercel Edge
- ✅ CORS restricted to own domain in production

---

## Roadmap
See the full product roadmap in the [portfolio documents](./docs/).

---

*Built by a TPM in public. Follow the build journey on LinkedIn.*
