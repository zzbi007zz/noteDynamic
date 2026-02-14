# QuickNote Mobile App

A React Native hybrid mobile app for quick note-taking with OCR and auto-search capabilities. Perfect for capturing and organizing notes while browsing Facebook.

## Features

- **Screenshot OCR**: Extract text from screenshots using ML Kit
- **Smart Note Creation**: Quick notes from shared content
- **Auto-search & Link Insertion**: Parse text, search web, auto-insert relevant links
- **Offline Storage**: Local-first with WatermelonDB + Firebase sync
- **Share Extension**: iOS/Android share from Facebook and other apps

## Tech Stack

- React Native 0.78+ with TypeScript
- Zustand (state management)
- React Navigation v7
- Firebase (Auth, Firestore, Storage)
- WatermelonDB (offline storage)
- SerpAPI (web search)

## Getting Started

### Prerequisites

- Node.js >= 22
- React Native CLI
- Xcode >= 15 (for iOS)
- Android Studio (for Android)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd noteDynamic
   ```

2. Install dependencies:
   ```bash
   npm install
   cd ios && pod install && cd ..
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. Start Metro bundler:
   ```bash
   npm start
   ```

5. Run on iOS:
   ```bash
   npm run ios
   ```

6. Run on Android:
   ```bash
   npm run android
   ```

### Environment Variables

Create a `.env` file with:

```env
# Firebase
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef

# SerpAPI (for auto-search)
SERPAPI_KEY=your_serpapi_key
```

## Project Structure

```
noteDynamic/
├── src/
│   ├── components/        # Reusable UI components
│   ├── config/            # Firebase configuration
│   ├── data/
│   │   ├── database/      # WatermelonDB setup
│   │   ├── models/       # Data models
│   │   ├── repositories/ # Data repositories
│   │   └── sync/         # Sync engine
│   ├── hooks/             # Custom React hooks
│   ├── navigation/        # React Navigation setup
│   ├── screens/           # App screens
│   ├── services/          # External services
│   ├── store/             # Zustand stores
│   └── theme/             # Theme configuration
├── ios/                   # iOS native code
│   ├── ShareExtension/    # iOS Share Extension
│   └── LocalPods/        # Native modules
├── android/               # Android native code
├── __tests__/             # Unit tests
└── plans/                 # Implementation plans
```

## Screens

- **Notes Screen**: List and manage all notes
- **Capture Screen**: Capture screenshots for OCR
- **OCR Review Screen**: Review and edit extracted text
- **Settings Screen**: App configuration
- **Auth Screens**: Login/Register

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Metro bundler |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm test` | Run unit tests |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript check |

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Architecture

### Data Flow
```
User Input → Zustand Store → WatermelonDB (local)
                                ↓
                          Firebase (sync)
```

### Auto-Search Flow
```
User Types → Debounce → Parse Keywords → SerpAPI
                                            ↓
Display Link ← Format Markdown ← Claude Rank
```

## License

MIT
