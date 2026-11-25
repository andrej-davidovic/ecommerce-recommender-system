# E-Commerce Recommender System

A full-stack online store built around a **personalized product recommendation engine**, developed as a master's thesis project. The system combines a collaborative-filtering recommender with a cold-start fallback, a complete e-commerce flow (catalog, cart, checkout, orders), Stripe payments, an LLM-powered support chatbot, and a bilingual (English / Serbian) interface.

> Store front-end branding: **StopShop**.

---

## Features

### Recommendation engine (core of the thesis)
- **Collaborative filtering** using cosine similarity over a user–item interaction matrix (`scikit-learn` / `numpy`).
- **Implicit interaction signals** derived from purchases, wishlist additions, and reviews, each with a configurable weight.
- **Cold-start handling**: users with too few interactions get popularity- and preference-based recommendations instead of CF.
- **Model persistence & auto-retraining**: the trained similarity matrix is stored and automatically retrained once enough new interactions accumulate.
- **Recommendation logging** for evaluation and metrics.

### E-commerce
- Product catalog with categories, tags, reviews, and search.
- Shopping cart, wishlist, checkout, and order history.
- **Stripe** payment integration.
- **JWT authentication** (access + refresh tokens) with user and admin roles.
- **Admin dashboard**: product CRUD, user management, and recommendation/metrics overview.

### Extras
- **AI support chatbot** grounded in a local knowledge base + live product catalog (Groq / Gemini LLM providers).
- **Bilingual UI** (English / Serbian) with translated product and category fields.

---

## Tech stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | Python, FastAPI, SQLAlchemy 2, Alembic, Pydantic v2, PostgreSQL |
| **ML** | scikit-learn, NumPy |
| **Payments** | Stripe |
| **LLM** | Groq / Google Gemini (`google-genai`) |
| **Frontend** | React 18, TypeScript, Vite, Material UI, React Query, Zustand, React Router, Recharts |

---

## Project structure

```
master_rad/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routers (auth, products, cart, orders, payments, recommendations, support, admin, …)
│   │   ├── core/         # config constants, security helpers
│   │   ├── db/           # database session & base
│   │   ├── ml/           # recommendation engine: engine, signals, cold_start, storage
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # business logic (auth, orders, payments, recommendations, support)
│   │   ├── config.py     # settings loaded from .env
│   │   └── main.py       # FastAPI app entrypoint
│   ├── alembic/          # database migrations
│   ├── seed_data.py      # seed the DB with demo products/users
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/          # API client
    │   ├── components/   # UI components (auth, chat, home, layout, product, recommendations, …)
    │   ├── pages/        # routed pages (+ admin/)
    │   ├── stores/       # Zustand stores
    │   ├── i18n/         # English / Serbian translations
    │   └── types/
    ├── package.json
    └── .env.example
```

---

## Getting started

### Prerequisites
- **Python 3.12+**
- **Node.js 18+**
- **PostgreSQL 14+** running locally

### 1. Database

Create a database and user, then put the connection string in `backend/.env`:

```sql
CREATE USER masterrad WITH PASSWORD 'yourpassword';
CREATE DATABASE masterrad_db OWNER masterrad;
```

### 2. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install "psycopg[binary]"        # PostgreSQL driver for SQLAlchemy 2.1

cp .env.example .env                 # then fill in the values
alembic upgrade head                 # apply migrations
python seed_data.py                  # optional: load demo data
uvicorn app.main:app --reload
```

API runs at **http://localhost:8000** — interactive docs at **http://localhost:8000/docs**.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env                 # then fill in the values
npm run dev
```

App runs at **http://localhost:5173**.

---

## Configuration

All backend configuration is read from `backend/.env` (see `.env.example`):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Secret used to sign JWT tokens |
| `STRIPE_SECRET_KEY` | Stripe secret key (leave empty to disable payments) |
| `LLM_PROVIDER` / `LLM_MODEL` / `LLM_API_KEY` | Support chatbot LLM configuration |
| `COLD_START_THRESHOLD` | Min. interactions before switching from cold-start to collaborative filtering |
| `RECOMMENDATION_COUNT` | Number of recommendations returned |
| `AUTO_RETRAIN_THRESHOLD` | New interactions needed to trigger model retraining |

Frontend config lives in `frontend/.env` (`VITE_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`).

> **Never commit real secrets.** `.env` files are git-ignored; only `.env.example` (with empty/placeholder values) is tracked.

---

## How the recommender works

1. **Signal collection** — user actions (purchase, wishlist, review) are turned into weighted scores and assembled into a user–item interaction matrix (`app/ml/signals.py`).
2. **Training** — cosine similarity produces user–user and item–item similarity matrices (`app/ml/engine.py`), which are persisted (`app/ml/storage.py`).
3. **Serving** — for an active user the engine predicts scores for unseen products; users below `COLD_START_THRESHOLD` interactions fall back to popularity/preference recommendations (`app/ml/cold_start.py`).
4. **Retraining** — once `AUTO_RETRAIN_THRESHOLD` new interactions accumulate, the model retrains in the background.

---

## License

Academic / educational project. Not licensed for production use.
