# 🚀 AlphaTrader Pro Journal

A professional-grade trading journal for serious traders. 100% Client-side. No backend required. Your data never leaves your browser.

## ✨ Features
- **The Cockpit**: Real-time performance metrics (P&L, Win Rate, Profit Factor).
- **Edge Analysis**: AI-powered trade review using Gemini API.
- **Privacy First**: All data is stored in your browser's `localStorage`.
- **Advanced Charts**: Equity curves and Github-style activity heatmaps.

## 📦 How to Upload to GitHub
1. Create a new repository on GitHub.
2. Open your terminal in this project folder.
3. Run the following commands:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AlphaTrader Pro"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

## 🌐 Hosting on GitHub Pages
1. Go to your repository on GitHub.
2. Click on **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select `Deploy from a branch`.
4. Select `main` branch and folder `/ (root)`.
5. Click **Save**. Your site will be live in a few minutes!

## 🛠️ Local Development
To run this locally, you don't need to build anything. Just use a simple static server:
```bash
npx serve .
```

## 🔑 AI Features
To use the AI Analyst, ensure you have a Gemini API Key. The app expects `process.env.API_KEY` to be available (handled automatically in certain environments) or you can modify `AIAnalyst.tsx` to use your preferred method of key management.