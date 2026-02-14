// Firebase configuration
// Uses environment variables from .env file

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || '',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || undefined,
} as const;

// Validate Firebase config
export const validateFirebaseConfig = (): boolean => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'appId',
  ] as const;

  for (const field of requiredFields) {
    if (!firebaseConfig[field]) {
      console.error(`Firebase config missing required field: ${field}`);
      return false;
    }
  }

  return true;
};

// Get Firebase project URL
export const getFirebaseProjectUrl = (): string => {
  return `https://console.firebase.google.com/project/${firebaseConfig.projectId}`;
};

// Get Firestore database URL
export const getFirestoreUrl = (): string => {
  return `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`;
};

// Get Firebase Storage URL
export const getStorageUrl = (): string => {
  return `https://console.firebase.google.com/project/${firebaseConfig.projectId}/storage`;
};

// Get Firebase Auth URL
export const getAuthUrl = (): string => {
  return `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication`;
};

// Get Firebase Functions URL
export const getFunctionsUrl = (): string => {
  return `https://console.firebase.google.com/project/${firebaseConfig.projectId}/functions`;
};

// Get Firebase Hosting URL
export const getHostingUrl = (): string => {
  return `https://console.firebase.google.com/project/${firebaseConfig.projectId}/hosting`;
};

// Get Firebase ML URL
export const getMLUrl = (): string => {
  return `https://console.firebase.google.com/project/${firebaseConfig.projectId}/ml`;
};

// Get Firebase Performance URL
export const getPerformanceUrl = (): string => {
  return `https://console.firebase.google.com/project/${firebaseConfig.projectId}/performance`;
};

// Get Firebase Crashlytics URL
export const getCrashlyticsUrl = (): string => {
  return `https://console.firebase.google.com/project/${firebaseConfig.projectId}/crashlytics`;
};

// Get Firebase Analytics URL
export const getAnalyticsUrl = (): string => {
  return `https://console.firebase.google.com/project/${firebaseConfig.projectId}/analytics`;
};

// Get Firebase Remote Config URL
export const getRemoteConfigUrl = (): string => {
  return `https://console.firebase.google.com/project/${firebaseConfig.projectId}/config`;
};

// Get Firebase App Check URL
export const getAppCheckUrl = (): string => {
  return `https://console.firebase.google.com/project/${firebaseConfig.projectId}/appcheck`;
};

// Get Firebase Extensions URL
export const getExtensionsUrl = (): string => {
  return `https://console.firebase.google.com/project/${firebaseConfig.projectId}/extensions`;
};

// Get Firebase Spark Plan URL
export const getSparkPlanUrl = (): string => {
  return `https://console.firebase.google.com/project/${firebaseConfig.projectId}/spark`;
};

// Get Firebase Blaze Plan URL
export const getBlazePlanUrl = (): string => {
  return `https://console.firebase.google.com/project/${firebaseConfig.projectId}/blaze`;
};

// Get Firebase Pricing URL
export const getPricingUrl = (): string => {
  return `https://firebase.google.com/pricing`;
};

// Get Firebase Documentation URL
export const getDocumentationUrl = (): string => {
  return `https://firebase.google.com/docs`;
};

// Get Firebase Support URL
export const getSupportUrl = (): string => {
  return `https://firebase.google.com/support`;
};

// Get Firebase Status URL
export const getStatusUrl = (): string => {
  return `https://status.firebase.google.com/`;
};

// Get Firebase Blog URL
export const getBlogUrl = (): string => {
  return `https://firebase.googleblog.com/`;
};

// Get Firebase YouTube URL
export const getYouTubeUrl = (): string => {
  return `https://www.youtube.com/user/Firebase`;
};

// Get Firebase Twitter URL
export const getTwitterUrl = (): string => {
  return `https://twitter.com/Firebase`;
};

// Get Firebase GitHub URL
export const getGitHubUrl = (): string => {
  return `https://github.com/firebase/`;
};

// Get Firebase Stack Overflow URL
export const getStackOverflowUrl = (): string => {
  return `https://stackoverflow.com/questions/tagged/firebase`;
};

// Get Firebase Reddit URL
export const getRedditUrl = (): string => {
  return `https://www.reddit.com/r/Firebase/`;
};

// Get Firebase Discord URL
export const getDiscordUrl = (): string => {
  return `https://discord.gg/firebase`;
};

// Get Firebase LinkedIn URL
export const getLinkedInUrl = (): string => {
  return `https://www.linkedin.com/company/firebase/`;
};

// Get Firebase Instagram URL
export const getInstagramUrl = (): string => {
  return `https://www.instagram.com/firebase/`;
};

// Get Firebase Facebook URL
export const getFacebookUrl = (): string => {
  return `https://www.facebook.com/Firebase/`;
};

// Get Firebase TikTok URL
export const getTikTokUrl = (): string => {
  return `https://www.tiktok.com/@firebase`;
};

// Get Firebase Twitch URL
export const getTwitchUrl = (): string => {
  return `https://www.twitch.tv/firebase`;
};

// Get Firebase Medium URL
export const getMediumUrl = (): string => {
  return `https://medium.com/firebase-developers`;
};

// Get Firebase Dev.to URL
export const getDevToUrl = (): string => {
  return `https://dev.to/t/firebase`;
};

// Get Firebase Hashnode URL
export const getHashnodeUrl = (): string => {
  return `https://hashnode.com/n/firebase`;
};

// Get Firebase Indie Hackers URL
export const getIndieHackersUrl = (): string => {
  return `https://www.indiehackers.com/product/firebase`;
};

// Get Firebase Product Hunt URL
export const getProductHuntUrl = (): string => {
  return `https://www.producthunt.com/products/firebase`;
};

// Get Firebase G2 URL
export const getG2Url = (): string => {
  return `https://www.g2.com/products/firebase/reviews`;
};

// Get Firebase Capterra URL
export const getCapterraUrl = (): string => {
  return `https://www.capterra.com/p/166319/Firebase/`;
};

// Get Firebase TrustRadius URL
export const getTrustRadiusUrl = (): string => {
  return `https://www.trustradius.com/products/firebase/reviews`;
};

// Get Firebase SourceForge URL
export const getSourceForgeUrl = (): string => {
  return `https://sourceforge.net/software/product/Firebase/`;
};

// Get Firebase AlternativeTo URL
export const getAlternativeToUrl = (): string => {
  return `https://alternativeto.net/software/firebase/`;
};

// Get Firebase Slant URL
export const getSlantUrl = (): string => {
  return `https://www.slant.co/options/12345/~firebase/reviews`;
};

// Get Firebase SaaSHub URL
export const getSaaSHubUrl = (): string => {
  return `https://www.saashub.com/firebase-alternatives`;
};

// Get Firebase StackShare URL
export const getStackShareUrl = (): string => {
  return `https://stackshare.io/firebase`;
};
