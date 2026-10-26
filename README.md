# NAVIPORT: Machine Learning-Based Port Congestion Classification and Vessel Waiting Time Prediction System

NAVIPORT is a full-stack maritime operations intelligence platform that predicts port bottleneck severity and continuous vessel waiting times in days. The system uses genuine scikit-learn machine learning pipelines trained on 6,260 dated weekly records across 20 global hub ports from 2019 to 2024.

---

## 1. System Architecture

```
NAVIPORT/
├── backend/
│   ├── main.py                     # FastAPI application entrypoint with CORS & routes
│   ├── api/
│   │   └── routes.py               # API endpoints (/health, /metadata, /predict/*, /analytics/*)
│   ├── services/
│   │   ├── model_service.py        # Real scikit-learn pipeline inference & probability calculations
│   │   └── data_service.py         # Multi-year historical analytics & KPIs
│   ├── schemas/
│   │   └── models.py               # Pydantic request & response validation schemas
│   └── requirements.txt            # Python dependencies (FastAPI, uvicorn, scikit-learn, etc.)
├── models/
│   ├── classifier.joblib           # Trained GradientBoostingClassifier pipeline & LabelEncoder
│   ├── regressor.joblib            # Trained LinearRegression pipeline with ColumnTransformer
│   ├── congestion_quantiles.json   # Authoritative quantile cutoffs (low_thr: 1.24, high_thr: 2.90)
│   ├── classification_metrics.json # Evaluation reports (F1, Accuracy, AUC across candidates)
│   └── regression_metrics.json     # Evaluation reports (R², MAE, RMSE across candidates)
├── data_splits/
│   ├── train.csv                   # Chronological train split (2019-01 to 2022-12, 4,214 rows)
│   ├── val.csv                     # Chronological validation split (2023-01 to 2023-12, 1,044 rows)
│   ├── validation.csv              # Validation file alias for script interoperability
│   └── test.csv                    # Chronological test split (2024-01 to 2024-12, 1,002 rows)
├── src/
│   ├── components/                 # Header, Sidebar, StatCard, RecentPredictionsModal, Footer
│   ├── pages/
│   │   ├── LandingPage.tsx         # Executive overview, mission, and workflow
│   │   ├── DashboardPage.tsx       # Live operations deck with filters, KPIs & Recharts charts
│   │   ├── CongestionPredictionPage.tsx # Interactive classification tool with probabilities
│   │   ├── WaitingTimePredictionPage.tsx# Interactive waiting time regression tool & port benchmarks
│   │   ├── AnalyticsPage.tsx       # Historical trends, dual-axis dynamics & logbook table
│   │   ├── ModelInfoPage.tsx       # Live model artifact inspection & evaluated metrics
│   │   └── AboutPage.tsx           # Mathematical formulation, candidate algorithms & limitations
│   ├── services/
│   │   └── api.ts                  # REST API client
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── App.tsx                     # Main layout & state router
│   ├── index.css                   # Tailwind CSS & theme styling
│   └── main.tsx                    # React DOM entry point
├── server.ts                       # Express dev/prod proxy (runs on port 3000, manages Python)
├── data_processing.py              # Feature schema, time-derivation, and ColumnTransformer builder
├── train_classification.py         # Classification candidate evaluation and training script
├── train_regression.py             # Regression candidate evaluation and training script
└── package.json                    # Node dependencies & npm scripts
```

---

## 2. Machine Learning Pipeline Details

### 2.1 Preprocessing & Feature Schema
- **Categorical Features (3):** `port`, `country`, `region`
  - Encoded using `OneHotEncoder(handle_unknown="ignore")`.
- **Numeric Features (7):**
  - `throughput_teu_mn`: Port capacity scale in Millions of TEU.
  - `vessels_at_anchor`: Real-time queue count of container ships waiting at roadstead anchorages.
  - `port_utilization_pct`: Terminal container yard and berth occupancy percentage (0.0 to 1.0).
  - `berth_delay_hrs`: Cumulative berth operational lag in hours.
  - `year_num`: Calendar year derived from `week_start`.
  - `month`: Calendar month derived from `week_start`.
  - `week_of_year`: ISO calendar week derived from `week_start`.
- Normalized using `StandardScaler()` within a unified `ColumnTransformer`.

### 2.2 Classification Model
- **Task:** Discretize congestion severity into `Low`, `Medium`, or `High`.
- **Target:** `congestion_class` (derived from `congestion_index` using training set 33rd & 66th percentiles: `low_thr: 1.24`, `high_thr: 2.90`).
- **Evaluated Candidates:** Logistic Regression, Random Forest Classifier, Gradient Boosting Classifier.
- **Winning Model:** `GradientBoostingClassifier(random_state=42)`
  - Validation Macro F1: **0.9748**
  - Test Macro F1: **0.9418**
  - Test Accuracy: **94.61%**
  - Test Macro AUC: **0.9850**

### 2.3 Regression Model
- **Task:** Estimate average vessel waiting delay in days before berth assignment.
- **Target:** `avg_wait_days` (Days).
- **Evaluated Candidates:** Linear Regression, Random Forest Regressor, Gradient Boosting Regressor.
- **Winning Model:** `LinearRegression()`
  - Validation R²: **0.9984** (Validation MAE: 0.52 days)
  - Test R²: **0.9986** (Test MAE: 0.51 days)

---

## 3. Local Development Setup

### 3.1 Prerequisites
- Python 3.10+
- Node.js 18+ and npm / bun

### 3.2 Install Dependencies

1. **Python Backend Dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Frontend Dependencies:**
   ```bash
   npm install
   ```

### 3.3 Running the Application

#### Option A: Unified Full-Stack Runner (Recommended)
`server.ts` starts Express on port 3000, automatically launches the Python FastAPI backend on port 8000, and proxies all `/api/*` traffic:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Option B: Standalone Python Backend + Frontend
1. Start the Python FastAPI backend:
   ```bash
   python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```
2. In a separate terminal, start the frontend:
   ```bash
   npm run dev
   ```

---

## 4. API Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service health status, model loading state |
| `GET` | `/api/metadata` | 20 ports, countries, regions, records count, and thresholds |
| `POST` | `/api/predict/congestion` | Predicts Low/Medium/High class with class probabilities |
| `POST` | `/api/predict/waiting-time` | Predicts average wait days with historical port benchmark |
| `GET` | `/api/analytics/overview` | KPI summaries, class distribution, and port comparisons |
| `GET` | `/api/analytics/trends` | Chronological date-ordered aggregates (2019-2024) |
| `GET` | `/api/analytics/ports/{port}` | Historical observations logbook for a selected port |
| `GET` | `/api/models/info` | Dynamic inspection of loaded joblib model architectures |

---

## 5. Decision-Support Role and Limitations

NAVIPORT is designed as an operational decision-support tool for shipping lines, terminal operators, and supply chain dispatchers. Predicted waiting times are statistical machine learning outputs and do not represent contractual vessel ETAs or guaranteed arrival times. Actual turnaround performance remains contingent on exogenous factors including storm surges, labor disputes, customs clearance holds, and maritime chokepoints.
