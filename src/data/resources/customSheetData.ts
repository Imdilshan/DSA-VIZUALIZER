import type { CustomSheetProblem } from '../../types/resources/resource';

/**
 * =====================================================================
 * ALGOARENA CORE SHEET — Managed by Author
 * =====================================================================
 * 
 * You can easily add, edit, or remove problems below.
 * Each problem can link to:
 * 1. The external judge problem (LeetCode, Codeforces, CSES, etc.)
 * 2. An internal AlgoArena visualizer slug (e.g. 'binary-search', 'bubble-sort')
 */

export const ALGOARENA_CUSTOM_SHEET_INFO = {
  title: 'AlgoArena Core Problem Sheet',
  subtitle: 'Hand-picked progressive challenge list connecting problems to step-by-step visualizers',
  author: 'AlgoArena Lead Curator',
  version: '1.0.0',
  description: 'Carefully ordered progression from foundational algorithmic techniques to competitive programming problem patterns. Track your solution status live with cloud database sync.',
  topics: [
    'All Topics',
    'Arrays & Two Pointers',
    'Binary Search',
    'Sorting Algorithms',
    'Sliding Window',
    'Trees & BST',
    'Graph Traversals',
    'Dynamic Programming'
  ]
};

export const ALGOARENA_CUSTOM_PROBLEMS: CustomSheetProblem[] = [
  // --- Arrays & Two Pointers ---
  {
    id: 'aa-p-01',
    title: 'Two Sum II - Input Array Is Sorted',
    topic: 'Arrays & Two Pointers',
    subtopic: 'Opposite Direction Pointers',
    difficulty: 'Easy',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
    visualizerSlug: 'two-pointers',
    notes: 'Shrink search space by moving left or right pointer based on sum vs target.',
    estimatedTime: '15 mins'
  },
  {
    id: 'aa-p-02',
    title: 'Container With Most Water',
    topic: 'Arrays & Two Pointers',
    subtopic: 'Greedy Two Pointers',
    difficulty: 'Medium',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/container-with-most-water/',
    visualizerSlug: 'two-pointers',
    notes: 'Always advance the pointer with the smaller height to seek a larger area.',
    estimatedTime: '20 mins'
  },
  {
    id: 'aa-p-03',
    title: '3Sum',
    topic: 'Arrays & Two Pointers',
    subtopic: 'Sort + Two Pointers',
    difficulty: 'Medium',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/3sum/',
    visualizerSlug: 'two-pointers',
    notes: 'Sort first, fix element i, and run two pointers for remainder. Remember duplicate pruning.',
    estimatedTime: '30 mins'
  },

  // --- Binary Search ---
  {
    id: 'aa-p-04',
    title: 'Binary Search (Classic)',
    topic: 'Binary Search',
    subtopic: 'Search Space Reduction',
    difficulty: 'Easy',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/binary-search/',
    visualizerSlug: 'binary-search',
    notes: 'Standard divide & conquer search in O(log N). Pay attention to mid calculation: low + (high - low) / 2.',
    estimatedTime: '10 mins'
  },
  {
    id: 'aa-p-05',
    title: 'Search in Rotated Sorted Array',
    topic: 'Binary Search',
    subtopic: 'Modified Binary Search',
    difficulty: 'Medium',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    visualizerSlug: 'binary-search',
    notes: 'Identify which half is strictly sorted (left or right) before deciding where target lies.',
    estimatedTime: '25 mins'
  },
  {
    id: 'aa-p-06',
    title: 'Factory Machines (CSES 1620)',
    topic: 'Binary Search',
    subtopic: 'Binary Search on Answer',
    difficulty: 'Medium',
    platform: 'CSES',
    problemUrl: 'https://cses.fi/problemset/task/1620',
    visualizerSlug: 'binary-search',
    notes: 'Monotonic predicate: check if all machines can make >= T products within X time.',
    estimatedTime: '30 mins'
  },

  // --- Sorting Algorithms ---
  {
    id: 'aa-p-07',
    title: 'Bubble Sort & Inversions Exploration',
    topic: 'Sorting Algorithms',
    subtopic: 'Adjacent Swaps',
    difficulty: 'Easy',
    platform: 'GeeksforGeeks',
    problemUrl: 'https://www.geeksforgeeks.org/problems/bubble-sort/1',
    visualizerSlug: 'bubble-sort',
    notes: 'Great for understanding O(N^2) comparison models and inversion count properties.',
    estimatedTime: '15 mins'
  },
  {
    id: 'aa-p-08',
    title: 'Sort an Array (Merge Sort / Quick Sort)',
    topic: 'Sorting Algorithms',
    subtopic: 'Divide and Conquer',
    difficulty: 'Medium',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/sort-an-array/',
    visualizerSlug: 'sorting',
    notes: 'Master recursive split and merge invariants or randomized pivot selection.',
    estimatedTime: '30 mins'
  },

  // --- Sliding Window ---
  {
    id: 'aa-p-09',
    title: 'Longest Substring Without Repeating Characters',
    topic: 'Sliding Window',
    subtopic: 'Dynamic Window',
    difficulty: 'Medium',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    notes: 'Expand right pointer, maintain frequency map, contract left pointer upon collision.',
    estimatedTime: '20 mins'
  },
  {
    id: 'aa-p-10',
    title: 'Minimum Window Substring',
    topic: 'Sliding Window',
    subtopic: 'Condition-Satisfying Window',
    difficulty: 'Hard',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/minimum-window-substring/',
    notes: 'Track character counts with matched criteria counter. Contract left pointer to find minimum.',
    estimatedTime: '40 mins'
  },

  // --- Trees & BST ---
  {
    id: 'aa-p-11',
    title: 'Maximum Depth of Binary Tree',
    topic: 'Trees & BST',
    subtopic: 'Recursive DFS',
    difficulty: 'Easy',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    notes: 'Height = 1 + max(dfs(left), dfs(right)). Base case: null node returns 0.',
    estimatedTime: '10 mins'
  },
  {
    id: 'aa-p-12',
    title: 'Validate Binary Search Tree',
    topic: 'Trees & BST',
    subtopic: 'BST Range Invariants',
    difficulty: 'Medium',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/validate-binary-search-tree/',
    notes: 'Pass valid range bounds [minVal, maxVal] down the recursion tree.',
    estimatedTime: '20 mins'
  },

  // --- Graph Traversals ---
  {
    id: 'aa-p-13',
    title: 'Number of Islands',
    topic: 'Graph Traversals',
    subtopic: 'Grid BFS / DFS',
    difficulty: 'Medium',
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/number-of-islands/',
    notes: 'Find unvisited land, trigger flood-fill (sink visited cells) and increment component count.',
    estimatedTime: '25 mins'
  },
  {
    id: 'aa-p-14',
    title: 'Counting Rooms (CSES 1192)',
    topic: 'Graph Traversals',
    subtopic: 'Connected Components',
    difficulty: 'Medium',
    platform: 'CSES',
    problemUrl: 'https://cses.fi/problemset/task/1192',
    notes: 'Standard 2D grid graph connected component traversal using BFS or DFS queue.',
    estimatedTime: '20 mins'
  },

  // --- Dynamic Programming ---
  {
    id: 'aa-p-15',
    title: 'Frog 1 (Educational DP Contest)',
    topic: 'Dynamic Programming',
    subtopic: '1D State Minimization',
    difficulty: 'Easy',
    platform: 'AtCoder',
    problemUrl: 'https://atcoder.jp/contests/dp/tasks/dp_a',
    notes: 'dp[i] = min(dp[i-1] + |h[i]-h[i-1]|, dp[i-2] + |h[i]-h[i-2]|). Clean introduction to DP.',
    estimatedTime: '20 mins'
  },
  {
    id: 'aa-p-16',
    title: 'Coin Combinations I (CSES 1635)',
    topic: 'Dynamic Programming',
    subtopic: 'Unbounded Knapsack / Counting',
    difficulty: 'Medium',
    platform: 'CSES',
    problemUrl: 'https://cses.fi/problemset/task/1635',
    notes: 'Count number of distinct ways to make sum X using coins. Remember modulo 1e9+7.',
    estimatedTime: '30 mins'
  }
];
