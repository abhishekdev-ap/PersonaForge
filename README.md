# 🎭 PersonaForge

> **AI-Powered Adaptive Content Generation Platform**
> Extract identity and brand signals from text or website URLs to forge structured personas and automatically generate hyper-tailored content variants.

---

## 🌟 Overview

**PersonaForge** is an intelligent content creation engine built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS**. It transforms raw professional text or company URLs into structured **Individual** or **Company** personas. Using specialized AI generator agents, PersonaForge creates multi-angle content variants tailored to specific target audiences, brand tones, and platforms.

---

## ✨ Key Features

- **🌐 Dual Signal Extraction**: Input raw profile text or scrape company website URLs directly to extract brand and identity metadata.
- **🤖 Automated Persona Extraction**: Uses LLMs to infer key attributes:
  - **Individual**: Role, industry, seniority, skills, interests, tone preference, summary.
  - **Company**: Industry, size, target audience, offerings, brand values, tone, summary.
- **⚡ Multi-Agent Content Generators**:
  - 🚀 **Landing Page Generator**: Formulate compelling hero headlines, subheadings, feature bullet points, and high-converting CTAs.
  - ✉️ **Cold Email Generator**: Draft subject lines, opening hooks, value propositions, and personalized call-to-actions.
  - 📣 **Marketing Copy Generator**: Craft attention-grabbing hooks, key benefits, body copy, and campaign variations.
  - 💼 **LinkedIn Post Generator**: Generate engaging post copy, structured formatting, and relevant hashtags.
- **📦 Multi-Format Export**: Export generated content variants instantly into **Markdown (.md)**, **Plain Text (.txt)**, or **JSON (.json)** formats.
- **🎨 Interactive Modern UI**: Step-by-step wizard built with **Framer Motion**, **Lucide Icons**, and **shadcn/ui** components.

---

## 🏗️ Architecture & Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **Web Scraping & AI**: [Cheerio](https://cheerio.js.org/), `z-ai-web-dev-sdk` LLM SDK with robust JSON sanitization
- **Database & ORM**: [Prisma](https://www.prisma.io/) with SQLite
- **Runtime**: [Bun](https://bun.sh/) / [Node.js](https://nodejs.org/)

---

## 📁 Directory Structure

```
PersonaForge/
├── prisma/
│   └── schema.prisma          # SQLite database schema & Prisma models
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agents/        # Generator agents (landing-page, cold-emails, etc.)
│   │   │   ├── export/        # Multi-format export endpoint (TXT, JSON, MD)
│   │   │   ├── extract/       # Web scraping & text extraction endpoint
│   │   │   └── persona/       # Persona extraction LLM route
│   │   ├── globals.css        # Global CSS & Tailwind configuration
│   │   ├── layout.tsx         # Root layout component
│   │   └── page.tsx           # Step-by-step interactive wizard UI
│   ├── components/            # Reusable UI components (shadcn/ui)
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Database client & LLM JSON parser helpers
├── .env                       # Environment configuration
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.x or later) or **Bun**
- **npm**, **pnpm**, or **bun** package manager

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/abhishekdev-ap/PersonaForge.git
   cd PersonaForge
   ```

2. **Install dependencies**:
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./db/custom.db"
   ```

4. **Initialize Database**:
   ```bash
   npx prisma db push
   ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   # or
   bun run dev
   ```

6. Open `http://localhost:3000` in your browser to start forging personas!

---

## 📖 How It Works

1. **Step 1: Input Signals** — Paste profile text or enter a website URL.
2. **Step 2: Persona Review** — Review the auto-extracted identity signals and brand traits.
3. **Step 3: Content Generation** — Choose a content type (Landing Page, Cold Email, Marketing Copy, or LinkedIn Post) and optional custom prompt instructions.
4. **Step 4: Output & Export** — Preview interactive variants, copy content with one click, or export to `.md`, `.txt`, or `.json`.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
