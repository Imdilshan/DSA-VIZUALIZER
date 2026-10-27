/**
 * AlgoLens Rust Transpiler (Phase 3)
 *
 * Line-preserving transpiler converting common algorithmic Rust code
 * (LeetCode solutions, vec!, for in 0..n, arr.swap, println!) into
 * instrumentable JavaScript with synchronized line numbers.
 */

export interface RustTranspileResult {
  code: string;
  isFunction: boolean;
  entryPoint?: string;
}

export function transpileRustToJs(rustCode: string): RustTranspileResult {
  const lines = rustCode.split('\n');
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

    // use statements
    if (/^\s*use\b/.test(line)) {
      jsLines.push(`// ${line.trim()}`);
      continue;
    }

    // impl Solution { or struct Solution;
    if (/^\s*(?:impl|struct)\s+Solution\b/.test(line)) {
      jsLines.push(`// ${line.trim()}`);
      continue;
    }

    // Function definition: pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    const fnMatch = line.match(/^\s*(?:pub\s+)?fn\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*(?:->[^{]*)?(\{?)\s*$/);
    if (fnMatch) {
      const name = fnMatch[1];
      const rawParams = fnMatch[2];
      const hasBrace = fnMatch[3] === '{';

      if (!entryPoint && name !== 'main') {
        entryPoint = name;
        isFunction = true;
      }

      // Clean Rust parameters: "mut arr: Vec<i32>, target: i32" -> "arr, target"
      const cleanParams = rawParams
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
          const stripped = p.replace(/^mut\s+/, '');
          const m = stripped.match(/^([a-zA-Z_]\w*)/);
          return m ? m[1] : stripped;
        })
        .join(', ');

      const indent = line.match(/^\s*/)?.[0] || '';
      jsLines.push(`${indent}function ${name}(${cleanParams}) ${hasBrace ? '{' : ''}`);
      continue;
    }

    // if condition: if x > y { -> if (x > y) {
    const ifMatch = line.match(/^(\s*)if\s+([^{]+)(\{?)\s*$/);
    if (ifMatch && !line.trim().startsWith('if (')) {
      const indent = ifMatch[1];
      const cond = ifMatch[2].trim();
      const brace = ifMatch[3] === '{' ? ' {' : '';
      jsLines.push(`${indent}if (${cond})${brace}`);
      continue;
    }

    // Trailing return expression: e.g. "arr" or "vec![i, j]" -> "return ...;"
    if (/^\s*(?:[a-zA-Z_]\w*(?:\[[^\]]+\])?|\[[^\]]*\])\s*$/.test(line) && !line.includes('{') && !line.includes('}')) {
      const indent = line.match(/^\s*/)?.[0] || '';
      const expr = line.trim();
      if (!['else', 'loop', 'break', 'continue'].includes(expr)) {
        jsLines.push(`${indent}return ${expr};`);
        continue;
      }
    }

    // println!(...) / print!(...) -> console.log(...)
    if (/\bprint(ln)?!\s*\(/.test(line)) {
      line = line.replace(/\bprint(ln)?!\s*\(\s*(".*?")\s*,\s*/g, 'console.log(');
      line = line.replace(/\bprint(ln)?!\s*\(/g, 'console.log(');
    }

    // vec![1, 2, 3] -> [1, 2, 3]
    line = line.replace(/vec!\s*\[([^\]]*)\]/g, '[$1]');

    // arr.swap(i, j) -> [arr[i], arr[j]] = [arr[j], arr[i]]
    line = line.replace(
      /([a-zA-Z_]\w*)\.swap\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/g,
      '([$1[$2], $1[$3]] = [$1[$3], $1[$2]])',
    );

    // let mut x = ... / let x = ...
    line = line.replace(/\blet\s+(?:mut\s+)?([a-zA-Z_]\w*)(?:\s*:\s*[^=;]+)?\s*(=|;)/g, 'let $1 $2');

    // Remove Rust type casts: "as i32", "as usize", "as u32", "as f64"
    line = line.replace(/\s+as\s+(?:i8|i16|i32|i64|isize|u8|u16|u32|u64|usize|f32|f64)\b/g, '');

    // for loop: for i in 0..n { -> for (let i = 0; i < n; i++) {
    const rangeMatch = line.match(/^\s*for\s+([a-zA-Z_]\w*)\s+in\s+([^.]+)\.\.([^{]+)(\{?)\s*$/);
    if (rangeMatch) {
      const varName = rangeMatch[1];
      const start = rangeMatch[2].trim();
      const end = rangeMatch[3].trim().replace(/^\s*\(|\)\s*$/g, '');
      const brace = rangeMatch[4] === '{' ? ' {' : '';
      const indent = line.match(/^\s*/)?.[0] || '';
      jsLines.push(`${indent}for (let ${varName} = ${start}; ${varName} < ${end}; ${varName}++)${brace}`);
      continue;
    }

    // .len() -> .length
    line = line.replace(/\.len\(\)/g, '.length');

    jsLines.push(line);
  }

  return {
    code: jsLines.join('\n'),
    isFunction,
    entryPoint,
  };
}
