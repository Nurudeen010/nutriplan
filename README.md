# NutriPlan 🇳🇬
**AI-powered weekly meal planner built for Nigerians** — generating personalized 7-day meal timetables based on your diet, health goal, Naira budget, and Nigerian cuisine preference.

Built in public as a Technical Product Manager portfolio project.

[Live demo →](https://nutriplan.vercel.app) · [Follow the build journey on LinkedIn →](#)

---

## The problem it solves

Most meal planning apps are built for Western diets. They don't know what jollof rice is. They price meals in dollars. They suggest quinoa bowls to someone in Lagos.

NutriPlan is built specifically for Nigerians — with Naira budgets, Nigerian dishes, and regional cuisine options across Yoruba, Igbo, Hausa, and Delta/Rivers food cultures.

---

## What it does

NutriPlan generates a personalized 7-day meal timetable using Claude AI, based on:

- **Dietary preference** — Balanced, Vegan, Keto, Vegetarian, High Protein, Low Carb
- **Health goal** — Weight loss, Muscle gain, Maintenance, More energy
- **Weekly budget** — ₦10,000 – ₦150,000 (based on NBS 2026 cost of healthy diet data)
- **Nigerian cuisine** — Yoruba, Igbo, Hausa, Delta/Rivers, All Nigerian, No preference
- **Meals per day** — 2, 3, or 4

Each generated plan includes:
- A 7-day meal grid (Monday–Sunday)
- Estimated weekly cost in Naira
- Average daily calorie count
- One-click plan regeneration
- AI-generated Nigerian market shopping list

---

## Tech stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS | No build step — fast, simple, deployable anywhere |
| Backend | Vercel Serverless Functions (Node.js) | API key security — key never reaches the browser |
| AI | Anthropic Claude Sonnet | Best JSON adherence and cultural awareness |
| Hosting | Vercel | Zero-config deployment, edge functions, free tier |

---

## Project structure

```
nutriplan/
├── api/
│   └── generate.js    ← Secure Claude API proxy (server-side only)
├── public/
│   └── index.html     ← Full frontend (HTML + CSS + JS)
├── vercel.json        ← Routing config (API + static)
├── server.js          ← Local dev server (alternative to Vercel CLI)
├── .env.example       ← Environment variable template
├── .gitignore         ← Keeps secrets out of git
└── README.md
```

---

## Local development

### Option A — Vercel CLI (recommended, mirrors production exactly)

```bash
# 1. Clone the repo
git clone https://github.com/YOUR-USERNAME/nutriplan.git
cd nutriplan

# 2. Install Vercel CLI
npm install -g vercel

# 3. Link to your Vercel account
vercel link

# 4. Pull environment variables
vercel env pull .env.local
# → Requires ANTHROPIC_API_KEY to be set in your Vercel dashboard first

# 5. Run locally
vercel dev
# → Opens on http://localhost:3000
```

### Option B — Node.js server (no Vercel account needed)

```bash
# 1. Clone the repo
git clone https://github.com/YOUR-USERNAME/nutriplan.git
cd nutriplan

# 2. Create your .env file
cp .env.example .env
# → Add your ANTHROPIC_API_KEY from console.anthropic.com

# 3. Run locally
node server.js
# → Opens on http://localhost:3000
```

---

## Deploy to Vercel (production)

```bash
# 1. Push to GitHub
git add .
git commit -m "feat: initial production release"
git push origin main

# 2. Import on Vercel dashboard
# → vercel.com/new → Import Git Repository → select nutriplan

# 3. Add environment variables in Vercel dashboard:
#    ANTHROPIC_API_KEY = your key from console.anthropic.com
#    ALLOWED_ORIGIN    = https://your-app.vercel.app

# 4. Click Deploy — your live URL is ready
```

---

## Security architecture

| Concern | Approach |
|---|---|
| API key exposure | Key stored as Vercel environment variable — never in client bundle |
| Prompt injection | All user inputs sanitized server-side before prompt construction |
| Budget tampering | Server-side min/max validation (₦10,000–₦150,000) regardless of client input |
| CORS | Origin restricted to own domain in production |
| Naira enforcement | Server-side post-processing strips any `$` Claude may return — always outputs `₦` |

---

## Budget calibration

Budget ranges are based on real 2026 Nigerian economic data:

- **Source:** National Bureau of Statistics (NBS), March 2026
- **National average cost of healthy diet:** ₦1,541 per adult per day
- **Lagos cost of healthy diet:** ₦1,910 per adult per day
- **Weekly equivalent (Lagos):** ~₦13,370 minimum

NutriPlan's minimum (₦10,000/week) reflects the lower bound for basic nutritious eating in Nigeria. The default (₦20,000/week) reflects an average working Nigerian cooking at home.

---

## Roadmap

| Phase | Timeline | Key features |
|---|---|---|
| v1.0 — MVP | Q2 2026 | AI meal generation, Nigerian cuisines, Naira budget, shopping list |
| v1.1 — Growth | Q3 2026 | Allergen filters, PDF export, plan history, user accounts |
| v2.0 — Expansion | Q4 2026 | Recipe cards, auto-weekly planning, freemium tier |
| v3.0 — Scale | Q2 2027 | Native mobile apps, community plans, enterprise wellness |

Full product documentation (PRD, user research, metrics framework, technical architecture) available in the [portfolio documents](./docs/).

---

## About this project

NutriPlan is being built in public by **Nurudeen Ajani (Ola)**, a Technical Product Manager based in Lagos, Nigeria.

Every product decision — from the architecture to the budget calibration — is documented and shared on LinkedIn as part of a TPM portfolio build series.

The project demonstrates end-to-end TPM thinking: user research, PRD, technical architecture, security decisions, localization, and iterative shipping.

---

*Follow the full build journey on LinkedIn · No data is stored · © 2026 NutriPlan*
