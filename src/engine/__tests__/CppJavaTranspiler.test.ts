import { describe, it, expect } from 'vitest';
import { transpileCppToJs } from '../transpilers/CppTranspiler';
import { transpileJavaToJs } from '../transpilers/JavaTranspiler';
import { runTrace } from '../JSTracer';
import { detectDataStructures } from '../DSDetector';

describe('Phase 2: C++ & Java Transpilers', () => {
  it('transpiles C++ LeetCode TwoSum class Solution to JavaScript', () => {
    const cppCode = `class Solution {
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
};`;

    const res = transpileCppToJs(cppCode);
    expect(res.isClassSolution).toBe(true);
    expect(res.methodName).toBe('twoSum');
    expect(res.code).toContain('twoSum(nums, target)');
    expect(res.code).toContain('nums.length');
    expect(res.code).toContain('let ans = [i, j];');
  });

  it('transpiles C++ swap correctly', () => {
    const code = `swap(arr[i], arr[j]);`;
    const res = transpileCppToJs(code);
    expect(res.code).toContain('[arr[i], arr[j]] = [arr[j], arr[i]]');
  });

  it('transpiles Java LeetCode TwoSum class Solution to JavaScript', () => {
    const javaCode = `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        int n = nums.length;
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                int[] ans = new int[]{map.get(complement), i};
                return ans;
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`;

    const res = transpileJavaToJs(javaCode);
    expect(res.isClassSolution).toBe(true);
    expect(res.methodName).toBe('twoSum');
    expect(res.code).toContain('twoSum(nums, target)');
    expect(res.code).toContain('new Map()');
    expect(res.code).toContain('map.set(nums[i], i)');
  });

  it('transpiles C++ initializer list returns and pointer arrows', () => {
    const cppCode = `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;
        while (curr != nullptr) {
            ListNode* nextTemp = curr->next;
            curr->next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return {prev};
    }
};`;
    const res = transpileCppToJs(cppCode);
    expect(res.code).toContain('curr.next');
    expect(res.code).toContain('let nextTemp = curr.next;');
    expect(res.code).toContain('return [prev];');
  });

  it('transpiles C++ unordered_map TwoSum snippet cleanly', () => {
    const cppCode = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int,int>mp;
        for(int i=0; i<nums.size(); i++)
        {
            int rem = target - nums[i];
            if(mp.find(rem) != mp.end()) return {i, mp[rem]};
            mp[nums[i]] = i;
        }
        return {-1, -1};
    }
};`;
    const res = transpileCppToJs(cppCode);
    expect(res.isClassSolution).toBe(true);
    expect(res.methodName).toBe('twoSum');
    expect(res.code).toContain('let mp = {};');
    expect(res.code).toContain('(rem in mp)');
    expect(res.code).toContain('return [i, mp[rem]];');
    expect(res.code).toContain('return [-1, -1];');
  });

  it('transpiles C++ competitive programming with preprocessor, cin, and braced min', () => {
    const cpCode = `//IamMradul
#include<bits/stdc++.h>

/* To Make I/O faster */
#define fastio ios_base::sync_with_stdio(0); cin.tie(0); cout.tie(0);

using namespace std;

int main(){
    int t;
    cin>>t;
    while(t--){
        int n;
        cin>>n;
        
        int a,b,c;
        cin>>a>>b>>c;
        cout<<n-min({a,b,c})<<endl;
    }
    return 0;
}`;
    const res = transpileCppToJs(cpCode);
    expect(res.isClassSolution).toBe(false);
    expect(res.code).toContain('// #define fastio');
    expect(res.code).toContain('function main()');
    expect(res.code).toContain('let t;');
    expect(res.code).toContain('t = __cin_next();');
    expect(res.code).toContain('let a,b,c;');
    expect(res.code).toContain('a = __cin_next(); b = __cin_next(); c = __cin_next();');
    expect(res.code).toContain('console.log(n-Math.min(a,b,c));');
  });

  it('successfully traces C++ twoSum with unordered_map', async () => {
    const cppCode = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int,int>mp;
        for(int i=0; i<nums.size(); i++)
        {
            int rem = target - nums[i];
            if(mp.find(rem) != mp.end()) return {i, mp[rem]};
            mp[nums[i]] = i;
        }
        return {-1, -1};
    }
};`;
    const transpiled = transpileCppToJs(cppCode);
    const driver = `${transpiled.code}\n\n// ── AlgoLens generated driver\nconst __sol = new Solution();\n__sol.twoSum([2, 7, 11, 15], 9);`;

    const res = await runTrace({
      code: driver,
      input: '[[2, 7, 11, 15], 9]',
      mode: 'function',
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: cppCode.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.steps.length).toBeGreaterThan(5);
    const ds = detectDataStructures(res.steps);
    expect(ds.some((d) => d.varName === 'mp' && d.dsType === 'hashMap')).toBe(true);
    expect(ds.some((d) => d.varName === 'nums' && d.dsType === 'array')).toBe(true);
  });

  it('successfully traces C++ competitive programming code with cin/cout', async () => {
    const cpCode = `//IamMradul
#include<bits/stdc++.h>

/* To Make I/O faster */
#define fastio ios_base::sync_with_stdio(0); cin.tie(0); cout.tie(0);

using namespace std;

int main(){
    int t;
    cin>>t;
    while(t--){
        int n;
        cin>>n;
        
        int a,b,c;
        cin>>a>>b>>c;
        cout<<n-min({a,b,c})<<endl;
    }
    return 0;
}`;
    const transpiled = transpileCppToJs(cpCode);
    const driver = `${transpiled.code}\n\n// ── AlgoLens generated driver\nmain();`;

    const res = await runTrace({
      code: driver,
      input: '[1, 10, 2, 3, 4]',
      mode: 'full-program',
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: cpCode.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.steps.length).toBeGreaterThan(5);
    // n = 10, min(2, 3, 4) = 2 -> 10 - 2 = 8
    expect(res.stdout).toContain('8');
    // Ensure all steps stay within user lines (<= 23)
    const maxStepLine = Math.max(...res.steps.map((s) => s.line));
    expect(maxStepLine).toBeLessThanOrEqual(23);
  });

  it('handles multiline function signatures and split expressions from user editor', async () => {
    const wrappedCode = `class Solution {
public:
    vector<int> twoSum(vector<int>&
    nums, int target) {
        unordered_map<int,int>mp;
        for(int i=0; i<nums.size(); i++)
        {
            int rem = target - nums[i];
            if(mp.find(rem) != mp.end
            ())  return {i, mp[rem]};
            mp[nums[i]] = i;
        }
        return {-1, -1};
    }
};`;
    const res = transpileCppToJs(wrappedCode);
    const driver = `${res.code}\n\n// ── AlgoLens generated driver\nconst __sol = new Solution();\n__sol.twoSum([2, 5, 1, 0], 9);`;
    const traceRes = await runTrace({
      code: driver,
      input: '[[2, 5, 1, 0], 9]',
      mode: 'function',
      maxSteps: 5000,
      timeoutMs: 3000,
      language: 'javascript',
      userLineCount: wrappedCode.split('\n').length,
    });
    expect(traceRes.error).toBeUndefined();
    expect(traceRes.steps.length).toBeGreaterThan(5);
  });

  it('handles heavy word-wrapping in C++ (templates, loops, split dot calls, split assignments)', async () => {
    const heavilyWrappedCpp = `class Solution {
public:
    vector<int> twoSum(vector<int>&
    nums, int target) {
        unordered_map<int,
        int> mp;
            for(int
            i=0; i<nums.
            size(); i
            ++) {

    int rem = target - nums[i];

        if(mp.find(rem) != mp.
    end()) return {i, mp[rem]};

            mp[nums[i]]
    = i;

        }

    return {-1, -1};
    }
};`;

    const res = transpileCppToJs(heavilyWrappedCpp);
    expect(res.code.split('\n').length).toBe(heavilyWrappedCpp.split('\n').length);

    const driver = `${res.code}\n\n// ── AlgoLens generated driver\nconst __sol = new Solution();\nconst __ret = __sol.twoSum([2, 5, 1, 0], 7);\n`;
    const traceRes = await runTrace({
      code: driver,
      input: '[[2, 5, 1, 0], 7]',
      mode: 'function',
      maxSteps: 5000,
      timeoutMs: 3000,
      language: 'javascript',
      userLineCount: heavilyWrappedCpp.split('\n').length,
    });

    expect(traceRes.error).toBeUndefined();
    expect(traceRes.steps.length).toBeGreaterThan(5);
  });

  it('transpiles and traces Codeforces vector<int> a(n) and sort(a.begin(), a.end())', async () => {
    const code = `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }
    sort(a.begin(), a.end());
    for (int i = 0; i < n; i++) {
        cout << a[i] << " ";
    }
    cout << endl;
    return 0;
}`;
    const transpiled = transpileCppToJs(code);
    const driver = `${transpiled.code}\n\n// ── AlgoLens generated driver\nmain();`;
    const traceRes = await runTrace({
      code: driver,
      input: '[5, [42, 12, 88, 3, 25]]',
      mode: 'full-program',
      maxSteps: 5000,
      timeoutMs: 3000,
      language: 'javascript',
      userLineCount: code.split('\n').length,
    });
    expect(traceRes.error).toBeUndefined();
    expect(traceRes.steps.length).toBeGreaterThan(5);
    expect(traceRes.stdout).toMatch(/3[\s\S]*12[\s\S]*25[\s\S]*42[\s\S]*88/);
  });
});



