import { describe, it, expect } from 'vitest';
import { transpileGoToJs } from '../transpilers/GoTranspiler';
import { transpileRustToJs } from '../transpilers/RustTranspiler';

describe('Phase 3: Go & Rust Transpilers', () => {
  it('transpiles Go bubbleSort into executable JavaScript', () => {
    const goCode = `func bubbleSort(arr []int) []int {
    n := len(arr)
    for i := 0; i < n; i++ {
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
            }
        }
    }
    return arr
}`;

    const res = transpileGoToJs(goCode);
    expect(res.isFunction).toBe(true);
    expect(res.entryPoint).toBe('bubbleSort');
    expect(res.code).toContain('function bubbleSort(arr)');
    expect(res.code).toContain('let n = arr.length');
    expect(res.code).toContain('[arr[j], arr[j+1]] = [arr[j+1], arr[j]]');
  });

  it('transpiles Rust bubble_sort into executable JavaScript', () => {
    const rustCode = `fn bubble_sort(mut arr: Vec<i32>) -> Vec<i32> {
    let n = arr.len();
    for i in 0..n {
        for j in 0..(n - i - 1) {
            if arr[j] > arr[j + 1] {
                arr.swap(j, j + 1);
            }
        }
    }
    arr
}`;

    const res = transpileRustToJs(rustCode);
    expect(res.isFunction).toBe(true);
    expect(res.entryPoint).toBe('bubble_sort');
    expect(res.code).toContain('function bubble_sort(arr)');
    expect(res.code).toContain('let n = arr.length');
    expect(res.code).toContain('for (let i = 0; i < n; i++)');
    expect(res.code).toContain('[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]');
  });
});
