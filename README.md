# 🌉 SchemeBridge — AI-Driven Scheme Matching Platform

> Find smarter. Match better. Apply with confidence.

SchemeBridge is a bilingual digital platform developed by **Team DesiDevs** for **Smart India Hackathon 2026** under the **Ministry of Social Justice and Empowerment (MoSJE)**.

The platform helps entrepreneurs and applicants discover suitable government-backed concessional credit schemes through profile-based matching, financial planning tools, partner discovery, application submission, and application tracking.

---

## ✨ Features

- 🔍 **Smart Scheme Matcher** — Matches user and project details with suitable government credit schemes using rule-based eligibility criteria.

- 🌐 **Bilingual Interface** — Supports **English and Hindi** for improved accessibility.

- 📋 **Centralized Scheme Discovery** — Brings relevant government-backed schemes into a single platform.

- 🥧 **90/10 Funding Visualizer** — Clearly visualizes the **90% institutional loan and 10% promoter contribution** structure.

- 🧮 **Dynamic EMI Calculator** — Calculates EMI based on loan amount, interest rate, and repayment tenure.

- 📊 **Financial Visualization** — Displays EMI, principal, interest, and funding information through interactive charts.

- 📍 **NPA-Aware Partner Locator** — Helps users identify nearby channel partners using maps, geolocation, and available partner-status information.

- 📤 **Application Submission** — Provides a guided workflow for submitting applications through the selected partner.

- 📑 **Application Tracker** — Tracks application progress through stages such as **Submitted, Verified, Sanctioned, and Disbursed**.

- 🔐 **Secure Authentication** — Firebase Authentication provides user login and session management.

- 📱 **Responsive Design** — Designed for use across desktop and mobile devices.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Frontend** | Next.js 14, React, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **UI Icons** | Lucide React |
| **Authentication** | Firebase Authentication |
| **Data Visualization** | Recharts |
| **Maps & GIS** | Leaflet, React-Leaflet, OpenStreetMap |
| **Geolocation** | Browser Geolocation API |
| **State & Persistence** | Session Storage API |
| **Deployment** | GitHub, Vercel |

---

## 🚀 How It Works

```text
                         ┌───────────────────┐
                         │       User        │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │   SchemeBridge    │
                         │    Home Page      │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │  Authentication   │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │ Language Selection│
                         │  English / Hindi  │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │ User & Project    │
                         │     Details       │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │  Scheme Matcher   │
                         │ Rules-Based       │
                         │ Eligibility       │
                         └─────────┬─────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
                     ▼                           ▼
           ┌──────────────────┐       ┌──────────────────┐
           │   Not Eligible   │       │    Eligible      │
           └────────┬─────────┘       └────────┬─────────┘
                    │                          │
                    ▼                          ▼
           ┌──────────────────┐       ┌──────────────────┐
           │ Reason & Next-   │       │ Matched Schemes  │
           │ Step Suggestions │       └────────┬─────────┘
           └────────┬─────────┘                │
                    │                          │
                    └─────── Try Again ────────┘
                                               │
                                               ▼
                                  ┌──────────────────────┐
                                  │ 90/10 Funding        │
                                  │     Visualizer       │
                                  └──────────┬───────────┘
                                             │
                                             ▼
                                  ┌──────────────────────┐
                                  │ Dynamic EMI          │
                                  │     Calculator       │
                                  └──────────┬───────────┘
                                             │
                                             ▼
                                  ┌──────────────────────┐
                                  │ EMI & Funding        │
                                  │    Visualization     │
                                  └──────────┬───────────┘
                                             │
                                             ▼
                                  ┌──────────────────────┐
                                  │ NPA-Aware Partner    │
                                  │      Locator         │
                                  └──────────┬───────────┘
                                             │
                                             ▼
                                  ┌──────────────────────┐
                                  │ Application          │
                                  │     Submission       │
                                  └──────────┬───────────┘
                                             │
                                             ▼
                                  ┌──────────────────────┐
                                  │ Application Tracker  │
                                  └──────────┬───────────┘
                                             │
                                             ▼
                                  ┌──────────────────────┐
                                  │   Loan Disbursed     │
                                  └──────────────────────┘
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

---

## 👨‍💻 Team DesiDevs

Developed with ❤️ by **Team DesiDevs** for **Smart India Hackathon 2026**.

### 🌉 SchemeBridge

> **Bridging Citizens to Government Opportunities.**

---

## ⭐ Support

If you like **SchemeBridge**, consider giving the repository a ⭐ on GitHub.

**GitHub Repository:**

https://github.com/Subahdip/SchemeBridge