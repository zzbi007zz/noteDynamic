// Configuration for QuickNote app
// Add your Google Vision API key below or set it via environment variables

// Get your API key from: https://cloud.google.com/vision/docs/setup
const GOOGLE_VISION_API_KEY = 'AIzaSyCC8iEtJUMWK2OJbC5QXPgVKvgCZhgxKJc'; // <-- Paste your API key here

// API Endpoint
const GOOGLE_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

// Feature type for text detection
const TEXT_DETECTION_FEATURE = {
  type: 'TEXT_DETECTION',
  maxResults: 1
};

// Alternative: Use DOCUMENT_TEXT_DETECTION for dense text/images
const DOCUMENT_TEXT_DETECTION_FEATURE = {
  type: 'DOCUMENT_TEXT_DETECTION',
  maxResults: 1
};

export {
  GOOGLE_VISION_API_KEY,
  GOOGLE_VISION_API_URL,
  TEXT_DETECTION_FEATURE,
  DOCUMENT_TEXT_DETECTION_FEATURE
};

// Usage in your component:
// import { GOOGLE_VISION_API_KEY, GOOGLE_VISION_API_URL } from './config';
//
// const response = await fetch(`${GOOGLE_VISION_API_URL}?key=${GOOGLE_VISION_API_KEY}`, {...});
