# Imposters Game

A fun imposter game for friends - a pure frontend application built with Next.js and Tailwind CSS.

## Features

- 🎮 Single-device gameplay (perfect for passing around a phone/tablet)
- 👥 Support for 4-10 players
- 💾 Automatic game state persistence using localStorage
- 🎨 Beautiful, modern UI with gradient backgrounds
- 📱 Responsive design for mobile and desktop

## Game Flow

1. **Setup Screen**: Enter the number of players (4-10)
2. **Name Collection**: Collect names for each player
3. **Game Lobby**: Review all players and start the game
4. **Active Game**: Players take turns to see their roles (Imposter or Crewmate)
5. **Results Screen**: View who was the imposter and play again

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and configure the build
4. Deploy!

Or use the Vercel CLI:
```bash
npm i -g vercel
vercel
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Storage**: localStorage (browser storage)
- **Language**: TypeScript

## Project Structure

```
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main page with screen routing
│   └── globals.css     # Global styles with Tailwind
├── components/
│   ├── SetupScreen.tsx           # Player count input
│   ├── NameCollectionScreen.tsx  # Name collection
│   ├── LobbyScreen.tsx           # Game lobby
│   ├── GameScreen.tsx            # Active gameplay
│   └── ResultsScreen.tsx         # Game results
├── contexts/
│   └── GameContext.tsx  # Game state management
└── package.json
```

## How to Play

1. Start the game and enter the number of players
2. Enter each player's name
3. Review the lobby and start the game
4. Pass the device around - each player reveals their role
5. After all players have seen their roles, view the results
6. Play again with the same players or start a new game

Enjoy playing! 🎉
