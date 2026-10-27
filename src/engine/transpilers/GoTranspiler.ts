/**
 * AlgoLens Go Transpiler (Phase 3)
 *
 * Line-preserving transpiler converting common algorithmic Go code
 * (LeetCode solutions, slices, loops, swaps, fmt.Println) into
 * instrumentable JavaScript with synchronized line numbers.
 */

export interface GoTranspileResult {
  code: string;
  isFunction: boolean;
  entryPoint?: string;
}

export function transpileGoToJs(goCode: string): GoTranspileResult {
  const lines = goCode.split('\n');
  const jsLines: string[] = [];
  let isFunction = false;
  let entryPoint: string | undefined;

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
    if (/^\s*(package|import)\b/.test(line)) {
      jsLines.push(`// ${line.trim()}`);
      continue;
    }

    // Function definition: func twoSum(nums []int, target int) []int {
    // or func main() {
    const fnMatch = line.match(/^\s*func\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*(?:[^{]*?)(\{?)\s*$/);
    if (fnMatch) {
      const name = fnMatch[1];
      const rawParams = fnMatch[2];
      const hasBrace = fnMatch[3] === '{';

      if (!entryPoint) {
        entryPoint = name;
        isFunction = true;
      }

      // Clean Go parameters: e.g. "nums []int, target int" -> "nums, target"
      const cleanParams = rawParams
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
          // In Go, identifier is first: "nums []int" -> "nums"
          const m = p.match(/^([a-zA-Z_]\w*)/);
          return m ? m[1] : p;
        })
        .join(', ');

      const indent = line.match(/^\s*/)?.[0] || '';
      jsLines.push(`${indent}function ${name}(${cleanParams}) ${hasBrace ? '{' : ''}`);
      continue;
    }

    // fmt.Println(...) / fmt.Printf(...) -> console.log(...)
    if (/\bfmt\.Print(ln|f)?\s*\(/.test(line)) {
      line = line.replace(/\bfmt\.Print(ln|f)?\s*\(/g, 'console.log(');
    }

    // Multiple assignment / swap: a[i], a[j] = a[j], a[i]
    if (/^\s*([a-zA-Z_]\w*(?:\[[^\]]+\])?)\s*,\s*([a-zA-Z_]\w*(?:\[[^\]]+\])?)\s*=\s*([^,]+?)\s*,\s*([^;]+?)\s*$/.test(line)) {
      const m = line.match(/^\s*([a-zA-Z_]\w*(?:\[[^\]]+\])?)\s*,\s*([a-zA-Z_]\w*(?:\[[^\]]+\])?)\s*=\s*([^,]+?)\s*,\s*([^;]+?)\s*$/);
      if (m) {
        const indent = line.match(/^\s*/)?.[0] || '';
        jsLines.push(`${indent}[${m[1]}, ${m[2]}] = [${m[3]}, ${m[4]}];`);
        continue;
      }
    }

    // Slice declaration: arr := []int{1, 2, 3} -> let arr = [1, 2, 3];
    line = line.replace(/([a-zA-Z_]\w*)\s*:=\s*\[\]\w+\s*\{([^}]*)\}/g, 'let $1 = [$2]');

    // make([]int, n) -> new Array(n).fill(0)
    line = line.replace(/make\s*\(\s*\[\]\w+\s*,\s*([^)]+)\)/g, 'new Array($1).fill(0)');

    // Short variable declaration: n := ... -> let n = ...
    line = line.replace(/([a-zA-Z_]\w*)\s*:=\s*/g, 'let $1 = ');

    // var declaration: var n int = ... -> let n = ...
    line = line.replace(/\bvar\s+([a-zA-Z_]\w*)\s+(?:[a-zA-Z_]\w*|\[\]\w+)\s*=\s*/g, 'let $1 = ');
    line = line.replace(/\bvar\s+([a-zA-Z_]\w*)\s+(?:[a-zA-Z_]\w*|\[\]\w+)\s*$/g, 'let $1;');

    // len(x) -> x.length
    line = line.replace(/\blen\s*\(\s*([^)]+)\s*\)/g, '$1.length');

    // append(x, v) -> (x.push(v), x)
    line = line.replace(/\bappend\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/g, '($1.push($2), $1)');

    // for loop: for i := 0; i < n; i++ -> for (let i = 0; i < n; i++)
    const forMatch = line.match(/^\s*for\s+([^;]+);([^;]+);([^{]+)(\{?)\s*$/);
    if (forMatch) {
      const init = forMatch[1].replace(/([a-zA-Z_]\w*)\s*:=\s*/, 'let $1 = ');
      const cond = forMatch[2];
      const post = forMatch[3];
      const brace = forMatch[4] === '{' ? ' {' : '';
      const indent = line.match(/^\s*/)?.[0] || '';
      jsLines.push(`${indent}for (${init.trim()}; ${cond.trim()}; ${post.trim()})${brace}`);
      continue;
    }

    // while loop: for i < n { -> while (i < n) {
    const whileMatch = line.match(/^\s*for\s+([^{;]+)(\{?)\s*$/);
    if (whileMatch && !line.includes('range')) {
      const cond = whileMatch[1].trim();
      const brace = whileMatch[2] === '{' ? ' {' : '';
      const indent = line.match(/^\s*/)?.[0] || '';
      jsLines.push(`${indent}while (${cond})${brace}`);
      continue;
    }

    jsLines.push(line);
  }

  return {
    code: jsLines.join('\n'),
    isFunction,
    entryPoint,
  };
}
