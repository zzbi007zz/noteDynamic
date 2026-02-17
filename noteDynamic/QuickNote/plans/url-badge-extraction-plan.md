# URL Badge Extraction Feature Plan

## Overview
Implement automatic URL detection from OCR-extracted text, fetch website metadata, and display as rich badges in notes.

## User Flow
1. User takes screenshot of social media post/website containing a URL
2. OCR extracts text including the URL (e.g., `https://github.com/decolua/9router`)
3. App detects URL pattern in extracted text
4. App fetches website metadata (title, description, favicon)
5. App displays as "badge" in note with:
   - Site title
   - Description
   - Favicon
   - Clickable link

## Implementation Steps

### Phase 1: URL Detection
- [ ] Add regex-based URL extraction from OCR text
- [ ] Support http:// and https:// patterns
- [ ] Handle common TLDs

### Phase 2: Metadata Fetching
- [ ] Create service to fetch website metadata
- [ ] Parse Open Graph tags (og:title, og:description, og:image)
- [ ] Fallback to standard HTML meta tags
- [ ] Extract favicon

### Phase 3: Badge Display
- [ ] Create Badge component
- [ ] Show title, description, favicon
- [ ] Make clickable to open URL
- [ ] Style consistently with app theme

### Phase 4: Integration
- [ ] Wire into OCR processing flow
- [ ] Store badge data in note model
- [ ] Display badges in note view

## Technical Considerations

### CORS Issues
- Fetching website metadata from mobile app may hit CORS
- Solution: Use headless browser service or proxy

### Performance
- Fetch metadata asynchronously
- Show loading state while fetching
- Cache metadata to avoid repeated fetches

### Privacy
- Only fetch URLs user explicitly captures
- Don't track or store user browsing

## Data Model

```typescript
interface UrlBadge {
  id: string;
  url: string;
  title: string;
  description: string;
  faviconUrl?: string;
  imageUrl?: string; // Open Graph image
  fetchedAt: Date;
}

// Add to Note model
interface Note {
  // ... existing fields
  urlBadges: UrlBadge[];
}
```

## UI Mockup

```
┌─────────────────────────────────┐
│ My Note Title                   │
├─────────────────────────────────┤
│                                 │
│ Extracted from screenshot:      │
│ "Check out this repo...         │
│ https://github.com/..."         │
│                                 │
│ ┌───────────────────────────┐   │
│ │ 🌐 GitHub - decolua/9... │   │
│ │ Universal AI Proxy for... │   │
│ │ github.com/decolua/9r...  │   │
│ └───────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

## Success Criteria
- [ ] URLs detected from OCR text with >95% accuracy
- [ ] Website metadata fetched and displayed as badge
- [ ] Badge shows title, description, and is clickable
- [ ] Works with common sites (GitHub, Twitter, etc.)
- [ ] Performance: <3s from detection to badge display
