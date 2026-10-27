import { describe, it, expect } from 'vitest';
import { detectMode, buildDriver } from '../ModeDetector';

describe('ModeDetector', () => {
  describe('detectMode', () => {
    it('detects Python full-program mode from if __name__ == "__main__"', () => {
      const code = `
def solve():
    print("hello")

if __name__ == "__main__":
    solve()
`;
      expect(detectMode(code, 'python')).toBe('full-program');
    });

    it('detects Python full-program mode from def main():', () => {
      const code = `
def main():
    pass
main()
`;
      expect(detectMode(code, 'python')).toBe('full-program');
    });

    it('detects Python function mode for pure algorithmic functions', () => {
      const code = `
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        if target - num in seen:
            return [seen[target - num], i]
        seen[num] = i
`;
      expect(detectMode(code, 'python')).toBe('function');
    });

    it('detects JavaScript full-program mode with function main()', () => {
      const code = `
function main() {
  console.log("running");
}
main();
`;
      expect(detectMode(code, 'javascript')).toBe('full-program');
    });

    it('detects JavaScript function mode for leetcode style functions', () => {
      const code = `
function lengthOfLongestSubstring(s) {
  let set = new Set();
  return set.size;
}
`;
      expect(detectMode(code, 'javascript')).toBe('function');
    });

    it('detects C++ full-program mode with int main()', () => {
      const code = `#include <iostream>\nint main() { return 0; }`;
      expect(detectMode(code, 'cpp')).toBe('full-program');
    });

    it('detects Java full-program mode with public static void main', () => {
      const code = `class Solution { public static void main(String[] args) {} }`;
      expect(detectMode(code, 'java')).toBe('full-program');
    });
  });

  describe('buildDriver', () => {
    it('generates a Python driver that calls the function with JSON array args', () => {
      const code = `def bubble_sort(arr):\n    return arr`;
      const input = '[[3, 2, 1]]';
      const output = buildDriver(code, input, 'python');
      expect(output).toContain('_result = bubble_sort(*_converted_args)');
      expect(output).toContain('_raw_args = [[3,2,1]]');
      expect(output).toContain('# ── AlgoLens generated driver');
    });

    it('generates a JavaScript driver that wraps execution in an IIFE', () => {
      const code = `function bubbleSort(arr) {\n  return arr;\n}`;
      const input = '[[5, 1, 4]]';
      const output = buildDriver(code, input, 'javascript');
      expect(output).toContain('bubbleSort([5,1,4])');
      expect(output).toContain('// ── AlgoLens generated driver');
    });

    it('handles arrow function syntax in JavaScript', () => {
      const code = `const quicksort = (arr) => arr;`;
      const input = '[[9, 8, 7]]';
      const output = buildDriver(code, input, 'javascript');
      expect(output).toContain('quicksort([9,8,7])');
    });

    it('generates properly indented Python driver for LeetCode class Solution', () => {
      const code = `class Solution:\n    def addTwoNumbers(self, l1, l2):\n        return l1`;
      const input = '[[2, 4, 3], [5, 6, 4]]';
      const output = buildDriver(code, input, 'python');
      expect(output).toContain('try:\n    _sol = Solution()\n    _result = _sol.addTwoNumbers(*_converted_args)');
      expect(output).toContain('_raw_args = [[2,4,3], [5,6,4]]');
    });

    it('handles user addTwoNumbers with type hints', () => {
      const userCode = `class Solution:\n    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:\n        return None`;
      const outputEmpty = buildDriver(userCode, '', 'python');
      expect(outputEmpty).toContain('_sol.addTwoNumbers(*_converted_args)');
      expect(outputEmpty).toContain('_raw_args = [[2,4,3], [5,6,4]]');

      const outputLeetCode = buildDriver(userCode, 'l1 = [2,4,3], l2 = [5,6,4]', 'python');
      expect(outputLeetCode).toContain('_raw_args = [[2,4,3], [5,6,4]]');

      const output1D = buildDriver(userCode, '[2, 4, 3]', 'python');
      expect(output1D).toContain('_raw_args = [[2,4,3]]');
    });

    it('generates JavaScript driver for LeetCode class Solution with TreeNode', () => {
      const code = `class Solution {\n    invertTree(root) {\n        return root;\n    }\n}`;
      const input = '[[4, 2, 7]]';
      const output = buildDriver(code, input, 'javascript');
      expect(output).toContain('class Solution');
      expect(output).toContain('_sol.invertTree(..._converted_args)');
    });

    it('unpacks cycle linked list input [[3, 2, 0, -4], 1] correctly', () => {
      const code = `def hasCycle(head):\n    return False`;
      const input = '[[3, 2, 0, -4], 1]';
      const output = buildDriver(code, input, 'python');
      expect(output).toContain('_raw_args = [[3,2,0,-4], 1]');
      expect(output).toContain('_to_list_node(_raw_args[0], _raw_args[1])');
    });

    it('handles class with required __init__ parameter (e.g. UnionFind(n))', () => {
      const code = `class UnionFind:\n    def __init__(self, n):\n        self.p = list(range(n))\n    def find(self, x):\n        return self.p[x]`;
      const input = '[6]';
      const output = buildDriver(code, input, 'python');
      expect(output).toContain('_sol = UnionFind(_init_arg)');
      expect(output).toContain('_sol.find(*_converted_args)');
    });

    it('preserves array arguments for heap_demo(nums) and twoSum(nums, target)', () => {
      const heapCode = `import heapq\ndef heap_demo(nums):\n    heapq.heapify(nums)\n    return nums`;
      const heapOutput = buildDriver(heapCode, '[[35, 12, 89, 42, 60, 15, 77]]', 'python');
      expect(heapOutput).toContain('_raw_args = [[35,12,89,42,60,15,77]]');
      expect(heapOutput).toContain('_result = heap_demo(*_converted_args)');

      const twoSumCode = `def twoSum(nums, target):\n    return []`;
      const twoSumOutput = buildDriver(twoSumCode, '[[2, 7, 11, 15], 9]', 'python');
      expect(twoSumOutput).toContain('_raw_args = [[2,7,11,15], 9]');
      expect(twoSumOutput).toContain('_result = twoSum(*_converted_args)');
    });
  });
});
