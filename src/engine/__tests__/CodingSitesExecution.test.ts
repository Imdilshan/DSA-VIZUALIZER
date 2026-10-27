import { describe, it, expect } from 'vitest';
import { runTrace } from '../JSTracer';
import { transpileCppToJs } from '../transpilers/CppTranspiler';
import { buildDriver, parseDriverArgs } from '../ModeDetector';
import { identifyPlatform } from '../PlatformDetector';

describe('Coding Sites Execution & Line Tracking', () => {
  it('traces LeetCode JavaScript Solution and confines all step lines to user code', async () => {
    const userCode = `class Solution {
  twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
      const complement = target - nums[i];
      if (map.has(complement)) {
        return [map.get(complement), i];
      }
      map.set(nums[i], i);
    }
    return [];
  }
}`;
    const userLines = userCode.split('\n').length;
    const driver = buildDriver(userCode, '[[2, 7, 11, 15], 9]', 'javascript', 'function');
    const result = await runTrace({
      code: driver,
      input: '[[2, 7, 11, 15], 9]',
      mode: 'function',
      maxSteps: 1000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: userLines,
    });

    expect(result.steps.length).toBeGreaterThan(0);
    // CRITICAL: every step's line must strictly be within the user-entered code
    for (const step of result.steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.line).toBeLessThanOrEqual(userLines);
    }

    const platform = identifyPlatform(userCode);
    expect(platform.platform).toBe('leetcode');
    expect(platform.problemName).toBe('Two Sum');
  });

  it('traces Codeforces style C++ algorithm with cin/cout without leaking driver lines', async () => {
    const userCpp = `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    int sum = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        sum += x;
    }
    cout << sum << endl;
    return 0;
}`;
    const userLines = userCpp.split('\n').length;
    const transpiled = transpileCppToJs(userCpp);
    let runnableJs = transpiled.code;
    runnableJs += `\n\n// ── AlgoLens generated driver\ntry { main(); } catch(e) {}`;

    const result = await runTrace({
      code: runnableJs,
      input: '[4, 10, 20, 30, 40]',
      mode: 'full-program',
      maxSteps: 1000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: userLines,
    });

    expect(result.steps.length).toBeGreaterThan(0);
    // Every line MUST strictly be within 1..userLines
    for (const step of result.steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.line).toBeLessThanOrEqual(userLines);
    }

    const platform = identifyPlatform(userCpp);
    expect(platform.platform).toBe('codeforces');
  });

  it('traces LeetCode C++ class Solution without leaking driver lines', async () => {
    const userCpp = `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int curSum = 0;
        int maxSum = nums[0];
        for (int i = 0; i < nums.size(); i++) {
            curSum += nums[i];
            if (curSum > maxSum) maxSum = curSum;
            if (curSum < 0) curSum = 0;
        }
        return maxSum;
    }
};`;
    const userLines = userCpp.split('\n').length;
    const transpiled = transpileCppToJs(userCpp);
    let runnableJs = transpiled.code;
    const args = parseDriverArgs('[[-2, 1, -3, 4, -1, 2, 1, -5, 4]]');
    const argsRepr = args.map((a) => JSON.stringify(a)).join(', ');
    runnableJs += `\n\n// ── AlgoLens generated driver\nconst __sol = new Solution();\n__sol.maxSubArray(${argsRepr});`;

    const result = await runTrace({
      code: runnableJs,
      input: '[[-2, 1, -3, 4, -1, 2, 1, -5, 4]]',
      mode: 'function',
      maxSteps: 1000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: userLines,
    });

    expect(result.steps.length).toBeGreaterThan(0);
    for (const step of result.steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.line).toBeLessThanOrEqual(userLines);
    }

    const platform = identifyPlatform(userCpp);
    expect(platform.platform).toBe('leetcode');
    expect(platform.problemName).toBe('Maximum Subarray');
  });

  it('correctly executes user code when input is customized or edited', async () => {
    const userCode = `function search(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) return i;
  }
  return -1;
}`;
    const userLines = userCode.split('\n').length;

    // Run 1: Input target 15 (exists at index 2)
    const customInput1 = '[[10, 20, 15, 30], 15]';
    const driver1 = buildDriver(userCode, customInput1, 'javascript', 'function');
    const res1 = await runTrace({
      code: driver1,
      input: customInput1,
      mode: 'function',
      maxSteps: 1000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: userLines,
    });
    expect(res1.steps.length).toBeGreaterThan(0);
    const lastStep1 = res1.steps[res1.steps.length - 1];
    expect(lastStep1.variables.i?.value).toBe(2);

    // Run 2: User edits input: target 99 (not in array)
    const customInput2 = '[[10, 20, 15, 30], 99]';
    const driver2 = buildDriver(userCode, customInput2, 'javascript', 'function');
    const res2 = await runTrace({
      code: driver2,
      input: customInput2,
      mode: 'function',
      maxSteps: 1000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: userLines,
    });
    expect(res2.steps.length).toBeGreaterThan(0);
    // Verified that it traversed all 4 elements (i reaches 4 when loop condition i < nums.length becomes false)
    const iValues = res2.steps.map((s) => s.variables.i?.value).filter((v) => typeof v === 'number');
    expect(Math.max(...(iValues as number[]))).toBe(4);
  });
});

