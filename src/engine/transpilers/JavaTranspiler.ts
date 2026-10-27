/**
 * AlgoLens Java Transpiler (Phase 2)
 *
 * Line-preserving transpiler converting Java LeetCode solutions and standard
 * algorithmic code into instrumentable JavaScript with synchronized line numbering.
 */

export interface JavaTranspileResult {
  code: string;
  isClassSolution: boolean;
  methodName?: string;
}

export function transpileJavaToJs(javaCode: string): JavaTranspileResult {
  const lines = javaCode.split('\n');
  const jsLines: string[] = [];

  let isClassSolution = false;
  let inClass = false;
  let methodName: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (!line.trim()) {
      jsLines.push('');
      continue;
    }

    if (line.trim().startsWith('//')) {
      jsLines.push(line);
      continue;
    }

    // package / import statements
    if (/^\s*(package|import)\s+/.test(line)) {
      jsLines.push(`// ${line.trim()}`);
      continue;
    }

    // Class definition
    if (/^\s*(public\s+)?class\s+([A-Za-z_]\w*)/.test(line)) {
      const match = line.match(/^\s*(public\s+)?class\s+([A-Za-z_]\w*)/);
      const className = match?.[2] || 'Solution';
      if (className === 'Solution') {
        isClassSolution = true;
      }
      inClass = true;
      jsLines.push(line.replace(/^(?:\s*public\s+)?class\s+([A-Za-z_]\w*)[^{]*/, `class ${className} `));
      continue;
    }

    // Method detection
    // e.g. public int[] twoSum(int[] nums, int target) {
    // or public static void main(String[] args) {
    const methodMatch = line.match(
      /^\s*(?:(?:public|private|protected|static|final)\s+)*(?:void|int(?:\[\])*|long(?:\[\])*|double(?:\[\])*|float(?:\[\])*|boolean(?:\[\])*|char(?:\[\])*|String(?:\[\])*|List<[^>]+>|Map<[^>]+>|ListNode|TreeNode)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*(\{?)\s*$/,
    );

    if (methodMatch) {
      const name = methodMatch[1];
      const rawParams = methodMatch[2];
      const hasBrace = methodMatch[3] === '{';

      if (inClass && !methodName && name !== 'Solution') {
        methodName = name;
      }

      // Clean parameters
      const cleanParams = rawParams
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
          const m = p.match(/([a-zA-Z_]\w*)\s*$/);
          return m ? m[1] : p;
        })
        .join(', ');

      const indent = line.match(/^\s*/)?.[0] || '';
      if (name === 'main') {
        jsLines.push(`${indent}function main(${cleanParams}) ${hasBrace ? '{' : ''}`);
      } else if (inClass) {
        jsLines.push(`${indent}${name}(${cleanParams}) ${hasBrace ? '{' : ''}`);
      } else {
        jsLines.push(`${indent}function ${name}(${cleanParams}) ${hasBrace ? '{' : ''}`);
      }
      continue;
    }

    // System.out.println(...) / print(...) -> console.log(...)
    if (/System\.out\.print(ln)?\s*\(/.test(line)) {
      line = line.replace(/System\.out\.print(ln)?\s*\(/g, 'console.log(');
    }

    // return new int[] { a, b }; -> return [a, b];
    line = line.replace(/\breturn\s+new\s+\w+\[\]\s*\{([^}]*)\}\s*;/g, 'return [$1];');
    line = line.replace(/\breturn\s+new\s+\w+\[\s*0?\s*\]\s*;/g, 'return [];');

    // Array allocations:
    // int[] ans = new int[2]; -> let ans = new Array(2).fill(0);
    line = line.replace(
      /\b(?:int|long|double|float|char|boolean|String)\s*(?:\[\s*\])+\s+([a-zA-Z_]\w*)\s*=\s*new\s+\w+\[([^\]]+)\](?:\s*\[\s*\])?\s*;/g,
      'let $1 = new Array($2).fill(0);',
    );

    // int[] ans = new int[]{1, 2}; -> let ans = [1, 2];
    line = line.replace(
      /\b(?:int|long|double|float|char|boolean|String)\s*\[\]\s+([a-zA-Z_]\w*)\s*=\s*new\s+\w+\[\]\s*\{([^}]*)\}\s*;/g,
      'let $1 = [$2];',
    );

    // int[] ans = {1, 2}; -> let ans = [1, 2];
    line = line.replace(
      /\b(?:int|long|double|float|char|boolean|String)\s*\[\]\s+([a-zA-Z_]\w*)\s*=\s*\{([^}]*)\}\s*;/g,
      'let $1 = [$2];',
    );

    // List / Map / Queue instantiations
    // Map<Integer, Integer> map = new HashMap<>(); -> let map = new Map();
    line = line.replace(
      /\b(?:Map|HashMap)\s*(?:<[^>]+>)?\s+([a-zA-Z_]\w*)\s*=\s*new\s+HashMap\s*(?:<[^>]*>)?\s*\(\)\s*;/g,
      'let $1 = new Map();',
    );

    // List<Integer> list = new ArrayList<>(); -> let list = [];
    line = line.replace(
      /\b(?:List|ArrayList)\s*(?:<[^>]+>)?\s+([a-zA-Z_]\w*)\s*=\s*new\s+ArrayList\s*(?:<[^>]*>)?\s*\(\)\s*;/g,
      'let $1 = [];',
    );

    // Queue<Integer> queue = new LinkedList<>(); -> let queue = [];
    line = line.replace(
      /\b(?:Queue|Deque)\s*(?:<[^>]+>)?\s+([a-zA-Z_]\w*)\s*=\s*new\s+(?:LinkedList|ArrayDeque)\s*(?:<[^>]*>)?\s*\(\)\s*;/g,
      'let $1 = [];',
    );

    // Variable declarations: int n = ...; ListNode curr = ...;
    line = line.replace(
      /\b(?:int|long|double|float|boolean|char|String|ListNode|TreeNode|[A-Z]\w*)\s+([a-zA-Z_]\w*)\s*(=|;)/g,
      'let $1 $2',
    );

    // for (int i = 0; ...) -> for (let i = 0; ...)
    line = line.replace(/\bfor\s*\(\s*int\s+/g, 'for (let ');

    // Enhanced for loop: for (int v : graph[u]) -> for (let v of graph[u])
    line = line.replace(
      /\bfor\s*\(\s*(?:int|long|double|float|boolean|char|String|ListNode|TreeNode|[A-Z]\w*)\s+([a-zA-Z_]\w*)\s*:\s*([^)]+)\)/g,
      'for (let $1 of $2)',
    );

    // map.put(k, v) -> map.set(k, v)
    line = line.replace(/\.put\s*\(/g, '.set(');

    // map.containsKey(k) -> map.has(k)
    line = line.replace(/\.containsKey\s*\(/g, '.has(');

    // list.add(x) / queue.add(x) / queue.offer(x) -> list.push(x)
    line = line.replace(/\.(?:add|offer)\s*\(/g, '.push(');

    // queue.poll() -> queue.shift()
    line = line.replace(/\.poll\s*\(\)/g, '.shift()');

    // queue.isEmpty() -> queue.length === 0
    line = line.replace(/\.isEmpty\s*\(\)/g, '.length === 0');

    // .length() -> .length (for Strings)
    line = line.replace(/\.length\(\)/g, '.length');

    jsLines.push(line);
  }

  return {
    code: jsLines.join('\n'),
    isClassSolution,
    methodName,
  };
}
