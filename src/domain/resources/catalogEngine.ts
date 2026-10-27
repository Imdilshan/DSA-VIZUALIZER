import type { ResourceItem, CustomSheetProblem, ResourceCategory, DifficultyLevel, ProblemStatus } from '../../types/resources/resource';
import { RESOURCES_DATA } from '../../data/resources/resourcesData';
import { ALGOARENA_CUSTOM_PROBLEMS } from '../../data/resources/customSheetData';

export interface ResourceQueryParams {
  query?: string;
  category?: ResourceCategory | 'all';
  difficulty?: DifficultyLevel | 'all';
  topic?: string | 'all';
  bookmarkedOnly?: boolean;
  bookmarkedIds?: Set<string>;
}

export interface ProgressSummary {
  total: number;
  solved: number;
  inProgress: number;
  percentage: number;
}

/**
 * Deep Catalog Engine: Encapsulates all query, filtering, taxonomy,
 * and contextual linkage operations away from UI components.
 */
export class CatalogEngine {
  private resources: ResourceItem[];
  private customProblems: CustomSheetProblem[];

  constructor(resources = RESOURCES_DATA, customProblems = ALGOARENA_CUSTOM_PROBLEMS) {
    this.resources = resources;
    this.customProblems = customProblems;
  }

  /**
   * Filter and query resources with multi-attribute search
   */
  queryResources(params: ResourceQueryParams): ResourceItem[] {
    const {
      query = '',
      category = 'all',
      difficulty = 'all',
      topic = 'all',
      bookmarkedOnly = false,
      bookmarkedIds = new Set()
    } = params;

    const normalizedQuery = query.trim().toLowerCase();

    return this.resources.filter(res => {
      // Bookmark filter
      if (bookmarkedOnly && !bookmarkedIds.has(res.id)) {
        return false;
      }

      // Category filter
      if (category !== 'all' && res.category !== category) {
        return false;
      }

      // Difficulty filter
      if (difficulty !== 'all' && res.difficulty !== difficulty && res.difficulty !== 'All Levels') {
        return false;
      }

      // Topic filter
      if (topic !== 'all') {
        const hasTopic = res.topicTags?.some(t => t.toLowerCase() === topic.toLowerCase());
        if (!hasTopic) return false;
      }

      // Query search
      if (normalizedQuery) {
        const inTitle = res.title.toLowerCase().includes(normalizedQuery);
        const inSubtitle = (res.subtitle || '').toLowerCase().includes(normalizedQuery);
        const inDesc = res.description.toLowerCase().includes(normalizedQuery);
        const inAuthor = (res.author || '').toLowerCase().includes(normalizedQuery);
        const inTags = res.tags.some(t => t.toLowerCase().includes(normalizedQuery));
        const inTopics = res.topicTags?.some(t => t.toLowerCase().includes(normalizedQuery));

        if (!inTitle && !inSubtitle && !inDesc && !inAuthor && !inTags && !inTopics) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Contextual discovery for algorithm pages
   */
  getContextualResources(topic: string): { resources: ResourceItem[]; problems: CustomSheetProblem[] } {
    const normalizedTopic = topic.toLowerCase();
    
    const matchingResources = this.resources.filter(res =>
      res.topicTags?.some(t => t.toLowerCase().includes(normalizedTopic) || normalizedTopic.includes(t.toLowerCase()))
    );

    const matchingProblems = this.customProblems.filter(p =>
      p.topic.toLowerCase().includes(normalizedTopic) || normalizedTopic.includes(p.topic.toLowerCase())
    );

    return {
      resources: matchingResources,
      problems: matchingProblems
    };
  }

  /**
   * Get sorted unique taxonomy of all topics
   */
  getTopicTaxonomy(): string[] {
    const set = new Set<string>();
    this.resources.forEach(r => r.topicTags?.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }

  /**
   * Calculate problem progress summary
   */
  calculateProgress(progressMap: Record<string, ProblemStatus>): ProgressSummary {
    const total = this.customProblems.length;
    const solved = this.customProblems.filter(p => progressMap[p.id] === 'solved').length;
    const inProgress = this.customProblems.filter(p => progressMap[p.id] === 'in_progress').length;
    const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

    return { total, solved, inProgress, percentage };
  }
}

export const catalog = new CatalogEngine();
