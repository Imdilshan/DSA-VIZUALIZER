import { describe, it, expect } from 'vitest';
import { identifyPlatform } from '../PlatformDetector';

describe('PlatformDetector', () => {
  it('identifies LeetCode Python solution (class Solution)', () => {
    const code = `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in seen:
                return [seen[diff], i]
            seen[num] = i
        return []`;
    const res = identifyPlatform(code);
    expect(res.platform).toBe('leetcode');
    expect(res.problemName).toBe('Two Sum');
    expect(res.defaultInput).toBe('[[2, 7, 11, 15], 9]');
    expect(res.badgeColor).toBe('#FFA116');
  });

  it('identifies LeetCode C++ solution', () => {
    const code = `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;
        while (curr != nullptr) {
            ListNode* next = curr->next;
            curr->next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
};`;
    const res = identifyPlatform(code);
    expect(res.platform).toBe('leetcode');
    expect(res.problemName).toBe('Reverse Linked List');
    expect(res.defaultInput).toBe('[[1, 2, 3, 4, 5]]');
  });

  it('identifies Codeforces C++ solution with cin/cout', () => {
    const code = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    int sum = 0;
    for (int x : a) sum += x;
    cout << sum << endl;
    return 0;
}`;
    const res = identifyPlatform(code);
    expect(res.platform).toBe('codeforces');
    expect(res.platformName).toContain('Codeforces');
    expect(res.badgeColor).toBe('#318CE7');
  });

  it('identifies Codeforces Python solution with sys.stdin and solve()', () => {
    const code = `import sys

def solve():
    n = int(sys.stdin.readline())
    a = list(map(int, sys.stdin.readline().split()))
    print(sum(a))

if __name__ == '__main__':
    solve()`;
    const res = identifyPlatform(code);
    expect(res.platform).toBe('codeforces');
  });

  it('identifies HackerRank solution with Result class', () => {
    const code = `import java.io.*;
class Result {
    public static int simpleArraySum(List<Integer> ar) {
        int sum = 0;
        for (int x : ar) sum += x;
        return sum;
    }
}
public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(System.in));
    }
}`;
    const res = identifyPlatform(code);
    expect(res.platform).toBe('hackerrank');
  });

  it('identifies custom algorithm function', () => {
    const code = `function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j+1]) {
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
      }
    }
  }
  return arr;
}`;
    const res = identifyPlatform(code);
    expect(res.platform).toBe('custom');
  });
});
