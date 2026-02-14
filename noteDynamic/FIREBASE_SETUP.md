# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `quicknote-dev` (or your preferred name)
4. Accept terms and create project

## Step 2: Register Web App

1. In Firebase Console, click the Web icon (</>)
2. Register app with nickname: "QuickNote Web"
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"

## Step 3: Copy Firebase Config

After registering, you'll see a Firebase config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAx...",
  authDomain: "quicknote-dev.firebaseapp.com",
  projectId: "quicknote-dev",
  storageBucket: "quicknote-dev.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

## Step 4: Update .env File

Copy the values from Firebase config to your `.env` file:

```
FIREBASE_API_KEY=your-actual-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

## Step 5: Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get Started"
3. Enable "Email/Password" provider
4. Enable "Google" provider (optional, for social login)

## Step 6: Set Up Firestore Database

1. Go to "Firestore Database"
2. Click "Create Database"
3. Choose "Start in production mode" or "Start in test mode"
4. Select location (e.g., "nam5 (us-central)")
5. Click "Enable"

## Step 7: Set Up Firestore Security Rules

Go to Firestore Database > Rules and paste these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Notes collection
    match /users/{userId}/notes/{noteId} {
      allow read: if request.auth != null &&
                   resource.data.userId == request.auth.uid;

      allow create: if request.auth != null &&
                      request.resource.data.userId == request.auth.uid;

      allow update: if request.auth != null &&
                      resource.data.userId == request.auth.uid &&
                      request.resource.data.userId == request.auth.uid;

      allow delete: if request.auth != null &&
                      resource.data.userId == request.auth.uid;
    }

    // Sync changes
    match /users/{userId}/changes/{changeId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click "Publish".

## Step 8: Set Up Storage (Optional)

For screenshots and attachments:

1. Go to "Storage"
2. Click "Get Started"
3. Choose "Start in production mode"
4. Select location
5. Click "Done"

Set Storage Security Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null &&
                          request.auth.uid == userId &&
                          request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

## Step 9: Download Config Files

### For Android:

1. Click the Android icon in Firebase Console
2. Register app with package name (e.g., `com.quicknote.app`)
3. Download `google-services.json`
4. Place in `android/app/google-services.json`

### For iOS:

1. Click the iOS icon in Firebase Console
2. Register app with bundle ID (e.g., `com.quicknote.app`)
3. Download `GoogleService-Info.plist`
4. Place in `ios/QuickNote/GoogleService-Info.plist`

## Step 10: Test Your Setup

Run the app:

```bash
npm install
npm run ios
# or
npm run android
```

Check console for Firebase initialization messages.

## Troubleshooting

### "Firebase app already exists"
- Make sure you're not initializing Firebase multiple times
- Check that `firebase.ts` properly checks for existing app

### "Permission denied" errors
- Check Firestore rules are published
- Verify user is authenticated
- Ensure `userId` matches authenticated user's UID

### Database not syncing
- Check internet connection
- Verify Firestore is enabled in Firebase Console
- Check browser console for errors

## Next Steps

1. Implement authentication flow
2. Create note CRUD operations
3. Set up offline support
4. Implement sync logic
5. Add image/screenshot handling

For more help, see:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [React Native Firebase](https://rnfirebase.io/)
