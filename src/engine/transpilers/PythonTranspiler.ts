/**
 * AlgoLens Python Transpiler
 *
 * Fast, line-preserving transpiler that converts algorithmic Python (LeetCode solutions,
 * competitive programming, loops, conditionals, list/dict operations) into instrumentable
 * JavaScript while keeping line numbers 1:1 for synchronized Monaco editor and
 * animated visualizer line stepping.
 *
 * Executes in < 5ms without needing to download multi-megabyte Pyodide WebAssembly binaries.
 */

export interface PythonTranspileResult {
  code: string;
  isClassSolution: boolean;
  methodName?: string;
  className?: string;
  paramCount?: number;
}

// Transform Python list comprehensions: [expr for item in iter (if cond)?]
function transformListComprehensions(input: string): string {
  const listCompRegex = /\[\s*([^\]]+?)\s+for\s+([a-zA-Z0-9_]+)\s+in\s+([^\]]+?)(?:\s+if\s+([^\]]+?))?\s*\]/g;
  return input.replace(listCompRegex, (_match, expr, item, iter, cond) => {
    const cleanExpr = expr.trim();
    const cleanItem = item.trim();
    const cleanIter = iter.trim();
    const cleanCond = cond ? cond.trim() : null;

    let baseArr = '';
    const rangeMatch = cleanIter.match(/^range\s*\(([^)]+)\)$/);
    if (rangeMatch) {
      const rangeArgs = rangeMatch[1].split(',').map((a: string) => transformPythonExpr(a.trim()));
      if (rangeArgs.length === 1) {
        baseArr = `Array.from({ length: (${rangeArgs[0]}) }, (_, ${cleanItem}) => ${cleanItem})`;
      } else if (rangeArgs.length === 2) {
        baseArr = `Array.from({ length: Math.max(0, (${rangeArgs[1]}) - (${rangeArgs[0]})) }, (_, _idx) => (${rangeArgs[0]}) + _idx)`;
      } else {
        baseArr = `Array.from({ length: Math.max(0, Math.ceil(((${rangeArgs[1]}) - (${rangeArgs[0]})) / (${rangeArgs[2]}))) }, (_, _idx) => (${rangeArgs[0]}) + _idx * (${rangeArgs[2]}))`;
      }
    } else {
      baseArr = `Array.from(${transformPythonExpr(cleanIter)})`;
    }

    let chain = baseArr;
    if (cleanCond) {
      chain += `.filter((${cleanItem}) => Boolean(${transformPythonExpr(cleanCond)}))`;
    }
    if (cleanExpr !== cleanItem) {
      chain += `.map((${cleanItem}) => ${transformPythonExpr(cleanExpr)})`;
    }
    return chain;
  });
}

// Convert Python expressions to JavaScript expressions
function transformPythonExpr(expr: string): string {
  let res = expr;

  // List comprehensions first
  if (res.includes(' for ') && res.includes(' in ')) {
    res = transformListComprehensions(res);
  }

  // Python list repetition: [val] * count -> Array(count).fill(val)
  res = res.replace(/\[\s*([^\]]+?)\s*\]\s*\*\s*([a-zA-Z0-9_[\].()]+)/g, 'Array($2).fill($1)');

  // Boolean & null constants
  res = res.replace(/\bTrue\b/g, 'true');
  res = res.replace(/\bFalse\b/g, 'false');
  res = res.replace(/\bNone\b/g, 'null');

  // Math constants
  res = res.replace(/float\(['"]inf['"]\)/g, 'Infinity');
  res = res.replace(/float\(['"]-inf['"]\)/g, '-Infinity');

  // Logical operators (word boundaries)
  res = res.replace(/\band\b/g, '&&');
  res = res.replace(/\bor\b/g, '||');
  res = res.replace(/\bnot\s+/g, '!');

  // len(...) -> (...).length
  res = res.replace(/\blen\s*\(\s*([a-zA-Z0-9_[\].()]+)\s*\)/g, '($1).length');

  // min(...), max(...), abs(...)
  res = res.replace(/\bmin\s*\(/g, 'Math.min(');
  res = res.replace(/\bmax\s*\(/g, 'Math.max(');
  res = res.replace(/\babs\s*\(/g, 'Math.abs(');

  // Integer division: a // b -> Math.floor((a) / (b))
  res = res.replace(/([a-zA-Z0-9_[\].()]+)\s*\/\/\s*([a-zA-Z0-9_[\].()]+)/g, 'Math.floor(($1) / ($2))');

  // .append(...) -> .push(...)
  res = res.replace(/\.append\s*\(/g, '.push(');

  return res;
}

// Convert Python condition to JS condition
function cleanCondition(cond: string): string {
  let c = cond.trim();
  if (c.endsWith(':')) c = c.slice(0, -1).trim();

  // Handle "x in y" -> "__py_in(x, y)"
  const inMatch = c.match(/^(.+?)\s+in\s+(.+)$/);
  const notInMatch = c.match(/^(.+?)\s+not\s+in\s+(.+)$/);

  if (notInMatch) {
    return `!__py_in(${transformPythonExpr(notInMatch[1].trim())}, ${transformPythonExpr(notInMatch[2].trim())})`;
  } else if (inMatch) {
    return `__py_in(${transformPythonExpr(inMatch[1].trim())}, ${transformPythonExpr(inMatch[2].trim())})`;
  }

  return transformPythonExpr(c);
}

interface BlockScope {
  indent: number;
  type: 'class' | 'def' | 'for' | 'while' | 'if';
}

export function transpilePythonToJs(pythonCode: string): PythonTranspileResult {
  const lines = pythonCode.split('\n');
  const jsLines: string[] = [];

  let isClassSolution = false;
  let inClass = false;
  let className: string | undefined = undefined;
  let methodName: string | undefined;
  let paramCount: number | undefined;

  const blockStack: BlockScope[] = [];
  const declaredVars = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Preserve blank lines (crucial for 1:1 line mapping)
    if (!trimmed) {
      jsLines.push('');
      continue;
    }

    // Preserve comments
    if (trimmed.startsWith('#')) {
      jsLines.push(`// ${trimmed.slice(1)}`);
      continue;
    }

    // Measure indentation spaces (tabs count as 4)
    let indent = 0;
    for (let c = 0; c < rawLine.length; c++) {
      if (rawLine[c] === ' ') indent++;
      else if (rawLine[c] === '\t') indent += 4;
      else break;
    }

    // Handle elif / else
    if (trimmed.startsWith('elif ') || trimmed.startsWith('elif(') || trimmed === 'else:') {
      // Close any blocks deeper than this elif/else
      let closePrefix = '';
      while (blockStack.length > 0 && indent < blockStack[blockStack.length - 1].indent) {
        const popped = blockStack.pop();
        if (popped?.type === 'class') inClass = false;
        closePrefix += '} ';
      }

      if (trimmed === 'else:') {
        jsLines.push(`${closePrefix}} else {`);
      } else {
        const cond = cleanCondition(trimmed.slice(4));
        jsLines.push(`${closePrefix}} else if (${cond}) {`);
      }
      continue;
    }

    // For any standard statement, close blocks where currentIndent <= block.indent
    let closePrefix = '';
    while (blockStack.length > 0 && indent <= blockStack[blockStack.length - 1].indent) {
      const popped = blockStack.pop();
      if (popped?.type === 'class') inClass = false;
      closePrefix += '} ';
    }

    // 1. Class definition
    if (/^class\s+([a-zA-Z0-9_]+)/.test(trimmed)) {
      const match = trimmed.match(/^class\s+([a-zA-Z0-9_]+)/);
      className = match?.[1] || 'Solution';
      if (className.toLowerCase().includes('solution')) {
        isClassSolution = true;
      }
      inClass = true;
      blockStack.push({ indent, type: 'class' });
      jsLines.push(`${closePrefix}class ${className} {`);
      continue;
    }

    // 2. Method / Function definition
    const defMatch = trimmed.match(/^def\s+([a-zA-Z0-9_]+)\s*\(\s*(?:self\s*,?\s*)?([^)]*)\)\s*(?:->[^:]+)?\s*:/);
    if (defMatch) {
      const name = defMatch[1];
      const rawParams = defMatch[2];

      const cleanP = rawParams
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      if (!methodName && name !== '__init__') {
        methodName = name;
        paramCount = cleanP.length;
      }

      const cleanParams = cleanP
        .map((p) => p.split(':')[0].trim())
        .join(', ');

      cleanParams.split(',').forEach((p) => {
        const pClean = p.trim();
        if (pClean) declaredVars.add(pClean);
      });

      blockStack.push({ indent, type: 'def' });
      if (inClass) {
        jsLines.push(`${closePrefix}${name}(${cleanParams}) {`);
      } else {
        jsLines.push(`${closePrefix}function ${name}(${cleanParams}) {`);
      }
      continue;
    }

    // 3. For loops
    const forRangeMatch = trimmed.match(/^for\s+([a-zA-Z0-9_]+)\s+in\s+range\s*\(([^)]+)\)\s*:/);
    if (forRangeMatch) {
      const varName = forRangeMatch[1].trim();
      const args = forRangeMatch[2].split(',').map((a) => transformPythonExpr(a.trim()));
      declaredVars.add(varName);
      blockStack.push({ indent, type: 'for' });

      if (args.length === 1) {
        jsLines.push(`${closePrefix}for (let ${varName} = 0; ${varName} < (${args[0]}); ${varName}++) {`);
      } else if (args.length === 2) {
        jsLines.push(`${closePrefix}for (let ${varName} = (${args[0]}); ${varName} < (${args[1]}); ${varName}++) {`);
      } else {
        const step = args[2];
        jsLines.push(`${closePrefix}for (let ${varName} = (${args[0]}); (${step}) > 0 ? ${varName} < (${args[1]}) : ${varName} > (${args[1]}); ${varName} += (${step})) {`);
      }
      continue;
    }

    const forEnumerateMatch = trimmed.match(/^for\s+([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s+in\s+enumerate\s*\(([^)]+)\)\s*:/);
    if (forEnumerateMatch) {
      const idxVar = forEnumerateMatch[1].trim();
      const valVar = forEnumerateMatch[2].trim();
      const iter = transformPythonExpr(forEnumerateMatch[3].trim());
      declaredVars.add(idxVar);
      declaredVars.add(valVar);
      blockStack.push({ indent, type: 'for' });
      jsLines.push(`${closePrefix}for (const [${idxVar}, ${valVar}] of (${iter}).entries()) {`);
      continue;
    }

    const forInMatch = trimmed.match(/^for\s+([a-zA-Z0-9_]+)\s+in\s+([^:]+):/);
    if (forInMatch) {
      const varName = forInMatch[1].trim();
      const iter = transformPythonExpr(forInMatch[2].trim());
      declaredVars.add(varName);
      blockStack.push({ indent, type: 'for' });
      jsLines.push(`${closePrefix}for (const ${varName} of ${iter}) {`);
      continue;
    }

    // 4. While loop
    const whileMatch = trimmed.match(/^while\s+([^:]+):/);
    if (whileMatch) {
      const cond = cleanCondition(whileMatch[1]);
      blockStack.push({ indent, type: 'while' });
      jsLines.push(`${closePrefix}while (${cond}) {`);
      continue;
    }

    // 5. If conditional
    const ifMatch = trimmed.match(/^if\s+([^:]+):/);
    if (ifMatch) {
      const cond = cleanCondition(ifMatch[1]);
      blockStack.push({ indent, type: 'if' });
      jsLines.push(`${closePrefix}if (${cond}) {`);
      continue;
    }

    // 6. Return statements
    if (trimmed.startsWith('return')) {
      const retVal = trimmed.slice(6).trim();
      if (!retVal) {
        jsLines.push(`${closePrefix}return;`);
      } else {
        jsLines.push(`${closePrefix}return ${transformPythonExpr(retVal)};`);
      }
      continue;
    }

    // 7. Loop control
    if (trimmed === 'break') {
      jsLines.push(`${closePrefix}break;`);
      continue;
    }
    if (trimmed === 'continue') {
      jsLines.push(`${closePrefix}continue;`);
      continue;
    }
    if (trimmed === 'pass') {
      jsLines.push(`${closePrefix}/* pass */;`);
      continue;
    }

    // 8. Multiple assignment / tuple swap: a, b = x, y or arr[j], arr[j+1] = arr[j+1], arr[j]
    const multiAssignMatch = trimmed.match(/^([a-zA-Z0-9_[\].\s+*-]+)\s*,\s*([a-zA-Z0-9_[\].\s+*-]+)\s*=\s*(.+)$/);
    if (multiAssignMatch && !trimmed.startsWith('for')) {
      const v1 = multiAssignMatch[1].trim();
      const v2 = multiAssignMatch[2].trim();
      const rhs = multiAssignMatch[3].trim();
      const parts = rhs.split(',').map((p) => transformPythonExpr(p.trim()));

      const isSimpleVar1 = /^[a-zA-Z0-9_]+$/.test(v1);
      const isSimpleVar2 = /^[a-zA-Z0-9_]+$/.test(v2);
      const needsLet = (isSimpleVar1 && !declaredVars.has(v1)) || (isSimpleVar2 && !declaredVars.has(v2));

      if (isSimpleVar1) declaredVars.add(v1);
      if (isSimpleVar2) declaredVars.add(v2);

      if (needsLet) {
        jsLines.push(`${closePrefix}let [${v1}, ${v2}] = [${parts.join(', ')}];`);
      } else {
        jsLines.push(`${closePrefix}[${v1}, ${v2}] = [${parts.join(', ')}];`);
      }
      continue;
    }

    // 9. Compound assignment: gas -= 1
    const compoundMatch = trimmed.match(/^([a-zA-Z0-9_[\].]+)\s*([+\-*/%]=)\s*(.+)$/);
    if (compoundMatch) {
      const target = compoundMatch[1].trim();
      const op = compoundMatch[2];
      const val = transformPythonExpr(compoundMatch[3].trim());
      jsLines.push(`${closePrefix}${target} ${op} ${val};`);
      continue;
    }

    // 10. Single assignment: gas = 0
    const singleAssignMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*=\s*(.+)$/);
    if (singleAssignMatch && !trimmed.startsWith('def') && !trimmed.startsWith('class')) {
      const varName = singleAssignMatch[1].trim();
      let rhs = singleAssignMatch[2].trim();

      // If dict literal: seen = {}
      if (rhs === '{}') {
        rhs = '{}';
      } else {
        rhs = transformPythonExpr(rhs);
      }

      const letPrefix = declaredVars.has(varName) ? '' : 'let ';
      declaredVars.add(varName);
      jsLines.push(`${closePrefix}${letPrefix}${varName} = ${rhs};`);
      continue;
    }

    // General statement
    jsLines.push(`${closePrefix}${transformPythonExpr(trimmed)};`);
  }

  // Close any unclosed blocks at EOF
  let trailingCloses = '';
  while (blockStack.length > 0) {
    blockStack.pop();
    trailingCloses += '\n}';
  }

  return {
    code: jsLines.join('\n') + trailingCloses,
    isClassSolution,
    methodName,
    className,
    paramCount,
  };
}
