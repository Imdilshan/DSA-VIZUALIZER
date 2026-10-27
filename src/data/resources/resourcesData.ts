import type { ResourceItem } from '../../types/resources/resource';

export const RESOURCES_DATA: ResourceItem[] = [
  // ==========================================
  // 1. CURATED PROBLEM SHEETS
  // ==========================================
  {
    id: 'sheet-striver-a2z',
    title: "Striver's A2Z DSA Course & Sheet",
    subtitle: 'The premier step-by-step roadmap for software engineering interviews',
    description: 'A comprehensive, structured roadmap covering 450+ problems from basics (Arrays, Strings) to advanced (DP, Graphs, Tries, Segment Trees) with video solutions, articles, and C++/Java/Python code.',
    category: 'sheets',
    url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2',
    author: 'Raj Vikramaditya (Striver)',
    difficulty: 'All Levels',
    tags: ['Interview Prep', 'Comprehensive', 'Topic-wise', 'Video Explanations'],
    topicTags: ['Arrays', 'Binary Search', 'Linked Lists', 'Recursion', 'Bit Manipulation', 'Trees', 'Graphs', 'Dynamic Programming', 'Tries'],
    badge: 'Community Essential',
    featured: true,
    rating: 4.95,
    reviewCount: 32000,
    stats: {
      problemsCount: 455,
      platformName: 'takeuforward',
      format: 'Interactive Sheet & Videos'
    }
  },
  {
    id: 'sheet-cp31',
    title: 'CP-31 Sheet by TLE Eliminators',
    subtitle: 'Curated Codeforces problems ranked strictly by rating tiers',
    description: 'Targeted Codeforces problem sets separated by difficulty ratings (800, 900, 1000 ... up to 1600+). Specifically designed to help competitive programmers overcome plateau ratings and build contest intuition.',
    category: 'sheets',
    url: 'https://www.tle-eliminators.com/cp-sheet',
    author: 'Priyansh Agarwal (TLE Eliminators)',
    difficulty: 'Intermediate',
    tags: ['Competitive Programming', 'Codeforces Rating', 'Rating Climb', 'Contest Ready'],
    topicTags: ['Math', 'Greedy', 'Binary Search', 'Two Pointers', 'Dynamic Programming', 'Graphs', 'Number Theory'],
    badge: 'Top CP Sheet',
    featured: true,
    rating: 4.9,
    reviewCount: 14500,
    stats: {
      problemsCount: 496,
      platformName: 'TLE Eliminators',
      format: 'Rating-Based Problemset'
    }
  },
  {
    id: 'sheet-acd-ladders',
    title: 'ACD Ladders (A2OJ / Auto CP Ladders)',
    subtitle: 'Dynamic Codeforces practice ladder based on problem difficulty tags',
    description: 'The modern successor to the classic A2OJ Ladders. Allows you to input your Codeforces handle and solve problems matched to your current rating tier with automated problem-solve tracking.',
    category: 'sheets',
    url: 'https://acodedaily.com',
    author: 'A Code Daily Community',
    difficulty: 'Intermediate',
    tags: ['Codeforces', 'Auto-Sync', 'Adaptive Ladder', 'Competitive Programming'],
    topicTags: ['Implementation', 'Math', 'Data Structures', 'Greedy', 'Brute Force'],
    badge: 'Popular Tool',
    featured: false,
    rating: 4.8,
    reviewCount: 8900,
    stats: {
      platformName: 'ACD Ladders',
      format: 'Live Rating Tracker'
    }
  },
  {
    id: 'sheet-cses-problemset',
    title: 'CSES Problem Set',
    subtitle: 'The gold standard benchmark for algorithmic problem solving',
    description: 'Created by Antti Laaksonen at the University of Helsinki. Contains 300 classic algorithmic tasks covering Introductory, Sorting & Searching, DP, Graph Algorithms, Range Queries, Tree Algorithms, and Mathematics.',
    category: 'sheets',
    url: 'https://cses.fi/problemset/',
    author: 'Antti Laaksonen (Univ. of Helsinki)',
    difficulty: 'Advanced',
    tags: ['Gold Standard', 'Pure DSA', 'No Hidden Tricks', 'Benchmarking'],
    topicTags: ['Sorting', 'Searching', 'Dynamic Programming', 'Graphs', 'Trees', 'Range Queries', 'Math', 'Geometry'],
    badge: 'Gold Standard',
    featured: true,
    rating: 4.98,
    reviewCount: 22000,
    stats: {
      problemsCount: 300,
      platformName: 'CSES Finland',
      format: 'Online Judge & Tasks'
    }
  },
  {
    id: 'sheet-neetcode-150',
    title: 'NeetCode 150',
    subtitle: 'Essential LeetCode patterns for FAANG technical interviews',
    description: 'A focused, pattern-based selection of 150 LeetCode problems grouped into 18 categories with visual whiteboard breakdowns, video tutorials, and multiple language implementations.',
    category: 'sheets',
    url: 'https://neetcode.io/practice',
    author: 'Navdeep Singh (NeetCode)',
    difficulty: 'Beginner',
    tags: ['LeetCode Patterns', 'Interview Roadmap', 'Concise', 'Whiteboard Guides'],
    topicTags: ['Arrays', 'Two Pointers', 'Sliding Window', 'Stack', 'Binary Search', 'Trees', 'Graphs', 'Dynamic Programming'],
    badge: 'Interview Favorite',
    featured: false,
    rating: 4.88,
    reviewCount: 28000,
    stats: {
      problemsCount: 150,
      platformName: 'NeetCode.io',
      format: 'Interactive Roadmap'
    }
  },

  // ==========================================
  // 2. PRACTICE & CONTEST PLATFORMS
  // ==========================================
  {
    id: 'contest-codeforces',
    title: 'Codeforces',
    subtitle: 'The leading global competitive programming and rating platform',
    description: 'Hosts regular 2-hour rated rounds (Div 1, Div 2, Div 3, Div 4) featuring innovative problem sets, virtual contests, blog discussions, and an active global CP community.',
    category: 'contests',
    url: 'https://codeforces.com',
    author: 'Mike Mirzayanov & Team',
    difficulty: 'All Levels',
    tags: ['Live Contests', 'Global Rating', 'Div 1-4 Rounds', 'Editorial Support'],
    topicTags: ['Math', 'Greedy', 'Binary Search', 'Graphs', 'Dynamic Programming', 'Constructive', 'Data Structures'],
    badge: 'Top CP Platform',
    featured: true,
    rating: 4.92,
    reviewCount: 45000,
    stats: {
      platformName: 'Codeforces',
      format: 'Online Judge & Live Contests'
    }
  },
  {
    id: 'contest-atcoder',
    title: 'AtCoder',
    subtitle: 'Clean, elegant, math and algorithm-rich Japanese contest judge',
    description: 'Renowned for high-quality problem statements and flawless test cases. Features AtCoder Beginner Contest (ABC), Regular Contest (ARC), and the world-famous Educational DP Contest.',
    category: 'contests',
    url: 'https://atcoder.jp',
    author: 'AtCoder Inc.',
    difficulty: 'All Levels',
    tags: ['High Quality Problems', 'Educational DP', 'Weekly ABC Contests', 'Clean Testcases'],
    topicTags: ['Dynamic Programming', 'Math', 'Combinatorics', 'Graphs', 'Number Theory', 'Ad-Hoc'],
    badge: 'Best Problem Quality',
    featured: true,
    rating: 4.9,
    reviewCount: 19000,
    stats: {
      platformName: 'AtCoder',
      format: 'Weekly Contests'
    }
  },
  {
    id: 'contest-leetcode',
    title: 'LeetCode',
    subtitle: 'The standard platform for software engineering coding rounds',
    description: 'Huge library of categorized interview problems with official solutions, community discuss forums, weekly/bi-weekly contests, and company-tagged interview collections.',
    category: 'contests',
    url: 'https://leetcode.com',
    author: 'LeetCode Community',
    difficulty: 'All Levels',
    tags: ['Interview Prep', 'Company Tagged', 'Weekly Contests', 'Discuss Forum'],
    topicTags: ['Arrays', 'Strings', 'Hash Maps', 'Trees', 'Graphs', 'Dynamic Programming', 'Backtracking'],
    badge: 'Industry Standard',
    featured: false,
    rating: 4.75,
    reviewCount: 65000,
    stats: {
      problemsCount: 3000,
      platformName: 'LeetCode',
      format: 'Interactive Playground'
    }
  },
  {
    id: 'contest-codechef',
    title: 'CodeChef',
    subtitle: 'Competitive coding community with Star rating tiers and Starters',
    description: 'Hosts weekly Starters contests, monthly challenges, and dedicated learning tracks tailored for collegiate and competitive programmers.',
    category: 'contests',
    url: 'https://www.codechef.com',
    author: 'CodeChef',
    difficulty: 'Beginner',
    tags: ['Starters Contests', 'Long Challenges', 'College Contests', 'Practice Tracks'],
    topicTags: ['Basic Programming', 'Strings', 'Sorting', 'Greedy', 'Number Theory'],
    badge: 'Great for Starters',
    featured: false,
    rating: 4.6,
    reviewCount: 15000,
    stats: {
      platformName: 'CodeChef',
      format: 'Online Judge'
    }
  },

  // ==========================================
  // 3. BOOKS & REFERENCE HANDBOOKS
  // ==========================================
  {
    id: 'book-cp-handbook',
    title: 'Competitive Programmer’s Handbook',
    subtitle: 'The best concise modern handbook for contest algorithms',
    description: 'A thoroughly accessible 300-page book written specifically for CSES and competitive programmers. Covers C++ STL tricks, time complexity, range queries, segment trees, DP tricks, and graph algorithms.',
    category: 'books',
    url: 'https://cses.fi/book/book.pdf',
    author: 'Antti Laaksonen',
    difficulty: 'Intermediate',
    tags: ['Free Official PDF', 'Concise', 'C++ Focus', 'Clear Explanations'],
    topicTags: ['Sorting', 'Searching', 'Range Queries', 'Segment Trees', 'Tree Algorithms', 'Dynamic Programming', 'Geometry'],
    badge: 'Free & Essential',
    featured: true,
    rating: 4.97,
    reviewCount: 18000,
    stats: {
      format: 'Free PDF Handbook'
    }
  },
  {
    id: 'book-usaco-guide',
    title: 'USACO Guide',
    subtitle: 'Competitive programming handbook and guide',
    description: 'A C++ reference for learning competitive programming, algorithms, and problem-solving techniques.',
    category: 'books',
    url: 'https://darrenyao.com/usacobook/cpp.pdf',
    author: 'Darren Yao',
    difficulty: 'Intermediate',
    tags: ['C++', 'Competitive Programming', 'Free PDF'],
    topicTags: ['Sorting', 'Searching', 'Graphs', 'Dynamic Programming'],
    badge: 'Free PDF',
    featured: false,
    stats: { format: 'PDF Handbook' }
  },
  {
    id: 'book-start-competitive-programming',
    title: 'Start Competitive Programming',
    subtitle: 'A beginner-friendly introduction to competitive programming',
    description: 'An introductory guide to the concepts and techniques used to get started with competitive programming.',
    category: 'books',
    url: 'https://www.danielzingaro.com/start_competitive_programming.pdf',
    author: 'Daniel Zingaro',
    difficulty: 'Beginner',
    tags: ['Beginner', 'Competitive Programming', 'Free PDF'],
    topicTags: ['Problem Solving', 'Algorithms', 'C++'],
    badge: 'Free PDF',
    featured: false,
    stats: { format: 'PDF Handbook' }
  },

  // ==========================================
  // 4. VIDEO CHANNELS & CREATORS
  // ==========================================
  {
    id: 'channel-striver',
    title: 'take U forward (Striver)',
    subtitle: 'Unrivaled step-by-step intuitive video explanations',
    description: 'In-depth video tutorials explaining brute force to optimal solutions for hundreds of classic DSA problems, complete with dry runs, visual recursion trees, and code breakdowns.',
    category: 'channels',
    url: 'https://www.youtube.com/@takeUforward',
    author: 'Raj Vikramaditya',
    difficulty: 'All Levels',
    tags: ['A2Z Series', 'Intuitive Dry Runs', 'Interview Focused', 'C++ & Java'],
    topicTags: ['Arrays', 'Binary Search', 'Recursion', 'Trees', 'Graphs', 'Dynamic Programming'],
    badge: 'Must Watch',
    featured: true,
    rating: 4.96,
    reviewCount: 48000,
    stats: {
      platformName: 'YouTube',
      format: 'Video Tutorials & Playlists'
    }
  },
  {
    id: 'channel-neetcode',
    title: 'NeetCode',
    subtitle: 'Concise visual whiteboard walkthroughs and pattern mastery',
    description: 'Clear, crisp 10-15 minute explanations using whiteboard animations to illustrate algorithm intuition, time/space complexity, and clean Python implementations.',
    category: 'channels',
    url: 'https://www.youtube.com/@NeetCode',
    author: 'Navdeep Singh',
    difficulty: 'Beginner',
    tags: ['Whiteboard Animations', 'Python', 'LeetCode Walkthroughs', 'Concise'],
    topicTags: ['Arrays', 'Sliding Window', 'Two Pointers', 'Trees', 'Backtracking', 'Dynamic Programming'],
    badge: 'Concise & Visual',
    featured: true,
    rating: 4.93,
    reviewCount: 39000,
    stats: {
      platformName: 'YouTube',
      format: 'Whiteboard Walkthroughs'
    }
  },
  {
    id: 'channel-abdul-bari',
    title: 'Abdul Bari',
    subtitle: 'Master the fundamental mathematics and algorithms with hand-drawn mastery',
    description: 'Legendary chalkboard explanations of algorithm design techniques (Divide & Conquer, Greedy, Dynamic Programming, Backtracking, Branch & Bound) and Master Theorem proofs.',
    category: 'channels',
    url: 'https://www.youtube.com/@abdul_bari',
    author: 'Abdul Bari',
    difficulty: 'Beginner',
    tags: ['Chalkboard Legend', 'Divide & Conquer', 'Asymptotic Proofs', 'Foundational'],
    topicTags: ['Sorting', 'Divide & Conquer', 'Greedy', 'Dynamic Programming', 'Asymptotic Analysis'],
    badge: 'Foundations Master',
    featured: true,
    rating: 4.98,
    reviewCount: 52000,
    stats: {
      platformName: 'YouTube',
      format: 'In-Depth Lectures'
    }
  },
  {
    id: 'channel-errichto',
    title: 'Errichto (Algorithms)',
    subtitle: 'Competitive programming masterclasses and World Finalist insights',
    description: 'Deep dives into contest techniques, dynamic programming optimizations, binary search tricks, segment trees, and live contest stream problem solving.',
    category: 'channels',
    url: 'https://www.youtube.com/@Errichto',
    author: 'Kamil Debowski (Errichto)',
    difficulty: 'Advanced',
    tags: ['World Finalist', 'Advanced CP', 'DP Mastery', 'Contest Tactics'],
    topicTags: ['Binary Search', 'Dynamic Programming', 'Segment Trees', 'Combinatorics', 'Math'],
    badge: 'CP Specialist',
    featured: false,
    rating: 4.89,
    reviewCount: 16000,
    stats: {
      platformName: 'YouTube',
      format: 'Advanced Masterclasses'
    }
  },
  {
    id: 'channel-william-fiset',
    title: 'William Fiset',
    subtitle: 'Stunning animated computer science data structure implementations',
    description: 'Visual animations of graph algorithms (Tarjan, Dijkstra, Bellman-Ford, Floyd-Warshall), trees (Fenwick, Segment, AVL, Red-Black), and indexed priority queues.',
    category: 'channels',
    url: 'https://www.youtube.com/@WilliamFiset-videos',
    author: 'William Fiset',
    difficulty: 'Intermediate',
    tags: ['Animated Graphics', 'Graph Algorithms', 'Data Structure Internals'],
    topicTags: ['Graphs', 'Shortest Paths', 'Trees', 'Union-Find', 'Topological Sort'],
    badge: 'Top Animations',
    featured: false,
    rating: 4.91,
    reviewCount: 14000,
    stats: {
      platformName: 'YouTube',
      format: 'Animated Video Series'
    }
  },
  {
    id: 'channel-colin-galen',
    title: 'Colin Galen',
    subtitle: 'Realistic Codeforces practice and mental model building',
    description: 'Approachable and inspiring Codeforces contest reviews, strategy guides for crossing 1200, 1400, 1600+ rating milestones, and problem-solving mindset training.',
    category: 'channels',
    url: 'https://www.youtube.com/@ColinGalen',
    author: 'Colin Galen',
    difficulty: 'Intermediate',
    tags: ['Codeforces Growth', 'Rating Milestones', 'Mindset', 'Contest Reviews'],
    topicTags: ['Greedy', 'Binary Search', 'Math', 'Implementation', 'Contest Tactics'],
    badge: 'Rating Growth Guide',
    featured: false,
    rating: 4.86,
    reviewCount: 9500,
    stats: {
      platformName: 'YouTube',
      format: 'Strategy & Practice Videos'
    }
  }
];
