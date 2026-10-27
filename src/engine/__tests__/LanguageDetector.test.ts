import { describe, it, expect } from 'vitest';
import { detectLanguage } from '../LanguageDetector';

describe('LanguageDetector', () => {
  it('detects Python LeetCode class Solution', () => {
    const code = `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in seen:
                return [seen[diff], i]
            seen[num] = i
        return []
`;
    const result = detectLanguage(code);
    expect(result.language).toBe('python');
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('detects Python with Optional and ListNode', () => {
    const code = `class Solution:
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
        return False
`;
    const result = detectLanguage(code);
    expect(result.language).toBe('python');
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('detects JavaScript function with const/let and console.log', () => {
    const code = `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  console.log(arr);
  return arr;
}
`;
    const result = detectLanguage(code);
    expect(result.language).toBe('javascript');
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('detects C++ with #include and vector', () => {
    const code = `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> arr = {64, 34, 25, 12, 22};
    cout << arr.size() << endl;
    return 0;
}
`;
    const result = detectLanguage(code);
    expect(result.language).toBe('cpp');
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('detects Java with public class and static void main', () => {
    const code = `public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
`;
    const result = detectLanguage(code);
    expect(result.language).toBe('java');
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('detects Go with package main and func', () => {
    const code = `package main
import "fmt"

func main() {
    fmt.Println("Hello")
}
`;
    const result = detectLanguage(code);
    expect(result.language).toBe('go');
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('detects Rust with fn main, let mut, and println!', () => {
    const code = `fn main() {
    let mut x: i32 = 42;
    println!("Value: {}", x);
}
`;
    const result = detectLanguage(code);
    expect(result.language).toBe('rust');
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('does not classify class Solution { as Python', () => {
    const jsCode = `class Solution {
    twoSum(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
            const comp = target - nums[i];
            if (map.has(comp)) return [map.get(comp), i];
            map.set(nums[i], i);
        }
        return [];
    }
}`;
    const result = detectLanguage(jsCode);
    expect(result.language).not.toBe('python');
    expect(result.language).toBe('javascript');
  });
});

