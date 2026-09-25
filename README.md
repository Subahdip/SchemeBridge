# 🌉 SchemeBridge — AI-Driven Scheme Matching Platform

> Find smarter. Match better. Apply with confidence.

🌐 **Live Demo:** [SchemeBridge](https://sih-ai-xi.vercel.app/)

SchemeBridge is an AI-assisted digital platform developed by **Team DesiDevs_SurTech** for **Smart India Hackathon 2026**, under **Problem Statement SIH26092 — AI-Driven Scheme Matching for Marginalized Entrepreneurs**.

The platform helps entrepreneurs and applicants discover relevant government-backed concessional credit schemes through **AI-powered semantic matching, deterministic eligibility validation, financial planning, partner discovery, secure application submission, and persistent application tracking**.

---

## ✨ Features

- 🧠 **AI-Assisted Scheme Matching** — Uses text embeddings and cosine similarity to identify schemes that are semantically relevant to the user's requirements.

- 🔍 **Deterministic Eligibility Validation** — Applies rule-based checks for income, category, loan limits, and other scheme-specific eligibility constraints.

- 📊 **Scheme Relevance Ranking** — Combines semantic relevance with eligibility results to present the most suitable eligible schemes.

- 🌐 **Bilingual Interface** — Provides an English and Hindi interface with simplified labels for improved accessibility.

- 💰 **Financial Planning & EMI Calculator** — Helps users understand funding contribution, interest, loan amount, repayment period, EMI, and applicable moratorium parameters.

- 📈 **Financial Visualization** — Uses interactive charts to present EMI, funding contribution, interest, and repayment information.

- 📍 **Data-Driven Partner Discovery** — Helps users identify relevant channel partners using partner type, geographic proximity, scheme availability, and available institutional information.

- 📤 **Secure Application Submission** — Allows authenticated users to submit applications and persist application details.

- 📑 **Persistent Application Timeline** — Stores application records and workflow milestones in PostgreSQL so authenticated users can revisit their application progress.

- 🔐 **Authenticated APIs** — Uses Firebase Authentication and server-side token verification to protect user-specific application data.

- 📱 **Responsive Interface** — Designed for desktop and mobile web access.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Frontend** | Next.js 14+, React, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **AI / Semantic Matching** | OpenRouter Embeddings, Text Embeddings, Cosine Similarity |
| **Embedding Model** | `openai/text-embedding-3-small` |
| **API Layer** | Next.js REST API Routes |
| **Authentication** | Firebase Authentication, Token Verification |
| **Database** | Supabase PostgreSQL |
| **Data Visualization** | Recharts |
| **Maps & GIS** | Leaflet, React-Leaflet, OpenStreetMap |
| **Geolocation** | Browser Geolocation API |
| **State & Client Persistence** | Session Storage API |
| **Deployment** | GitHub, Vercel |

---

## 🚀 How It Works

```text
User Requirements
        ↓
AI Semantic Matching
        ↓
Text Embedding + Cosine Similarity
        ↓
Eligibility Hard Filter
        ↓
Top Eligible Schemes
        ↓
Financial Planning
        ↓
Partner Discovery
        ↓
Application Submission
        ↓
Supabase PostgreSQL
        ↓
Persistent Application Timeline
```

### 🧠 Hybrid AI + Rules Approach

SchemeBridge uses a two-stage matching architecture:

```text
User Profile & Requirements
            ↓
     Text Embedding
            ↓
    Cosine Similarity
            ↓
 Semantic Relevance Score
            ↓
 Deterministic Eligibility
        Hard Filter
            ↓
    Eligible Schemes
            ↓
     Scheme Ranking
            ↓
 Top Eligible Recommendations
```

**Semantic matching identifies relevant schemes, while deterministic rules enforce hard eligibility constraints.**

### 🔄 Application Flow

```text
User Requirements
        ↓
AI Semantic Matching
        ↓
Text Embedding + Cosine Similarity
        ↓
Eligibility Hard Filter
        ↓
Top Eligible Schemes
        ↓
Application
        ↓
Supabase PostgreSQL
        ↓
Persistent Timeline
```

---

## 💻 Run Locally

### Prerequisites

- Node.js 18.17.0 or higher
- npm
- Git

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Subahdip/SchemeBridge.git
   cd SchemeBridge
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start the Development Server**

   ```bash
   npm run dev
   ```

4. **Open the Application**

   Open:

   ```text
   http://localhost:3000
   ```

---

## ☁️ Deployment

SchemeBridge is deployed using **Vercel**.

The deployment workflow is:

```text
GitHub Repository
        ↓
      Vercel
        ↓
  Next.js Build
        ↓
Production Deployment
```

### 🌐 Live Application

**SchemeBridge:**  
https://sih-ai-xi.vercel.app/

---

## 👨‍💻 Team DesiDevs

Developed with ❤️ by **Team DesiDevs_SurTech** for **Smart India Hackathon 2026**.

### 🌉 SchemeBridge

> **Bridging Citizens to Government Opportunities.**

**Problem Statement:** SIH26092  
**Theme:** Smart Automation  
**Category:** Software  
**Team ID:** 162694

---

## ⭐ Support

If you like **SchemeBridge**, consider giving the repository a ⭐ on GitHub.

### 🔗 Project Links

**Live Demo:**  
https://sih-ai-xi.vercel.app/

**GitHub Repository:**  
https://github.com/Subahdip/SchemeBridge