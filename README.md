# NEXORA

> **A premium interactive learning platform for algorithms and artificial intelligence.**

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([download](https://nodejs.org))
- npm or pnpm

### Installation

```bash
# In the project root
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── page.tsx         # Landing page
│   ├── daa/             # Design & Analysis of Algorithms
│   ├── poai/            # Principles of AI
│   ├── advanced/        # Advanced topics
│   ├── simulations/     # Interactive simulations
│   └── challenges/      # Practice challenges
├── components/
│   ├── ui/              # Reusable base UI components
│   ├── layout/          # Navbar, Footer
│   └── landing/         # Landing page sections
├── lib/
│   ├── content/         # Course content data
│   └── utils.ts         # cn() helper
└── styles/
    └── globals.css      # Tailwind + custom CSS
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| 3D | Three.js / React Three Fiber |
| Graphs | D3.js |
| Animation | Framer Motion |
| Icons | Lucide React |

## 📋 Available Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/daa` | DAA course hub |
| `/daa/sorting` | Sorting algorithms |
| `/daa/graphs` | Graph algorithms |
| `/daa/dp` | Dynamic programming |
| `/poai` | AI Principles hub |
| `/advanced` | Advanced algorithms |
| `/simulations` | Interactive simulations |
| `/challenges` | Practice problems |

## 🎨 Design Principles

- **Dark-first**: Near-black base (`#030712`) with violet/cyan accents
- **Glass morphism**: Semi-transparent surfaces with backdrop blur
- **Honest UX**: No fake simulations — "Coming Soon" is clearly labeled
- **Accessible**: Semantic HTML, ARIA labels, keyboard navigable
- **Performance**: Static generation where possible, lazy client components

## 📝 License

MIT
