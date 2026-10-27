import type { SupportedLanguage } from './TraceTypes';

export interface AlgorithmPreset {
  id: string;
  title: string;
  category: 'Sorting' | 'Search' | 'Arrays' | 'Trees' | 'Linked Lists' | 'Graphs' | 'DP & Grids' | 'Recursion';
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  languages: {
    [key in SupportedLanguage]?: {
      code: string;
      input: string;
    };
  };
}

export const ALGORITHM_PRESETS: AlgorithmPreset[] = [
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    category: 'Sorting',
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if in wrong order.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    languages: {
      javascript: {
        code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap adjacent elements
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
        input: '[[45, 12, 85, 32, 89, 39, 69, 21]]',
      },
      python: {
        code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
        input: '[[45, 12, 85, 32, 89, 39, 69, 21]]',
      },
      cpp: {
        code: `class Solution {
public:
    vector<int> bubbleSort(vector<int>& arr) {
        int n = arr.size();
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    swap(arr[j], arr[j + 1]);
                }
            }
        }
        return arr;
    }
};`,
        input: '[[45, 12, 85, 32, 89, 39, 69, 21]]',
      },
      java: {
        code: `class Solution {
    public int[] bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }
}`,
        input: '[[45, 12, 85, 32, 89, 39, 69, 21]]',
      },
      go: {
        code: `func bubbleSort(arr []int) []int {
    n := len(arr)
    for i := 0; i < n; i++ {
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
            }
        }
    }
    return arr
}`,
        input: '[[45, 12, 85, 32, 89, 39, 69, 21]]',
      },
      rust: {
        code: `fn bubble_sort(mut arr: Vec<i32>) -> Vec<i32> {
    let n = arr.len();
    for i in 0..n {
        for j in 0..(n - i - 1) {
            if arr[j] > arr[j + 1] {
                arr.swap(j, j + 1);
            }
        }
    }
    arr
}`,
        input: '[[45, 12, 85, 32, 89, 39, 69, 21]]',
      },
    },
  },
  {
    id: 'quick-sort',
    title: 'Quick Sort',
    category: 'Sorting',
    description: 'Divides array into smaller sub-arrays around a pivot element and recursively sorts them.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    languages: {
      javascript: {
        code: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    const pi = i + 1;

    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}`,
        input: '[[38, 27, 43, 3, 9, 82, 10]]',
      },
      python: {
        code: `def quick_sort(arr):
    def partition(low, high):
        pivot = arr[high]
        i = low - 1
        for j in range(low, high):
            if arr[j] < pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        return i + 1

    def sort_helper(low, high):
        if low < high:
            pi = partition(low, high)
            sort_helper(low, pi - 1)
            sort_helper(pi + 1, high)

    sort_helper(0, len(arr) - 1)
    return arr`,
        input: '[[38, 27, 43, 3, 9, 82, 10]]',
      },
    },
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    category: 'Search',
    description: 'Efficiently locates a target value within a sorted array by repeatedly halving the search interval.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    languages: {
      javascript: {
        code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      return mid;
    }
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}`,
        input: '[[4, 9, 15, 23, 38, 42, 56, 71, 88, 95], 56]',
      },
      python: {
        code: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
        input: '[[4, 9, 15, 23, 38, 42, 56, 71, 88, 95], 56]',
      },
    },
  },
  {
    id: 'two-sum',
    title: 'Two Sum',
    category: 'Arrays',
    description: 'Finds the two indices in an array that add up to a specified target number.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    languages: {
      javascript: {
        code: `function twoSum(nums, target) {
  const seen = {};
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen[complement] !== undefined) {
      return [seen[complement], i];
    }
    seen[nums[i]] = i;
  }
  return [];
}`,
        input: '[[2, 7, 11, 15, 1, 8], 9]',
      },
      python: {
        code: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,
        input: '[[2, 7, 11, 15, 1, 8], 9]',
      },
    },
  },
  {
    id: 'insertion-sort',
    title: 'Insertion Sort',
    category: 'Sorting',
    description: 'Builds the final sorted array one item at a time by inserting each element into its proper position.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    languages: {
      javascript: {
        code: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let j = i;
    while (j > 0 && arr[j - 1] > arr[j]) {
      const temp = arr[j];
      arr[j] = arr[j - 1];
      arr[j - 1] = temp;
      j--;
    }
  }
  return arr;
}`,
        input: '[[54, 26, 93, 17, 77, 31, 44, 55]]',
      },
      python: {
        code: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        j = i
        while j > 0 and arr[j - 1] > arr[j]:
            arr[j], arr[j - 1] = arr[j - 1], arr[j]
            j -= 1
    return arr`,
        input: '[[54, 26, 93, 17, 77, 31, 44, 55]]',
      },
    },
  },
  {
    id: 'linked-list-cycle',
    title: 'Linked List Cycle',
    category: 'Linked Lists',
    description: 'Detects if a linked list contains a cycle using Floyd\'s Tortoise and Hare algorithm.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    languages: {
      python: {
        code: `class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        if not head:
            return False
        slow = head
        fast = head.next
        while fast and fast.next:
            if slow == fast:
                return True
            slow = slow.next
            fast = fast.next.next
        return False`,
        input: '[[3, 2, 0, -4], 1]',
      },
      javascript: {
        code: `function hasCycle(head) {
  if (!head) return false;
  let slow = head;
  let fast = head.next;
  while (fast && fast.next) {
    if (slow === fast) return true;
    slow = slow.next;
    fast = fast.next.next;
  }
  return false;
}`,
        input: '[[3, 2, 0, -4], 1]',
      },
    },
  },
  {
    id: 'bst-search',
    title: 'BST Search',
    category: 'Trees',
    description: 'Searches for a target value in a Binary Search Tree by descending left or right.',
    timeComplexity: 'O(h)',
    spaceComplexity: 'O(1)',
    languages: {
      python: {
        code: `class Solution:
    def searchBST(self, root: Optional[TreeNode], val: int) -> Optional[TreeNode]:
        curr = root
        while curr:
            if curr.val == val:
                return curr
            elif val < curr.val:
                curr = curr.left
            else:
                curr = curr.right
        return None`,
        input: '[[50, 30, 70, 20, 40, 60, 80], 40]',
      },
      javascript: {
        code: `function searchBST(root, val) {
  let curr = root;
  while (curr) {
    if (curr.val === val) return curr;
    curr = val < curr.val ? curr.left : curr.right;
  }
  return null;
}`,
        input: '[[50, 30, 70, 20, 40, 60, 80], 40]',
      },
    },
  },
  {
    id: 'grid-matrix-traversal',
    title: 'Matrix 2D Grid Walk',
    category: 'Arrays',
    description: 'Traverses a 2D matrix or dynamic programming grid row-by-row and col-by-col.',
    timeComplexity: 'O(m × n)',
    spaceComplexity: 'O(1)',
    languages: {
      python: {
        code: `def traverse_grid(grid):
    rows = len(grid)
    cols = len(grid[0])
    total = 0
    for r in range(rows):
        for c in range(cols):
            total += grid[r][c]
    return total`,
        input: '[[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]]',
      },
      javascript: {
        code: `function traverseGrid(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  let total = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      total += grid[r][c];
    }
  }
  return total;
}`,
        input: '[[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]]',
      },
    },
  },
  {
    id: 'two-sum-cpp',
    title: 'Two Sum (C++)',
    category: 'Arrays',
    description: 'Finds two numbers in an array that sum to target using C++ vector.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    languages: {
      cpp: {
        code: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums[i] + nums[j] == target) {
                    vector<int> ans = {i, j};
                    return ans;
                }
            }
        }
        vector<int> empty;
        return empty;
    }
};`,
        input: '[[2, 7, 11, 15], 9]',
      },
    },
  },
  {
    id: 'two-sum-java',
    title: 'Two Sum (Java)',
    category: 'Arrays',
    description: 'Finds two numbers in an array that sum to target using Java array.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    languages: {
      java: {
        code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums[i] + nums[j] == target) {
                    int[] ans = {i, j};
                    return ans;
                }
            }
        }
        int[] empty = {};
        return empty;
    }
}`,
        input: '[[2, 7, 11, 15], 9]',
      },
    },
  },
  {
    id: 'fibonacci-recursion',
    title: 'Fibonacci Call Tree',
    category: 'Recursion',
    description: 'Computes the nth Fibonacci number recursively, constructing an interactive execution call tree.',
    timeComplexity: 'O(2ⁿ)',
    spaceComplexity: 'O(n)',
    languages: {
      python: {
        code: `def fib(n):
    if n <= 1:
        return n
    left = fib(n - 1)
    right = fib(n - 2)
    return left + right`,
        input: '[4]',
      },
      javascript: {
        code: `function fib(n) {
  if (n <= 1) {
    return n;
  }
  const left = fib(n - 1);
  const right = fib(n - 2);
  return left + right;
}`,
        input: '[4]',
      },
      cpp: {
        code: `int fib(int n) {
    if (n <= 1) {
        return n;
    }
    int left = fib(n - 1);
    int right = fib(n - 2);
    return left + right;
}`,
        input: '[4]',
      },
      java: {
        code: `class Solution {
    public int fib(int n) {
        if (n <= 1) {
            return n;
        }
        int left = fib(n - 1);
        int right = fib(n - 2);
        return left + right;
    }
}`,
        input: '[4]',
      },
    },
  },
  {
    id: 'graph-bfs-traversal',
    title: 'Graph BFS Traversal',
    category: 'Graphs',
    description: 'Explores a graph level by level starting from source vertex 0 using a FIFO queue.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    languages: {
      javascript: {
        code: `function bfsTraversal(adj, start = 0) {
  const visited = new Array(adj.length).fill(false);
  const queue = [start];
  const order = [];
  visited[start] = true;

  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);

    for (const neighbor of adj[node]) {
      if (!visited[neighbor]) {
        visited[neighbor] = true;
        queue.push(neighbor);
      }
    }
  }
  return order;
}`,
        input: '[[[1, 2], [0, 2, 3], [0, 1, 3], [1, 2]]]',
      },
      python: {
        code: `def bfs_traversal(adj, start=0):
    visited = [False] * len(adj)
    queue = [start]
    order = []
    visited[start] = True

    while len(queue) > 0:
        node = queue.pop(0)
        order.append(node)
        for neighbor in adj[node]:
            if not visited[neighbor]:
                visited[neighbor] = True
                queue.append(neighbor)
    return order`,
        input: '[[[1, 2], [0, 2, 3], [0, 1, 3], [1, 2]]]',
      },
    },
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    category: 'Linked Lists',
    description: 'Inverts the direction of all pointers in a singly linked list so the last node becomes the head.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    languages: {
      javascript: {
        code: `function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
        input: '[[1, 2, 3, 4, 5]]',
      },
      python: {
        code: `def reverse_list(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
        input: '[[1, 2, 3, 4, 5]]',
      },
    },
  },
  {
    id: 'graph-dfs-traversal',
    title: 'Graph DFS Traversal',
    category: 'Graphs',
    description: 'Explores as far as possible along each branch before backtracking using a recursion or explicit stack.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    languages: {
      javascript: {
        code: `function dfsTraversal(adj, start = 0) {
  const visited = new Array(adj.length).fill(false);
  const order = [];

  function dfs(u) {
    visited[u] = true;
    order.push(u);
    for (const v of adj[u]) {
      if (!visited[v]) {
        dfs(v);
      }
    }
  }

  dfs(start);
  return order;
}`,
        input: '[[[1, 2], [0, 2, 3], [0, 1, 3], [1, 2]]]',
      },
      python: {
        code: `def dfs_traversal(adj, start=0):
    visited = [False] * len(adj)
    order = []

    def dfs(u):
        visited[u] = True
        order.append(u)
        for v in adj[u]:
            if not visited[v]:
                dfs(v)

    dfs(start)
    return order`,
        input: '[[[1, 2], [0, 2, 3], [0, 1, 3], [1, 2]]]',
      },
    },
  },
  {
    id: 'hash-table-frequency',
    title: 'Hash Table Frequency Counter',
    category: 'Arrays',
    description: 'Counts the occurrences of each word or character using a dictionary / hash map.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(k)',
    languages: {
      javascript: {
        code: `function countFrequency(text) {
  const words = text.split(' ');
  const freq = {};
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    freq[word] = (freq[word] || 0) + 1;
  }
  return freq;
}`,
        input: '["apple banana apple orange banana apple"]',
      },
      python: {
        code: `def count_frequency(text):
    words = text.split(' ')
    freq = {}
    for word in words:
        freq[word] = freq.get(word, 0) + 1
    return freq`,
        input: '["apple banana apple orange banana apple"]',
      },
    },
  },
];
