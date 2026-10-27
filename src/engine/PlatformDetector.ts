import type { SupportedLanguage } from './TraceTypes';
import { inferDefaultInput } from './ModeDetector';

export type CodingPlatform =
  | 'leetcode'
  | 'codeforces'
  | 'hackerrank'
  | 'geeksforgeeks'
  | 'atcoder'
  | 'custom';

export interface PlatformDetectionResult {
  platform: CodingPlatform;
  platformName: string;
  badgeColor: string;
  badgeIcon: string;
  confidence: number; // 0 to 1
  problemName?: string;
  patternType?: string;
  methodName?: string;
  defaultInput?: string;
  inputDescription?: string;
  explanation: string;
}

/**
 * Known LeetCode problem patterns and corresponding optimal sample inputs.
 */
interface ProblemSpec {
  name: string;
  pattern: string;
  input: string;
  desc: string;
}

const LEETCODE_PROBLEMS: Record<string, ProblemSpec> = {
  twoSum: {
    name: 'Two Sum',
    pattern: 'Hash Map / Two Pointers',
    input: '[[2, 7, 11, 15], 9]',
    desc: 'nums = [2, 7, 11, 15], target = 9',
  },
  two_sum: {
    name: 'Two Sum',
    pattern: 'Hash Map / Two Pointers',
    input: '[[2, 7, 11, 15], 9]',
    desc: 'nums = [2, 7, 11, 15], target = 9',
  },
  reverseList: {
    name: 'Reverse Linked List',
    pattern: 'Linked List In-Place Pointer Reversal',
    input: '[[1, 2, 3, 4, 5]]',
    desc: 'head = [1, 2, 3, 4, 5]',
  },
  reverse_list: {
    name: 'Reverse Linked List',
    pattern: 'Linked List In-Place Pointer Reversal',
    input: '[[1, 2, 3, 4, 5]]',
    desc: 'head = [1, 2, 3, 4, 5]',
  },
  hasCycle: {
    name: 'Linked List Cycle',
    pattern: "Floyd's Fast & Slow Pointers",
    input: '[[3, 2, 0, -4], 1]',
    desc: 'head = [3, 2, 0, -4], pos = 1 (cycle)',
  },
  has_cycle: {
    name: 'Linked List Cycle',
    pattern: "Floyd's Fast & Slow Pointers",
    input: '[[3, 2, 0, -4], 1]',
    desc: 'head = [3, 2, 0, -4], pos = 1 (cycle)',
  },
  mergeTwoLists: {
    name: 'Merge Two Sorted Lists',
    pattern: 'Two Pointers Merging',
    input: '[[1, 2, 4], [1, 3, 4]]',
    desc: 'list1 = [1, 2, 4], list2 = [1, 3, 4]',
  },
  merge_two_lists: {
    name: 'Merge Two Sorted Lists',
    pattern: 'Two Pointers Merging',
    input: '[[1, 2, 4], [1, 3, 4]]',
    desc: 'list1 = [1, 2, 4], list2 = [1, 3, 4]',
  },
  maxSubArray: {
    name: 'Maximum Subarray',
    pattern: "Kadane's Algorithm (Dynamic Programming)",
    input: '[[-2, 1, -3, 4, -1, 2, 1, -5, 4]]',
    desc: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
  },
  max_sub_array: {
    name: 'Maximum Subarray',
    pattern: "Kadane's Algorithm (Dynamic Programming)",
    input: '[[-2, 1, -3, 4, -1, 2, 1, -5, 4]]',
    desc: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
  },
  lengthOfLongestSubstring: {
    name: 'Longest Substring Without Repeating Characters',
    pattern: 'Sliding Window / Hash Set',
    input: '["abcabcbb"]',
    desc: 's = "abcabcbb"',
  },
  length_of_longest_substring: {
    name: 'Longest Substring Without Repeating Characters',
    pattern: 'Sliding Window / Hash Set',
    input: '["abcabcbb"]',
    desc: 's = "abcabcbb"',
  },
  isValid: {
    name: 'Valid Parentheses',
    pattern: 'Stack-based Matching',
    input: '["()[]{}"]',
    desc: 's = "()[]{}"',
  },
  is_valid: {
    name: 'Valid Parentheses',
    pattern: 'Stack-based Matching',
    input: '["()[]{}"]',
    desc: 's = "()[]{}"',
  },
  climbStairs: {
    name: 'Climbing Stairs',
    pattern: 'Dynamic Programming (Fibonacci)',
    input: '[5]',
    desc: 'n = 5 stairs',
  },
  climb_stairs: {
    name: 'Climbing Stairs',
    pattern: 'Dynamic Programming (Fibonacci)',
    input: '[5]',
    desc: 'n = 5 stairs',
  },
  coinChange: {
    name: 'Coin Change',
    pattern: 'Dynamic Programming / Unbounded Knapsack',
    input: '[[1, 2, 5], 11]',
    desc: 'coins = [1, 2, 5], amount = 11',
  },
  coin_change: {
    name: 'Coin Change',
    pattern: 'Dynamic Programming / Unbounded Knapsack',
    input: '[[1, 2, 5], 11]',
    desc: 'coins = [1, 2, 5], amount = 11',
  },
  invertTree: {
    name: 'Invert Binary Tree',
    pattern: 'Binary Tree DFS / Recursion',
    input: '[[4, 2, 7, 1, 3, 6, 9]]',
    desc: 'root = [4, 2, 7, 1, 3, 6, 9]',
  },
  invert_tree: {
    name: 'Invert Binary Tree',
    pattern: 'Binary Tree DFS / Recursion',
    input: '[[4, 2, 7, 1, 3, 6, 9]]',
    desc: 'root = [4, 2, 7, 1, 3, 6, 9]',
  },
  search: {
    name: 'Binary Search',
    pattern: 'Binary Search (Log N)',
    input: '[[-1, 0, 3, 5, 9, 12], 9]',
    desc: 'nums = [-1, 0, 3, 5, 9, 12], target = 9',
  },
  binarySearch: {
    name: 'Binary Search',
    pattern: 'Binary Search (Log N)',
    input: '[[-1, 0, 3, 5, 9, 12], 9]',
    desc: 'nums = [-1, 0, 3, 5, 9, 12], target = 9',
  },
  threeSum: {
    name: '3Sum',
    pattern: 'Sorting + Two Pointers',
    input: '[[-1, 0, 1, 2, -1, -4]]',
    desc: 'nums = [-1, 0, 1, 2, -1, -4]',
  },
  trap: {
    name: 'Trapping Rain Water',
    pattern: 'Two Pointers / Elevation Traversal',
    input: '[[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]]',
    desc: 'height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]',
  },
  productExceptSelf: {
    name: 'Product of Array Except Self',
    pattern: 'Prefix and Suffix Accumulation',
    input: '[[1, 2, 3, 4]]',
    desc: 'nums = [1, 2, 3, 4]',
  },
  numIslands: {
    name: 'Number of Islands',
    pattern: '2D Grid BFS / DFS Connected Components',
    input: '[[["1","1","0"],["1","1","0"],["0","0","1"]]]',
    desc: 'grid = 3x3 binary matrix',
  },
  levelOrder: {
    name: 'Binary Tree Level Order Traversal',
    pattern: 'Queue-based BFS',
    input: '[[3, 9, 20, null, null, 15, 7]]',
    desc: 'root = [3, 9, 20, null, null, 15, 7]',
  },
};

/**
 * Identifies code source platform (LeetCode, Codeforces, HackerRank, GeeksforGeeks, etc.),
 * algorithm classification, and recommended test inputs.
 */
export function identifyPlatform(
  code: string,
  _langHint?: SupportedLanguage,
): PlatformDetectionResult {
  if (!code || !code.trim()) {
    return {
      platform: 'custom',
      platformName: 'Custom Algorithm',
      badgeColor: '#D6523A',
      badgeIcon: '⚡',
      confidence: 0,
      explanation: 'No code entered yet',
    };
  }

  const trimmed = code.trim();

  // ── 1. HackerRank Detection (check first before generic class Solution) ────
  const hasHackerRank =
    /\bResult\.\w+\s*\(|\bOUTPUT_PATH\b|\bBufferedReader\s+bufferedReader\b|\bprocess\.stdin\.on\('data'/.test(
      code,
    );
  if (hasHackerRank) {
    return {
      platform: 'hackerrank',
      platformName: 'HackerRank',
      badgeColor: '#00EA64',
      badgeIcon: '⚡',
      confidence: 0.9,
      problemName: 'HackerRank Challenge',
      patternType: 'Result Class & Buffered I/O',
      defaultInput: inferDefaultInput(code) ?? '[[64, 34, 25, 12, 22, 11, 90]]',
      explanation: 'Identified HackerRank template (Result / Buffered stream)',
    };
  }

  // ── 2. LeetCode Detection ────────────────────────────────────────────────
  const isLeetCodeClass = /class\s+Solution\b/i.test(code);
  const hasLeetCodeTypes =
    /ListNode\*?|TreeNode\*?|vector\s*<|List\[(?:Optional\[)?(?:ListNode|TreeNode|int|str)/.test(
      code,
    );

  // Extract method name if inside class Solution or top-level function
  let detectedMethod: string | undefined;
  const methodMatch =
    code.match(/def\s+([a-zA-Z_]\w*)\s*\(\s*(?:self\s*,?)?/) ||
    code.match(/(?:public\s+|static\s+|inline\s+|virtual\s+)*(?:void|int|long(?:\s+long)?|double|float|bool|char|string|auto|vector\s*<[^>]+>|ListNode\*?|TreeNode\*?|int\[\]|String\[\]|boolean\[\])(?:\s+|(?<=[*>]))([a-zA-Z_]\w*)\s*\(/) ||
    code.match(/function\s+([a-zA-Z_]\w*)\s*\(/) ||
    code.match(/var\s+([a-zA-Z_]\w*)\s*=\s*function\b/);

  if (methodMatch && methodMatch[1] && methodMatch[1] !== 'main' && methodMatch[1] !== 'solve') {
    detectedMethod = methodMatch[1];
  }

  // Also check JS/TS class methods inside class Solution
  if (!detectedMethod && isLeetCodeClass) {
    const classIdx = code.search(/class\s+Solution\b/i);
    const classBody = code.slice(classIdx);
    const jsMethodMatch = classBody.match(/(?:^|\n)\s*(?:async\s+)?([a-zA-Z_]\w*)\s*\([^)]*\)\s*\{/);
    if (jsMethodMatch && !['constructor', 'if', 'for', 'while', 'switch'].includes(jsMethodMatch[1])) {
      detectedMethod = jsMethodMatch[1];
    }
  }

  const matchedProblem = detectedMethod ? LEETCODE_PROBLEMS[detectedMethod] : undefined;

  if (isLeetCodeClass || (hasLeetCodeTypes && detectedMethod)) {
    return {
      platform: 'leetcode',
      platformName: 'LeetCode',
      badgeColor: '#FFA116',
      badgeIcon: '🔶',
      confidence: 0.95,
      problemName: matchedProblem?.name ?? (detectedMethod ? formatProblemName(detectedMethod) : 'Algorithm Problem'),
      patternType: matchedProblem?.pattern ?? 'Class-based Solution Method',
      methodName: detectedMethod,
      defaultInput: matchedProblem?.input ?? inferDefaultInput(code) ?? '[[64, 34, 25, 12, 22, 11, 90]]',
      inputDescription: matchedProblem?.desc,
      explanation: `Identified LeetCode format (class Solution${detectedMethod ? ` with ${detectedMethod}` : ''})`,
    };
  }

  // ── 2. Codeforces & Competitive Programming Detection ─────────────────────
  const hasCpIncludes =
    /#include\s*<bits\/stdc\+\+\.h>|#include\s*<iostream>|using\s+namespace\s+std\s*;/.test(code);
  const hasCinCout = /\bcin\s*>>|\bcout\s*<<|\bios_base::sync_with_stdio\b|\bcin\.tie\b/.test(code);
  const hasPyCpStdin =
    /sys\.stdin\.readline|sys\.stdin\.read|\binput\(\)\.split|\bint\(input\(\)\)/.test(code);
  const hasSolveFunc = /\b(?:void|int)\s+solve\s*\(\s*\)|def\s+solve\s*\(\s*\):/.test(code);
  const hasTestCasesLoop = /cin\s*>>\s*t\b|int\s+t\s*;\s*cin\s*>>\s*t|while\s*\(\s*t\s*--\s*\)/.test(code);

  if (hasCpIncludes || hasCinCout || (hasPyCpStdin && (hasSolveFunc || hasTestCasesLoop))) {
    let probDesc = 'Competitive Programming Solution';
    let pattern = 'Fast I/O & Interactive Standard Stream';

    if (hasTestCasesLoop) {
      pattern = 'Multi-Testcase Loop (T cases)';
    } else if (code.includes('vector<vector')) {
      pattern = '2D Grid / Adjacency Graph';
    } else if (code.includes('priority_queue') || code.includes('heapq')) {
      pattern = 'Greedy / Heap / Dijkstra';
    } else if (code.includes('dp[') || code.includes('memo')) {
      pattern = 'Dynamic Programming Array';
    }

    return {
      platform: 'codeforces',
      platformName: 'Codeforces / CP',
      badgeColor: '#318CE7',
      badgeIcon: '⚔️',
      confidence: hasCpIncludes && hasCinCout ? 0.95 : 0.85,
      problemName: hasSolveFunc ? 'Problem Solution (solve)' : probDesc,
      patternType: pattern,
      defaultInput: '[5, 1, 5, 2, 3, 4]',
      inputDescription: 'cin stream: n=5, arr=[1, 5, 2, 3, 4]',
      explanation: 'Identified Codeforces / CP template with standard input/output streams',
    };
  }


  // ── 4. GeeksforGeeks Detection ───────────────────────────────────────────
  const hasGfg =
    /\bDriver\b|\bGFG\b|\bclass\s+Solution\b.*\/\/.*GeeksforGeeks/i.test(code);
  if (hasGfg) {
    return {
      platform: 'geeksforgeeks',
      platformName: 'GeeksforGeeks',
      badgeColor: '#2F8D46',
      badgeIcon: '🟢',
      confidence: 0.88,
      problemName: 'GFG Practice Problem',
      patternType: 'Solution Class',
      defaultInput: inferDefaultInput(code) ?? '[[64, 34, 25, 12, 22, 11, 90]]',
      explanation: 'Identified GeeksforGeeks problem format',
    };
  }

  // ── 5. Standard Algorithm / Function Detection ───────────────────────────
  if (matchedProblem) {
    return {
      platform: 'custom',
      platformName: 'Algorithm Function',
      badgeColor: '#D6523A',
      badgeIcon: '⚙️',
      confidence: 0.8,
      problemName: matchedProblem.name,
      patternType: matchedProblem.pattern,
      methodName: detectedMethod,
      defaultInput: matchedProblem.input,
      inputDescription: matchedProblem.desc,
      explanation: `Identified common algorithm: ${matchedProblem.name}`,
    };
  }

  return {
    platform: 'custom',
    platformName: 'Algorithm Program',
    badgeColor: '#D6523A',
    badgeIcon: '⚙️',
    confidence: 0.5,
    problemName: detectedMethod ? formatProblemName(detectedMethod) : 'Custom Algorithm',
    patternType: 'Standard Procedural / Functional Code',
    methodName: detectedMethod,
    defaultInput: inferDefaultInput(code) ?? '[[64, 34, 25, 12, 22, 11, 90]]',
    explanation: 'General algorithm execution',
  };
}

function formatProblemName(name: string): string {
  // convert camelCase or snake_case to Title Case
  const words = name
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .split(/\s+/);
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
