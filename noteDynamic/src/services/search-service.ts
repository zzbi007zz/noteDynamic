import { firebaseConfig } from '../config/firebase';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  displayUrl: string;
}

export interface SearchOptions {
  maxResults?: number;
  safeSearch?: boolean;
  language?: string;
  region?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  query: string;
}

/**
 * Web Search Service using SerpAPI
 * Provides Google search results for auto-link insertion
 */
export class SearchService {
  private apiKey: string;
  private baseUrl = 'https://serpapi.com/search';

  constructor() {
    // Get API key from environment or use default
    this.apiKey = process.env.SERPAPI_KEY || '';
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Perform a web search
   */
  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResponse> {
    if (!this.isConfigured()) {
      throw new Error(
        'SearchService not configured. Please set SERPAPI_KEY environment variable.'
      );
    }

    const {
      maxResults = 5,
      safeSearch = true,
      language = 'en',
      region = 'us',
    } = options;

    try {
      // Build search URL
      const params = new URLSearchParams({
        q: query,
        api_key: this.apiKey,
        engine: 'google',
        google_domain: 'google.com',
        gl: region,
        hl: language,
        safe: safeSearch ? 'active' : 'off',
        num: Math.min(maxResults, 10).toString(),
        output: 'json',
      });

      const response = await fetch(`${this.baseUrl}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Search API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Parse results
      const results: SearchResult[] = [];

      if (data.organic_results && Array.isArray(data.organic_results)) {
        for (const result of data.organic_results.slice(0, maxResults)) {
          results.push({
            title: result.title || '',
            url: result.link || '',
            snippet: result.snippet || '',
            displayUrl: result.displayed_link || result.link || '',
          });
        }
      }

      return {
        results,
        totalResults: data.search_information?.total_results || 0,
        searchTime: data.search_information?.time_taken_displayed || 0,
        query: data.search_parameters?.q || query,
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  /**
   * Search for a specific topic and return the best match
   */
  async searchSingle(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult | null> {
    const response = await this.search(query, { ...options, maxResults: 1 });
    return response.results[0] || null;
  }

  /**
   * Extract keywords from text and search for relevant links
   */
  async autoSearch(
    text: string,
    maxKeywords: number = 3,
    maxResultsPerKeyword: number = 2
  ): Promise<{ keyword: string; results: SearchResult[] }[]> {
    // Extract keywords (simple implementation - could be improved)
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !this.isStopWord(w));

    // Count frequency
    const freq: { [key: string]: number } = {};
    words.forEach(w => {
      freq[w] = (freq[w] || 0) + 1;
    });

    // Get top keywords
    const keywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);

    // Search for each keyword
    const results: { keyword: string; results: SearchResult[] }[] = [];

    for (const keyword of keywords) {
      try {
        const searchResult = await this.search(keyword, {
          maxResults: maxResultsPerKeyword,
        });
        results.push({
          keyword,
          results: searchResult.results,
        });
      } catch (error) {
        console.error(`Auto-search failed for keyword "${keyword}":`, error);
      }
    }

    return results;
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'this', 'that', 'with', 'from', 'they', 'them', 'their', 'there', 'when',
      'where', 'what', 'which', 'while', 'have', 'been', 'were', 'said', 'time',
      'than', 'them', 'into', 'just', 'like', 'over', 'also', 'back', 'only',
      'know', 'take', 'year', 'good', 'come', 'could', 'make', 'well', 'work',
      'first', 'very', 'even', 'want', 'here', 'look', 'down', 'most', 'long',
      'find', 'give', 'does', 'made', 'part', 'such', 'keep', 'call', 'came',
      'need', 'feel', 'seem', 'turn', 'hand', 'high', 'sure', 'upon', 'head',
      'help', 'home', 'side', 'move', 'both', 'five', 'once', 'same', 'each',
      'done', 'open', 'case', 'show', 'live', 'play', 'went', 'told', 'seen',
      'took', 'next', 'life', 'mind', 'word', 'text', 'note', 'page', 'line',
    ]);
    return stopWords.has(word);
  }
}

// Export singleton instance
export const searchService = new SearchService();
