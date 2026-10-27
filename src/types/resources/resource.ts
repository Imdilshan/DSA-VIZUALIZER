export type ResourceCategory = 
  | 'sheets'        // Curated Problem Sheets (Striver, CP-31, ACD, CSES, etc.)
  | 'contests'      // Practice & Contest Platforms (Codeforces, AtCoder, LeetCode, etc.)
  | 'books'         // Books & Handbooks (CLRS, Antti's CP handbook, etc.)
  | 'channels'      // Video Channels & Creators (Striver, NeetCode, Abdul Bari, etc.)
  | 'custom-sheet'; // AlgoArena Core Sheet (Managed by author)

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';

export interface ResourceItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: ResourceCategory;
  url: string;
  author?: string;
  difficulty: DifficultyLevel;
  tags: string[];
  topicTags?: string[]; // E.g., 'Arrays', 'Graphs', 'Dynamic Programming', 'Trees'
  badge?: string; // E.g., 'Essential', 'Community Pick', 'Official Sheet'
  featured?: boolean;
  rating?: number; // e.g. 4.9
  reviewCount?: number;
  stats?: {
    problemsCount?: number;
    platformName?: string;
    format?: string; // 'Interactive', 'PDF Handbook', 'Video Playlist', 'Online Judge'
  };
}

export type ProblemStatus = 'todo' | 'in_progress' | 'solved';

export interface CustomSheetProblem {
  id: string;
  title: string;
  topic: string;
  subtopic?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform: 'LeetCode' | 'Codeforces' | 'CSES' | 'GeeksforGeeks' | 'AtCoder';
  problemUrl: string;
  visualizerSlug?: string; // Links to internal visualization if implemented
  notes?: string;
  estimatedTime?: string;
}

export interface BookmarkRecord {
  id: string;
  user_id: string;
  resource_id: string;
  created_at: string;
}
