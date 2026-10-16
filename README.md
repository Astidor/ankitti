# 🎀 Ankitti (あんキティ)

> **The ultra-cute, high-performance Anki spaced-repetition web app with a Sanrio / Hello Kitty aesthetic, macOS & iOS glass design, DeepSeek AI deck generator, screenshot attachments, and real SQLite multi-user database.**

---

## ✨ Features

- **🌸 Hello Kitty + Apple iOS Design**: Tactile buttons, pastel cards, glassmorphic sheets, cherry blossom particles, and study companions.
- **🔐 Production Auth & Real Database**:
  - Full registration, login, and session tokens.
  - Native Node 22 SQLite database (`ankitti.db`) with multi-user isolation.
  - Pre-seeded with a demo account: `kitty@sanrio.com` (password: `kitty123`).
- **🤖 DeepSeek AI Deck Generator**:
  - Automatically crafts complete, exam-ready flashcard decks from any topic or study notes using `deepseek-chat`.
  - Configurable in `.env` via `DEEPSEEK_API_KEY` or `VITE_DEEPSEEK_API_KEY`, or entered directly in the UI modal.
- **📸 Screenshot & Image Attachments**:
  - Upload or **paste directly from your clipboard (`Ctrl+V` / `Cmd+V`)** on both the **Front** and **Back** of cards.
  - Supports diagrams, histology slides, equations, and visual study aids.
- **🔁 Same-Day Relearning**:
  - Practice any deck whenever you want without being locked out like standard Anki.
- **💾 Auto-Save & Draft Protection**:
  - Real-time draft auto-saving ensures you never lose in-progress flashcards.
- **📦 Anki Import & Export**:
  - Import `.apkg` or tab-separated text files; export your decks anytime as JSON.

---

## 🚀 Quick Start

### 1. Configure Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```bash
DEEPSEEK_API_KEY="your-deepseek-api-key-here"
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. Both the Vite client and Express backend API run concurrently on the same port!

---

## 👩‍⚕️ Default Credentials
For quick testing, you can use the pre-configured Sanrio account or click the **1-Click Demo Fill** button in the sign-in modal:
- **Email**: `kitty@sanrio.com`
- **Password**: `kitty123`

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Backend & Database**: Express.js embedded middleware, Node 22 native `node:sqlite`, PBKDF2 SHA-512 password hashing
- **AI Integration**: DeepSeek API (`deepseek-chat`)
