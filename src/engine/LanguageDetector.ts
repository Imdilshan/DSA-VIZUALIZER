import type { SupportedLanguage } from './TraceTypes';

export interface DetectionResult {
  language: SupportedLanguage;
  confidence: number; // 0 to 1
  reason?: string;
}

/**
 * High-accuracy multi-heuristic programming language detector.
 * Detects Python, JavaScript/TypeScript, C++, Java, Go, and Rust.
 */
export function detectLanguage(code: string): DetectionResult {
  if (!code || !code.trim()) {
    return { language: 'javascript', confidence: 0 };
  }

  const scores: Record<SupportedLanguage, number> = {
    python: 0,
    javascript: 0,
    cpp: 0,
    java: 0,
    go: 0,
    rust: 0,
  };

  const reasons: Record<SupportedLanguage, string[]> = {
    python: [],
    javascript: [],
    cpp: [],
    java: [],
    go: [],
    rust: [],
  };

  const trimmed = code.trim();

  if (/class\s+Solution(?:\([^)]*\))?\s*:/m.test(code)) {
    scores.python += 50;
    reasons.python.push('class Solution:');
  }
  if (/class\s+\w+\s*\{/m.test(code)) {
    scores.python -= 50;
  }
  if (/^\s*def\s+\w+\s*\(/m.test(code)) {
    scores.python += 40;
    reasons.python.push('def function()');
  }
  if (/:\s*(?:Optional|List|Dict|Tuple|Set|Union|Any)\[/m.test(code)) {
    scores.python += 45;
    reasons.python.push('typing annotations');
  }
  if (/->\s*(?:Optional|List|Dict|Tuple|Set|int|str|bool|float|None)\b/m.test(code)) {
    scores.python += 30;
    reasons.python.push('return type arrow');
  }
  if (/\bself\b/.test(code)) {
    scores.python += 25;
    reasons.python.push('self');
  }
  if (/\belif\b/.test(code)) {
    scores.python += 35;
    reasons.python.push('elif');
  }
  if (/^\s*import\s+\w+|^\s*from\s+\w+\s+import/m.test(code)) {
    scores.python += 25;
    reasons.python.push('import statement');
  }
  if (/\bin\s+range\s*\(|\benumerate\s*\(|\blen\s*\(/.test(code)) {
    scores.python += 30;
    reasons.python.push('range/enumerate/len');
  }
  if (/\bTrue\b|\bFalse\b|\bNone\b/.test(code)) {
    scores.python += 20;
    reasons.python.push('True/False/None');
  }
  if (/^\s*#(?!\s*include)\s+/m.test(code)) {
    scores.python += 15;
    reasons.python.push('# comment');
  }
  if (/if\s+__name__\s*==\s*['"]__main__['"]\s*:/m.test(code)) {
    scores.python += 60;
    reasons.python.push('__main__ block');
  }
  if (/\binput\s*\(|\bsys\.stdin\b|\bprint\s*\(/.test(code)) {
    scores.python += 35;
    reasons.python.push('input()/sys.stdin/print()');
  }

  // ── JavaScript / TypeScript heuristics ─────────────────────────
  const hasCppIndicators = /\b(?:public|private|protected)\s*:|\bvector\s*<|->(?:next|val|left|right)\b|#include\b|\bnullptr\b|\bfastio\b|\bcin\s*>>|\bcout\s*<</.test(code);
  const hasJavaIndicators = /\bpublic\s+(?:int|void|boolean|String|ListNode|TreeNode|(?:int|long|String)\[\])\s+[a-zA-Z_]\w*\s*\(|\bpublic\s+class\b|\bnew\s+\w+\[[^\]]*\]|\bScanner\b|\bSystem\.out\b/.test(code);

  if (/class\s+Solution\s*\{/m.test(code)) {
    if (hasCppIndicators) {
      scores.cpp += 60;
      reasons.cpp.push('class Solution { with C++ features');
    } else if (hasJavaIndicators) {
      scores.java += 60;
      reasons.java.push('class Solution { with Java features');
    } else {
      scores.javascript += 40;
      scores.cpp += 20;
      scores.java += 20;
      reasons.javascript.push('class Solution {');
    }
  } else if (/class\s+[A-Z]\w*\s*\{/m.test(code)) {
    if (!hasJavaIndicators && !hasCppIndicators) {
      scores.javascript += 30;
      reasons.javascript.push('class {');
    }
  }
  if (/\bfunction\s+\w+\s*\(/.test(code)) {
    scores.javascript += 35;
    reasons.javascript.push('function keyword');
  }
  if (/\b(?:const|let|var)\s+\w+\s*=/.test(code)) {
    scores.javascript += 30;
    reasons.javascript.push('const/let/var');
  }
  if (/\bconsole\.(?:log|warn|error)\b/.test(code)) {
    scores.javascript += 45;
    reasons.javascript.push('console.log');
  }
  if (/=>/.test(code)) {
    scores.javascript += 25;
    reasons.javascript.push('arrow function');
  }
  if (/===|!==/.test(code)) {
    scores.javascript += 30;
    reasons.javascript.push('triple equals');
  }
  if (/\bexport\s+(?:default|const|function)\b/.test(code)) {
    scores.javascript += 30;
    reasons.javascript.push('export');
  }
  if (/\bMath\.(?:floor|ceil|max|min|abs|round)\b/.test(code)) {
    scores.javascript += 20;
    reasons.javascript.push('Math object');
  }
  if (/\bArray\.(?:from|isArray)\b|\.push\(|\.pop\(|\.slice\(/.test(code)) {
    scores.javascript += 15;
    reasons.javascript.push('Array methods');
  }
  if (/\bundefined\b/.test(code)) {
    scores.javascript += 20;
    reasons.javascript.push('undefined');
  }

  // ── C++ heuristics ─────────────────────────────────────────────
  if (/\b(?:public|private|protected)\s*:/.test(code)) {
    scores.cpp += 65;
    reasons.cpp.push('C++ access specifier');
  }
  if (/->(?:next|val|left|right)\b/.test(code)) {
    scores.cpp += 50;
    reasons.cpp.push('C++ pointer arrow');
  }
  if (/#include\s*<[a-zA-Z0-9_./]+>/.test(code)) {
    scores.cpp += 60;
    reasons.cpp.push('#include header');
  }
  if (/using\s+namespace\s+std\s*;/.test(code)) {
    scores.cpp += 60;
    reasons.cpp.push('using namespace std');
  }
  if (/\bstd::|cout\s*<<|cin\s*>>/.test(code)) {
    scores.cpp += 50;
    reasons.cpp.push('std:: / cout << / cin >>');
  }
  if (/\bfastio\b|\bios_base::sync_with_stdio\b|cin\.tie\b/.test(code)) {
    scores.cpp += 60;
    reasons.cpp.push('fastio / cin.tie');
  }
  if (/\b(?:sort|reverse|fill)\s*\(\s*[a-zA-Z0-9_.]+\.(?:begin|rbegin)\s*\(\s*\)/.test(code)) {
    scores.cpp += 50;
    reasons.cpp.push('STL sort/reverse');
  }
  if (/\bvector<|\bunordered_map<|\bunordered_set<|\bpair<|\bqueue<|\bstack<|\bpriority_queue</.test(code)) {
    scores.cpp += 45;
    reasons.cpp.push('STL template');
  }
  if (/\bnullptr\b/.test(code)) {
    scores.cpp += 30;
    reasons.cpp.push('nullptr');
  }
  if (/int\s+main\s*\([^)]*\)\s*\{/.test(code) && (scores.cpp > 0 || !scores.java)) {
    scores.cpp += 30;
    reasons.cpp.push('int main()');
  }

  // ── Java heuristics ────────────────────────────────────────────
  if (/public\s+class\b/.test(code)) {
    scores.java += 55;
    reasons.java.push('public class');
  }
  if (/\bpublic\s+(?:int|void|boolean|String|ListNode|TreeNode|(?:int|long|String)\[\])\s+[a-zA-Z_]\w*\s*\(/.test(code)) {
    scores.java += 60;
    reasons.java.push('public Java method');
  }
  if (/public\s+static\s+void\s+main/.test(code)) {
    scores.java += 60;
    reasons.java.push('public static void main');
  }
  if (/System\.out\.print/.test(code)) {
    scores.java += 50;
    reasons.java.push('System.out.println');
  }
  if (/\b(?:String|int|boolean|double|float)\[\]/.test(code)) {
    scores.java += 35;
    reasons.java.push('Java array type');
  }
  if (/\bnew\s+(?:int|String|ArrayList|HashMap|LinkedList|ArrayDeque|boolean)\[?/.test(code)) {
    scores.java += 35;
    reasons.java.push('new keyword instantiation');
  }

  // ── Go heuristics ──────────────────────────────────────────────
  if (/package\s+main\b/.test(code)) {
    scores.go += 60;
    reasons.go.push('package main');
  }
  if (/func\s+(?:\([^)]*\)\s*)?\w+\s*\(/.test(code)) {
    scores.go += 45;
    reasons.go.push('func keyword');
  }
  if (/fmt\.(?:Println|Printf|Print)/.test(code)) {
    scores.go += 50;
    reasons.go.push('fmt.Print');
  }
  if (/:=/.test(code)) {
    scores.go += 35;
    reasons.go.push(':= declaration');
  }

  // ── Rust heuristics ────────────────────────────────────────────
  if (/\bfn\s+main\b|\bfn\s+\w+\s*\(/.test(code)) {
    scores.rust += 40;
    reasons.rust.push('fn keyword');
  }
  if (/\blet\s+mut\b/.test(code)) {
    scores.rust += 50;
    reasons.rust.push('let mut');
  }
  if (/println!\s*\(|vec!\s*\[/.test(code)) {
    scores.rust += 50;
    reasons.rust.push('println! / vec! macro');
  }
  if (/\b(?:i32|u32|usize|i64|u64|f64)\b/.test(code)) {
    scores.rust += 30;
    reasons.rust.push('Rust primitives');
  }
  if (/->\s*(?:Result|Option)\s*</.test(code)) {
    scores.rust += 35;
    reasons.rust.push('Result/Option type');
  }

  // Find max score
  let bestLang: SupportedLanguage = 'javascript';
  let maxScore = 0;
  for (const [lang, score] of Object.entries(scores) as [SupportedLanguage, number][]) {
    if (score > maxScore) {
      maxScore = score;
      bestLang = lang;
    }
  }

  const confidence = maxScore >= 25 ? Math.min(1, Math.round((maxScore / 60) * 100) / 100) : 0;
  const reason = reasons[bestLang]?.[0];

  return { language: bestLang, confidence, reason };
}
