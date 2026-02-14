# QuickNote Mobile App

A React Native hybrid mobile app for quick note-taking with OCR and auto-search capabilities.

## Features

- **Screenshot OCR**: Extract text from screenshots using ML Kit
- **Smart Note Creation**: Quick notes from shared content
- **Auto-search & Link Insertion**: Parse text, search web, auto-insert links
- **Offline Storage**: Local-first with Firebase sync
- **Facebook Share Extension**: iOS/Android share from Facebook app

## Tech Stack

- React Native 0.78+ with TypeScript
- Zustand (state management)
- React Navigation v7
- Firebase (Auth, Firestore, Storage)
- React Native ML Kit (OCR)
- WatermelonDB (offline storage)

## Getting Started

### Prerequisites

- Node.js >= 22
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd ios && pod install && cd ..
   ```
3. Start Metro bundler:
   ```bash
   npm start
   ```
4. Run on iOS:
   ```bash
   npm run ios
   ```
5. Run on Android:
   ```bash
   npm run android
   ```

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Add Android and iOS apps
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
4. Place files in respective platform directories
5. Enable Authentication (Email/Password) and Firestore

## Project Structure

```
src/
├── components/        # Reusable UI components
├── features/         # Feature-based modules
├── hooks/            # Custom React hooks
├── navigation/       # Navigation configuration
├── services/         # External services (Firebase, APIs)
├── store/            # State management (Zustand)
├── theme/            # Theme and styling
└── utils/            # Utility functions
```

## Scripts

- `npm start` - Start Metro bundler
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript check

## License

MIT
