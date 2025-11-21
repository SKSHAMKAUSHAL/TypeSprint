# TypeSprint

A modern, minimalist typing speed test application built with Next.js 15, React 19, and TypeScript.

## 🚀 Features

- **Real-time WPM & Accuracy Tracking** - Live statistics as you type
- **Multiple Test Durations** - 30s, 60s, 90s, and 120s modes
- **Daily Leaderboard** - Anonymous or named score submissions
- **Smooth Animations** - Powered by Framer Motion
- **Performance Charts** - Visual feedback with Recharts
- **Dark Theme** - Sleek cyan accent color scheme
- **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB with Mongoose
- **Animations:** Framer Motion
- **Charts:** Recharts
- **UI Components:** Radix UI

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/SKSHAMKAUSHAL/TypeSprint.git
cd TypeSprint
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your MongoDB connection string to `.env`:
```env
MONGODB_URI="your_mongodb_atlas_connection_string"
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Import your repository on [Vercel](https://vercel.com/new)

3. Add environment variable in Vercel:
   - **Key:** `MONGODB_URI`
   - **Value:** Your MongoDB Atlas connection string

4. Deploy!

The `vercel.json` configuration is already included.

## 🗄️ MongoDB Setup

### Using MongoDB Atlas (Free Tier)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a cluster (M0 Free tier)
3. Create database user with password
4. Whitelist IP (use `0.0.0.0/0` for testing, restrict in production)
5. Get connection string and add to `.env`

**Connection string format:**
```
mongodb+srv://<username>:<password>@cluster.mongodb.net/typesprint?retryWrites=true&w=majority
```

## 📁 Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── leaderboard/  # Get top scores
│   │   └── save-result/  # Save test results
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Homepage
│   └── not-found.tsx     # 404 page
├── components/
│   ├── game/             # Game components
│   │   ├── TypingBoard.tsx
│   │   ├── ResultsModal.tsx
│   │   └── Leaderboard.tsx
│   └── ui/               # Reusable UI components
├── hooks/
│   └── useTypingGame.ts  # Typing engine logic
├── lib/
│   └── mongodb.ts        # Database connection
├── models/
│   ├── TestResult.ts     # Test result schema
│   └── index.ts          # Model exports
└── vercel.json           # Vercel configuration
```

## 🎮 How to Use

1. **Select Duration** - Choose test length (30s, 60s, 90s, 120s)
2. **Start Typing** - Begin typing to start the timer
3. **Complete Test** - Type until time runs out
4. **View Results** - See your WPM, accuracy, and performance chart
5. **Save Score** - Optionally save to daily leaderboard
6. **Check Rankings** - View top 10 scores in the sidebar

## 🔧 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🌟 Features Explained

### Typing Engine
- Character-by-character tracking
- Real-time error detection
- Backspace support
- Accurate WPM calculation

### Leaderboard
- Top 10 daily scores
- Anonymous submissions
- Optional usernames
- Auto-cleanup (24h TTL)
- Medal rankings (🥇🥈🥉)

### Statistics
- Words Per Minute (WPM)
- Accuracy percentage
- Error count
- Performance timeline

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👤 Author

**SKSHAMKAUSHAL**
- GitHub: [@SKSHAMKAUSHAL](https://github.com/SKSHAMKAUSHAL)

## 🙏 Acknowledgments

- Inspired by [Monkeytype](https://monkeytype.com)
- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)

---

⭐ Star this repo if you find it helpful!
