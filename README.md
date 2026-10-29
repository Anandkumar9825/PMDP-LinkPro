# LinkPro 🚀

> A full-stack, enterprise-grade professional networking and career acceleration platform featuring real-time messaging, AI-powered content generation, interactive resume building, and robust design patterns.

---

## 📌 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture & Design Patterns](#-system-architecture--design-patterns)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Environment Configuration](#-environment-configuration)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [Security & API Protection](#-security--api-protection)
- [Documentation & Diagrams](#-documentation--diagrams)
- [License](#-license)

---

## 🌟 Overview

**LinkPro** is a modern professional networking platform designed to empower professionals to connect, collaborate, and accelerate their careers. In addition to core social feeds and networking capabilities, LinkPro integrates generative AI (Google Gemini & Hugging Face local pipelines) to assist with post generation, smart comment suggestions, and an in-app interactive resume builder with instantaneous PDF export.

---

## ⚡ Key Features

- **🌐 Dynamic Feed & Engagement:**
  - Create, edit, and delete rich media posts.
  - Interactive like, comment, and save/bookmark systems.
  - User activity tracking and personalized feed streams.

- **💬 Real-Time Messaging & Status (Socket.IO):**
  - Instant one-on-one private messaging.
  - Real-time online/offline presence indicators.
  - Real-time notifications for incoming messages and invitations.

- **🤖 AI-Powered Intelligence Suite:**
  - **Post Enhancer:** Generate and polish professional post content using Google Gemini.
  - **Smart Comment Suggestions:** Context-aware reply suggestions powered by Gemini with fallback to dynamic engines.
  - **Local AI Fallback:** Resilient pipeline with Hugging Face transformers support.

- **📄 Interactive Resume Builder & Exporter:**
  - Comprehensive resume generator supporting work experience, education, skills, and projects.
  - Single-click PDF export powered by `jspdf`.

- **🤝 Networking & Connection Management:**
  - Send, accept, or withdraw connection requests.
  - Discover professionals and explore network graphs.

- **🔒 Enterprise Authentication & Security:**
  - Standard JWT-based authentication with secure HTTP cookies.
  - One-click Google OAuth 2.0 integration.
  - Password recovery with 6-digit OTP verification via Nodemailer.
  - Helmet HTTP security headers and Gzip compression.

---

## 🏛️ System Architecture & Design Patterns

LinkPro adheres to clean architecture principles and implements proven Gang of Four (GoF) design patterns:

| Pattern | Type | Implementation Location | Purpose |
| :--- | :--- | :--- | :--- |
| **Singleton** | Creational | `linkedin--backend/patterns/creational/DatabaseConnection.js` | Enforces a single MongoDB connection pool across the application lifecycle. |
| **Adapter** | Structural | `linkedin--backend/patterns/structural/EmailServiceAdapter.js` | Abstracts email delivery libraries (Nodemailer, SMTP, Console) behind a unified interface. |
| **Factory / Strategy** | Behavioral | `linkedin--backend/patterns/` & `controller/ai.js` | Selects between cloud and local AI models dynamically based on availability. |

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite 7
- **Styling:** Tailwind CSS 4, Material UI (`@mui/material`, `@mui/icons-material`, Lucide React)
- **State & Networking:** Axios, React Router 7, Socket.io-client
- **Authentication:** `@react-oauth/google`
- **PDF Generation:** `jspdf`

### Backend
- **Runtime:** Node.js (Express 5)
- **Database:** MongoDB & Mongoose ODM
- **Real-Time Engine:** Socket.IO
- **Security:** Helmet, bcryptjs, JSON Web Tokens (JWT), Cookie-Parser
- **AI Integrations:** `@google/genai`, `@huggingface/transformers`
- **Email Delivery:** Nodemailer

---

## 📂 Project Structure

```plaintext
LinkedIn/
├── linkedin--backend/             # Node.js + Express + Socket.IO backend
│   ├── authentication/            # Auth middlewares & email adapters
│   ├── controller/                # Request handlers (AI, User, Post, Chat, etc.)
│   ├── models/                    # Mongoose schemas & data models
│   ├── patterns/                  # GoF Design Patterns (Singleton, Adapter, etc.)
│   ├── routes/                    # Express API route declarations
│   ├── config.env.example         # Template for backend environment variables
│   ├── connection.js              # Centralized DB connector
│   ├── index.js                   # Server entrypoint
│   └── package.json
├── linkedin--frontend/            # React + Vite frontend
│   ├── src/                       # Components, Pages, Context, Hooks
│   ├── public/                    # Static assets
│   ├── .env.example               # Template for frontend environment variables
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── Material/                      # Project documentation, UML diagrams & slides
│   ├── UML Diagrams/              # Class, Use Case, Activity, & Sequence diagrams
│   ├── Gantt Chart/               # Project management & sprint tracking
│   └── Screenshots/               # Application UI previews
├── .gitignore                     # Git ignore rules protecting API keys and secrets
└── README.md
```

---

## 🔐 Environment Configuration

> **Note on Security:** All actual secrets, API tokens, and credentials are protected by `.gitignore` and never committed to version control.

### 1. Backend (`linkedin--backend/config.env`)
Create a `config.env` file in `linkedin--backend/` using `config.env.example` as a template:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
JWT_PRIVATE_KEY=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
GEMINI_API_KEY=your_google_gemini_api_key
```

### 2. Frontend (`linkedin--frontend/.env`)
Create a `.env` file in `linkedin--frontend/` using `.env.example` as a template:

```env
VITE_APP_GOOGLE_AUTH_KEY=your_google_client_id.apps.googleusercontent.com
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)
- [Git](https://git-scm.com/)

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd linkedin--backend

# Install dependencies
npm install

# Start development server
npm start
```
The backend server will run on `http://localhost:4000`.

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to the frontend directory
cd linkedin--frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend application will be accessible at `http://localhost:5173`.

---

## 🛡️ Security & API Protection

This repository follows standard security practices:
- **No hardcoded secrets:** MongoDB URIs, JWT signing keys, and Gemini API keys are loaded strictly from environment variables.
- **Gitignore Protection:** All `.env` files and session cache files are excluded from git tracking.
- **Sanitized Headers:** Protected with HTTP security headers via `helmet`.

---

## 📊 Documentation & Diagrams

Complete system documentation, UML diagrams (Class, Sequence, Interaction, State), Agile Gantt charts, and sprint logs are available in the [`Material/`](./Material) directory.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
