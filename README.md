# List Calculator

A mobile-first web application for managing lists of numbers with real-time arithmetic operations, cloud sync, and multi-language support.

Built as a lightweight alternative to spreadsheets for quick calculations — grocery totals, expense splits, inventory counts, and similar everyday tasks.

## Features

### Core Functionality
- **Two arithmetic modes** — addition and subtraction with instant total recalculation
- **Item management** — add items with descriptions and numeric values, remove individually or clear all
- **Adaptive number formatting** — locale-aware display with automatic font scaling for large totals
- **Click-to-copy total** — tap the total to copy it to clipboard

### List Archive
- Save lists with custom titles to a local archive
- Load, edit, and re-save archived lists
- Unsaved changes protection — prompts before discarding modified data
- Delete archived lists individually

### Cloud Sync (Firebase)
- **Google OAuth** authentication
- Automatic cloud save on list creation/update
- Two-way sync — merges local and cloud data without conflicts
- Seamless device transfer — access your lists from any browser

### Export & Share
- **Copy as text** — formatted plain-text output
- **Download as CSV** — Excel-compatible with proper encoding (BOM) and quote escaping
- **Native share** — uses Web Share API on supported devices, falls back to clipboard

### Internationalization
4 fully translated languages:
- Russian (default)
- English
- Spanish
- Chinese

### UX Details
- Mobile-first layout with desktop preview mode (centered card with max-width)
- State persistence via `localStorage` — survives page reloads
- Toast notifications for user feedback
- Animated item additions
- Auto-focus on value input after adding an item

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [React 19](https://react.dev/) |
| Bundler | [Vite 8](https://vite.dev/) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) + [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate) |
| Icons | [Lucide React](https://lucide.dev/) |
| Auth & Database | [Firebase 12](https://firebase.google.com/) (Authentication + Firestore) |
| Linting | [ESLint 9](https://eslint.org/) with React Hooks & Refresh plugins |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/kostanian/list-calculator.git
cd list-calculator
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
npm run preview   # preview the production build
```

## Project Structure

```
src/
├── App.jsx        # Main application component (all logic & UI)
├── main.jsx       # React entry point
├── index.css      # Tailwind CSS imports
├── App.css        # Additional custom styles
└── assets/        # Static assets (icons, images)
```

The application is built as a single-component SPA — all state management uses React hooks (`useState`, `useRef`, `useEffect`) without external state libraries.

## Acknowledgements

This project was initially generated with the help of [Google Gemini](https://gemini.google.com/).

## License

MIT
