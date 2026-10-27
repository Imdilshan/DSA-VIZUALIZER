/**
 * AlgoLens C++ Transpiler (Phase 2)
 *
 * Lightweight, line-preserving transpiler that converts common algorithmic C++
 * (e.g. LeetCode solutions, competitive programming loops, vectors, sorting)
 * into instrumentable JavaScript while keeping line numbers 1:1 for synchronized
 * Monaco code gutter highlighting and trace stepping.
 */

export interface TranspileResult {
  code: string;
  entryPoint?: string;
  isClassSolution: boolean;
  methodName?: string;
}

export function isLineIncomplete(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('//')) return false;
  if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) return false;
  if (/^\s*#/.test(trimmed)) return trimmed.endsWith('\\');
  if (/^\s*(public|private|protected)\s*:/.test(trimmed)) return false;
  if (/^\s*case\b.*:/.test(trimmed) || /^\s*default\s*:/.test(trimmed)) return false;

  // Track delimiters
  let depthParen = 0;
  let depthBracket = 0;
  let depthAngle = 0;
  let inTemplate = false;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === '(') depthParen++;
    else if (ch === ')') depthParen = Math.max(0, depthParen - 1);
    else if (ch === '[') depthBracket++;
    else if (ch === ']') depthBracket = Math.max(0, depthBracket - 1);
    else if (ch === '<') {
      const prev = trimmed.slice(0, i);
      if (
        /\b(?:vector|unordered_map|map|unordered_set|set|pair|queue|priority_queue|stack|deque|list|array)\s*$/.test(
          prev,
        )
      ) {
        inTemplate = true;
        depthAngle++;
      } else if (inTemplate) {
        depthAngle++;
      }
    } else if (ch === '>') {
      if (inTemplate && depthAngle > 0) {
        depthAngle--;
        if (depthAngle === 0) inTemplate = false;
      }
    }
  }

  if (depthParen > 0 || depthBracket > 0 || depthAngle > 0) return true;

  // Ends with continuation operator
  if (/(?:[,.]|->|[=+\-*/%&|^]|!=|==|<=|>=|&&|\|\||<<|>>)\s*$/.test(trimmed)) {
    return true;
  }

  // Complete statement endings
  if (/[;{}]$/.test(trimmed)) return false;

  // if (...), for (...), while (...) with balanced parens
  if (/^\s*(?:if|for|while|switch)\s*\(.*\)\s*$/.test(trimmed)) {
    return false;
  }

  return true;
}

function splitCoutTokens(raw: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  let inString: string | null = null;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (inString) {
      current += ch;
      if (ch === inString && raw[i - 1] !== '\\') inString = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      current += ch;
      continue;
    }
    if (ch === '(' || ch === '{' || ch === '[') depth++;
    else if (ch === ')' || ch === '}' || ch === ']') depth = Math.max(0, depth - 1);

    if (depth === 0 && ch === '<' && raw[i + 1] === '<') {
      if (current.trim()) parts.push(current.trim());
      current = '';
      i++; // skip next '<'
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function transpileSingleStatement(
  statement: string,
  inClass: boolean,
): { js: string; isClassSolution?: boolean; inClass?: boolean; methodName?: string } {
  let line = statement;

  if (!line.trim()) return { js: '' };
  if (line.trim().startsWith('//')) return { js: line };
  if (line.trim().startsWith('/*') && line.trim().endsWith('*/')) return { js: line };
  if (/^\s*(?:\/\*.*?\*\/\s*)*#/.test(line)) return { js: `// ${line.trim()}` };
  if (/^\s*using\s+namespace\s+std\s*;/.test(line)) return { js: `// ${line.trim()}` };
  if (
    /^\s*(?:fastio\s*;?|(?:ios_base\s*::\s*sync_with_stdio|cin\s*\.\s*tie|cout\s*\.\s*tie)\s*\([^)]*\)\s*;?)/.test(
      line,
    )
  ) {
    return { js: `// ${line.trim()}` };
  }
  if (/^\s*class\s+Solution\b/.test(line)) {
    return {
      js: line.replace(/class\s+Solution[^{]*/, 'class Solution '),
      isClassSolution: true,
      inClass: true,
    };
  }
  if (/^\s*(public|private|protected)\s*:/.test(line)) {
    return { js: `// ${line.trim()}` };
  }
  if (inClass && /^\s*\}\s*;\s*$/.test(line)) {
    return { js: '}', inClass: false };
  }

  // Function / Method detection
  const fnMatch = line.match(
    /^\s*(?:(?:static|inline|virtual)\s+)*(?:void|int|long(?:\s+long)?|double|float|bool|char|string|auto|vector\s*<[^>]+>|ListNode\*?|TreeNode\*?)(?:\s+|(?<=[*>]))([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*(\{?)\s*$/,
  );
  if (fnMatch) {
    const name = fnMatch[1];
    const rawParams = fnMatch[2];
    const hasBrace = fnMatch[3] === '{';
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
    const js = inClass
      ? `${indent}${name}(${cleanParams}) ${hasBrace ? '{' : ''}`
      : `${indent}function ${name}(${cleanParams}) ${hasBrace ? '{' : ''}`;
    return { js, methodName: inClass && name !== 'Solution' ? name : undefined };
  }

  line = line.replace(/std::/g, '');
  line = line.replace(/\bfastio\s*;?/g, '/* fastio */');

  if (/\bcin\s*>>/.test(line)) {
    const indent = line.match(/^\s*/)?.[0] || '';
    const vars = line
      .replace(/^\s*cin\s*>>\s*/, '')
      .replace(/;\s*$/, '')
      .split(/>>\s*/)
      .map((v) => v.trim())
      .filter(Boolean);
    const assignments = vars.map((v) => `${v} = __cin_next()`).join('; ');
    return { js: `${indent}${assignments};` };
  }

  if (/\bcout\s*<<\s*/.test(line)) {
    const indent = line.match(/^\s*/)?.[0] || '';
    const rawContent = line.replace(/^\s*cout\s*<<\s*/, '').replace(/;\s*$/, '');
    const rawTokens = splitCoutTokens(rawContent)
      .map((p) => p.trim())
      .filter((p) => p && p !== 'endl');
    const processedTokens = rawTokens.map((tok) =>
      tok
        .replace(/\b(?<!\.)min\s*\(\s*\{([^}]+)\}\s*\)/g, 'Math.min($1)')
        .replace(/\b(?<!\.)max\s*\(\s*\{([^}]+)\}\s*\)/g, 'Math.max($1)'),
    );
    return { js: `${indent}console.log(${processedTokens.join(', ')});` };
  }

  line = line.replace(/->/g, '.');
  line = line.replace(/\bswap\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/g, '([$1, $2] = [$2, $1])');
  line = line.replace(/\breturn\s*\{([^}]*)\}\s*;/g, 'return [$1];');

  // Vector 2D allocation: vector<vector<int>> grid(n, vector<int>(m, 0));
  line = line.replace(
    /\bvector\s*<\s*vector\s*<[^>]+>\s*>\s*([a-zA-Z_]\w*)\s*\(([^,]+),\s*vector\s*<[^>]+>\s*\(([^,)]+)(?:,\s*([^)]+))?\)\s*\)\s*;/g,
    'let $1 = Array.from({length: $2}, () => new Array($3).fill($4 !== undefined ? $4 : 0));',
  );
  line = line.replace(/\bvector\s*<[^>]+>\s*([a-zA-Z_]\w*)\s*=\s*\{([^}]*)\}\s*;/g, 'let $1 = [$2];');
  line = line.replace(
    /\bvector\s*<[^>]+>\s*([a-zA-Z_]\w*)\s*\(([^,]+),\s*([^)]+)\)\s*;/g,
    'let $1 = new Array($2).fill($3);',
  );
  // Single-argument vector constructor: vector<int> a(n);
  line = line.replace(
    /\bvector\s*<[^>]+>\s*([a-zA-Z_]\w*)\s*\(([^,)]+)\)\s*;/g,
    'let $1 = new Array($2).fill(0);',
  );
  line = line.replace(/\bvector\s*<[^>]+>\s*([a-zA-Z_]\w*)\s*;/g, 'let $1 = [];');

  // C++ STL sort & reverse
  line = line.replace(
    /\bsort\s*\(\s*([a-zA-Z0-9_[\].]+)\s*\.\s*rbegin\s*\(\s*\)\s*,\s*\1\s*\.\s*rend\s*\(\s*\)\s*\)\s*;/g,
    '$1.sort((x, y) => y - x);',
  );
  line = line.replace(
    /\bsort\s*\(\s*([a-zA-Z0-9_[\].]+)\s*\.\s*begin\s*\(\s*\)\s*,\s*\1\s*\.\s*end\s*\(\s*\)\s*,\s*greater\s*<[^>]*>\s*\(\s*\)\s*\)\s*;/g,
    '$1.sort((x, y) => y - x);',
  );
  line = line.replace(
    /\bsort\s*\(\s*([a-zA-Z0-9_[\].]+)\s*\.\s*begin\s*\(\s*\)\s*,\s*\1\s*\.\s*end\s*\(\s*\)\s*\)\s*;/g,
    '$1.sort((x, y) => x - y);',
  );
  line = line.replace(
    /\breverse\s*\(\s*([a-zA-Z0-9_[\].]+)\s*\.\s*begin\s*\(\s*\)\s*,\s*\1\s*\.\s*end\s*\(\s*\)\s*\)\s*;/g,
    '$1.reverse();',
  );

  // Pair support
  line = line.replace(/\bpair\s*<[^>]+>\s*([a-zA-Z_]\w*)\s*=\s*\{([^}]*)\}\s*;/g, 'let $1 = [$2];');
  line = line.replace(/\bpair\s*<[^>]+>\s*([a-zA-Z_]\w*)\s*;/g, 'let $1 = [0, 0];');
  line = line.replace(/\bmake_pair\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/g, '[$1, $2]');
  line = line.replace(/\.first\b/g, '[0]');
  line = line.replace(/\.second\b/g, '[1]');

  line = line.replace(/\b(?:unordered_map|map)\s*<[^>]+>\s*([a-zA-Z_]\w*)\s*;/g, 'let $1 = {};');
  line = line.replace(/\b(?:unordered_set|set)\s*<[^>]+>\s*([a-zA-Z_]\w*)\s*;/g, 'let $1 = new Set();');
  line = line.replace(/\b([a-zA-Z_]\w*)\s*\.\s*find\s*\(([^)]+)\)\s*!=\s*\1\s*\.\s*end\s*\(\s*\)/g, '($2 in $1)');
  line = line.replace(/\b([a-zA-Z_]\w*)\s*\.\s*find\s*\(([^)]+)\)\s*==\s*\1\s*\.\s*end\s*\(\s*\)/g, '(!($2 in $1))');
  line = line.replace(/\b([a-zA-Z_]\w*)\s*\.\s*count\s*\(([^)]+)\)/g, '($2 in $1 ? 1 : 0)');

  // Fixed size arrays: int a[100]; int a[n];
  line = line.replace(
    /\b(?:int|long(?:\s+long)?|double|float|char|bool)\s+([a-zA-Z_]\w*)\s*\[([^\]]+)\]\s*;/g,
    'let $1 = new Array($2).fill(0);',
  );

  line = line.replace(
    /\b(?:int|long(?:\s+long)?|double|float|char|string|bool)\s+([a-zA-Z_]\w*)\s*\[\]\s*=\s*\{([^}]*)\}\s*;/g,
    'let $1 = [$2];',
  );
  line = line.replace(
    /\b(?:int|long(?:\s+long)?|double|float|char|string|bool|auto|size_t|ListNode\*?|TreeNode\*?|[A-Za-z_]\w*\*)\s+([a-zA-Z_]\w*(?:\s*=[^,;]+)?(?:\s*,\s*[a-zA-Z_]\w*(?:\s*=[^,;]+)?)*)\s*;/g,
    'let $1;',
  );
  line = line.replace(/\bfor\s*\(\s*(?:int|long(?:\s+long)?|size_t|auto)\s+/g, 'for (let ');
  line = line.replace(
    /\bfor\s*\(\s*(?:auto|int|long(?:\s+long)?|char|string|ListNode\*?|TreeNode\*?|[A-Za-z_]\w*\*?)\s+([a-zA-Z_]\w*)\s*:\s*([^)]+)\)/g,
    'for (let $1 of $2)',
  );
  line = line.replace(/=\s*\{([^}]+)\}\s*;/g, '= [$1];');
  line = line.replace(/\.\s*size\s*\(\s*\)/g, '.length');
  line = line.replace(/\.\s*push_back\s*\(/g, '.push(');
  line = line.replace(/\.\s*pop_back\s*\(\s*\)/g, '.pop()');
  line = line.replace(/\.\s*empty\s*\(\s*\)/g, '.length === 0');
  line = line.replace(/\b(?<!\.)min\s*\(\s*\{([^}]+)\}\s*\)/g, 'Math.min($1)');
  line = line.replace(/\b(?<!\.)max\s*\(\s*\{([^}]+)\}\s*\)/g, 'Math.max($1)');
  line = line.replace(/\b(?<!\.)max\s*\(/g, 'Math.max(');
  line = line.replace(/\b(?<!\.)min\s*\(/g, 'Math.min(');
  line = line.replace(/\b(?<!\.)abs\s*\(/g, 'Math.abs(');
  line = line.replace(/\b(nullptr|NULL)\b/g, 'null');

  return { js: line };
}

export function transpileCppToJs(cppCode: string): TranspileResult {
  const lines = cppCode.split('\n');
  const jsLines: string[] = new Array(lines.length).fill('');

  let isClassSolution = false;
  let inClass = false;
  let methodName: string | undefined;

  let currStart = 0;
  let acc = '';

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (acc === '') {
      currStart = i;
      acc = rawLine;
    } else {
      const prevTrimmed = acc.trim();
      const joiner =
        prevTrimmed.endsWith('.') || prevTrimmed.endsWith('->') || prevTrimmed.endsWith('(')
          ? ''
          : ' ';
      acc += joiner + rawLine.trim();
    }

    if (!isLineIncomplete(acc) || i === lines.length - 1) {
      const res = transpileSingleStatement(acc, inClass);
      if (res.isClassSolution) isClassSolution = true;
      if (res.inClass !== undefined) inClass = res.inClass;
      if (res.methodName && !methodName) methodName = res.methodName;

      if (currStart === i) {
        jsLines[i] = res.js;
      } else {
        // Multiline statement: comment out previous lines to preserve 1:1 line numbers
        for (let k = currStart; k < i; k++) {
          const indent = lines[k].match(/^\s*/)?.[0] || '';
          jsLines[k] = `${indent}// ${lines[k].trim()}`;
        }
        jsLines[i] = res.js;
      }
      acc = '';
    }
  }

  return {
    code: jsLines.join('\n'),
    isClassSolution,
    methodName,
  };
}
