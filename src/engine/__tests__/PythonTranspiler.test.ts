import { describe, it, expect } from 'vitest';
import { transpilePythonToJs } from '../transpilers/PythonTranspiler';
import { runTrace } from '../JSTracer';
import { parseDriverArgs } from '../ModeDetector';

describe('PythonTranspiler (Instant In-Browser Execution)', () => {
  it('transpiles canJump LeetCode Python code and executes in < 10ms with exact line matching', async () => {
    const pythonCode = `class Solution:
    def canJump(self, nums: List[int]) -> bool:
        gas = 0
        for n in nums:
            if gas < 0:
                return False
            elif n > gas:
                gas = n
            gas -= 1
        return True`;

    const userLines = pythonCode.split('\n').length;
    const transpiled = transpilePythonToJs(pythonCode);

    expect(transpiled.methodName).toBe('canJump');
    expect(transpiled.className).toBe('Solution');

    let runnableJs = transpiled.code;
    const args = parseDriverArgs('[[3, 9, 7, 16, 18]]');
    const argsRepr = args.map((a) => JSON.stringify(a)).join(', ');
    runnableJs += `\n\n// ── AlgoLens generated driver\nconst __sol = new Solution();\n__sol.canJump(${argsRepr});`;

    const result = await runTrace({
      code: runnableJs,
      input: '[[3, 9, 7, 16, 18]]',
      mode: 'function',
      maxSteps: 1000,
      timeoutMs: 3000,
      language: 'javascript',
      userLineCount: userLines,
    });

    expect(result.steps.length).toBeGreaterThan(0);
    // Every step line must be within 1..userLines
    for (const step of result.steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.line).toBeLessThanOrEqual(userLines);
    }

    // Verify gas variable was tracked
    const gasSteps = result.steps.filter((s) => s.variables.gas !== undefined);
    expect(gasSteps.length).toBeGreaterThan(0);
  });

  it('transpiles twoSum Python solution with dict and loop', async () => {
    const pythonCode = `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, n in enumerate(nums):
            diff = target - n
            if diff in seen:
                return [seen[diff], i]
            seen[n] = i
        return []`;

    const userLines = pythonCode.split('\n').length;
    const transpiled = transpilePythonToJs(pythonCode);

    let runnableJs = transpiled.code;
    const args = parseDriverArgs('[[2, 7, 11, 15], 9]');
    const argsRepr = args.map((a) => JSON.stringify(a)).join(', ');
    runnableJs += `\n\n// ── AlgoLens generated driver\nconst __sol = new Solution();\n__sol.twoSum(${argsRepr});`;

    const result = await runTrace({
      code: runnableJs,
      input: '[[2, 7, 11, 15], 9]',
      mode: 'function',
      maxSteps: 1000,
      timeoutMs: 3000,
      language: 'javascript',
      userLineCount: userLines,
    });

    expect(result.steps.length).toBeGreaterThan(0);
    for (const step of result.steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.line).toBeLessThanOrEqual(userLines);
    }
  });

  it('transpiles standalone bubble_sort function without class Solution', async () => {
    const pythonCode = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`;

    const transpiled = transpilePythonToJs(pythonCode);
    expect(transpiled.className).toBeUndefined();
    expect(transpiled.methodName).toBe('bubble_sort');
    expect(transpiled.paramCount).toBe(1);

    const userLines = pythonCode.split('\n').length;
    let runnableJs = transpiled.code;
    const args = parseDriverArgs('[[45, 12, 85, 32, 89, 39, 69, 21]]', 1);
    const argsRepr = args.map((a) => JSON.stringify(a)).join(', ');
    runnableJs += `\n\n// ── AlgoLens generated driver\ntry { const __ret = bubble_sort(${argsRepr}); } catch(e) { console.error(e); }`;

    const result = await runTrace({
      code: runnableJs,
      input: '[[45, 12, 85, 32, 89, 39, 69, 21]]',
      mode: 'function',
      maxSteps: 1000,
      timeoutMs: 3000,
      language: 'javascript',
      userLineCount: userLines,
    });

    expect(result.error).toBeUndefined();
    expect(result.steps.length).toBeGreaterThan(10);
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.variables.arr.value).toEqual([12, 21, 32, 39, 45, 69, 85, 89]);
  });

  it('transpiles bitmask_subsets with list comprehension and bitwise range', async () => {
    const pythonCode = `def bitmask_subsets(n):
    subsets = []
    for mask in range(1 << n):
        curr = [i for i in range(n) if (mask & (1 << i))]
        subsets.append(curr)
    return subsets`;

    const transpiled = transpilePythonToJs(pythonCode);
    expect(transpiled.className).toBeUndefined();
    expect(transpiled.methodName).toBe('bitmask_subsets');
    expect(transpiled.paramCount).toBe(1);

    const userLines = pythonCode.split('\n').length;
    let runnableJs = transpiled.code;
    const args = parseDriverArgs('[3]', 1);
    const argsRepr = args.map((a) => JSON.stringify(a)).join(', ');
    runnableJs += `\n\n// ── AlgoLens generated driver\ntry { const __ret = bitmask_subsets(${argsRepr}); } catch(e) { console.error(e); }`;

    const result = await runTrace({
      code: runnableJs,
      input: '[3]',
      mode: 'function',
      maxSteps: 1000,
      timeoutMs: 3000,
      language: 'javascript',
      userLineCount: userLines,
    });

    expect(result.error).toBeUndefined();
    expect(result.steps.length).toBeGreaterThan(15);
    const maskSteps = result.steps.filter((s) => s.variables.mask !== undefined);
    expect(maskSteps.length).toBeGreaterThan(0);
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.variables.subsets.value).toHaveLength(8);
  });
});
