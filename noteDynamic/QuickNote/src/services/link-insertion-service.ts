import { searchService, SearchResult } from './search-service';

export interface LinkInsertionOptions {
  maxLinks?: number;
  minKeywordLength?: number;
  skipStopWords?: boolean;
  priorityKeywords?: string[];
}

export interface InsertedLink {
  keyword: string;
  url: string;
  title: string;
  position: number;
  originalText: string;
  linkedText: string;
}

export interface LinkInsertionResult {
  originalText: string;
  linkedText: string;
  links: InsertedLink[];
  stats: {
    totalKeywords: number;
    linksInserted: number;
    searchTime: number;
  };
}

/**
 * Link Insertion Service
 * Automatically inserts relevant links into text based on keyword extraction
 */
export class LinkInsertionService {
  private stopWords: Set<string> = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
    'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
    'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we',
    'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all',
    'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
    'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make',
    'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could',
    'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only',
    'come', 'its', 'over', 'think', 'also', 'back', 'after',
    'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give',
    'day', 'most', 'us', 'is', 'was', 'are', 'were', 'been',
  ]);

  /**
   * Extract keywords from text
   */
  private extractKeywords(
    text: string,
    options: LinkInsertionOptions = {}
  ): string[] {
    const { minKeywordLength = 4, skipStopWords = true, priorityKeywords = [] } = options;

    // Clean and split text
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= minKeywordLength);

    // Count frequency
    const freq: Map<string, number> = new Map();
    words.forEach(w => {
      if (skipStopWords && this.stopWords.has(w)) return;
      freq.set(w, (freq.get(w) || 0) + 1);
    });

    // Prioritize specific keywords
    priorityKeywords.forEach(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      if (text.toLowerCase().includes(lowerKeyword)) {
        freq.set(lowerKeyword, (freq.get(lowerKeyword) || 0) + 10);
      }
    });

    // Sort by frequency and return unique keywords
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);
  }

  /**
   * Search for links for a keyword
   */
  private async searchForLink(keyword: string): Promise<SearchResult | null> {
    try {
      const result = await searchService.searchSingle(keyword);
      return result;
    } catch (error) {
      console.warn(`Search failed for keyword "${keyword}":`, error);
      return null;
    }
  }

  /**
   * Insert markdown links into text
   */
  private insertLinks(
    text: string,
    links: InsertedLink[]
  ): string {
    let linkedText = text;
    let offset = 0;

    // Sort links by position (descending) to avoid offset issues
    const sortedLinks = [...links].sort((a, b) => b.position - a.position);

    for (const link of sortedLinks) {
      const adjustedPosition = link.position + offset;
      const before = linkedText.slice(0, adjustedPosition);
      const after = linkedText.slice(adjustedPosition + link.originalText.length);
      const linked = `[${link.originalText}](${link.url} "${link.title}")`;

      linkedText = before + linked + after;
      offset += linked.length - link.originalText.length;
    }

    return linkedText;
  }

  /**
   * Main method: Insert links into text
   */
  async insertLinks(
    text: string,
    options: LinkInsertionOptions = {}
  ): Promise<LinkInsertionResult> {
    const startTime = Date.now();
    const { maxLinks = 3 } = options;

    // Extract keywords
    const keywords = this.extractKeywords(text, options);

    if (keywords.length === 0) {
      return {
        originalText: text,
        linkedText: text,
        links: [],
        stats: {
          totalKeywords: 0,
          linksInserted: 0,
          searchTime: Date.now() - startTime,
        },
      };
    }

    // Search for links
    const insertedLinks: InsertedLink[] = [];
    const processedKeywords = new Set<string>();

    for (const keyword of keywords.slice(0, maxLinks * 2)) {
      if (insertedLinks.length >= maxLinks) break;
      if (processedKeywords.has(keyword)) continue;

      processedKeywords.add(keyword);

      // Find all occurrences of the keyword
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      let match;

      while ((match = regex.exec(text)) !== null) {
        if (insertedLinks.length >= maxLinks) break;

        // Check if this position overlaps with existing links
        const position = match.index;
        const originalText = match[0];

        const overlaps = insertedLinks.some(
          link =>
            position < link.position + link.originalText.length &&
            position + originalText.length > link.position
        );

        if (overlaps) continue;

        // Search for a link
        const searchResult = await this.searchForLink(keyword);

        if (searchResult) {
          insertedLinks.push({
            keyword,
            url: searchResult.url,
            title: searchResult.title,
            position,
            originalText,
            linkedText: `[${originalText}](${searchResult.url})`,
          });
        }

        break; // Only first occurrence per keyword
      }
    }

    // Insert links into text
    const linkedText = this.insertLinks(text, insertedLinks);

    return {
      originalText: text,
      linkedText,
      links: insertedLinks,
      stats: {
        totalKeywords: keywords.length,
        linksInserted: insertedLinks.length,
        searchTime: Date.now() - startTime,
      },
    };
  }
}

// Export singleton instance
export const linkInsertionService = new LinkInsertionService();
