/**
 * pyodide-runner.worker.ts
 *
 * Loads Pyodide (WebAssembly Python) in a Web Worker, installs a
 * sys.settrace-based tracer, executes user code, and returns a TraceResult.
 *
 * The worker never has DOM access, fetch is not available inside Pyodide's
 * runtime by default, providing a reasonable security boundary.
 */

import type { TraceRequest, TraceResult } from '../engine/TraceTypes';

declare function importScripts(...urls: string[]): void;
declare const loadPyodide: (opts: { indexURL: string }) => Promise<PyodideInterface>;

interface PyodideInterface {
  runPythonAsync(code: string): Promise<unknown>;
  globals: {
    get(key: string): unknown;
    set(key: string, value: unknown): void;
  };
  toPy(obj: unknown): unknown;
  pyimport(mod: string): unknown;
}

let pyodide: PyodideInterface | null = null;

async function initPyodide() {
  if (pyodide) return pyodide;

  // Load Pyodide ES module in an ES module worker
  // @ts-ignore
  const { loadPyodide: loader } = await import('https://cdn.jsdelivr.net/pyodide/v0.27.3/full/pyodide.mjs');
  pyodide = await loader({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.3/full/',
  });
  if (!pyodide) throw new Error('Failed to initialize Pyodide');
  return pyodide;
}

self.onmessage = async (e: MessageEvent<TraceRequest>) => {
  const request = e.data;

  // Signal loading state
  self.postMessage({ type: 'loading' });

  try {
    const py = await initPyodide();
    const result = await runPythonTrace(py, request);
    self.postMessage({ type: 'result', result });
  } catch (err) {
    const result: TraceResult = {
      steps: [],
      language: 'python',
      mode: 'function',
      truncated: false,
      totalSteps: 0,
      stdout: '',
      stderr: String(err),
      error: String(err),
    };
    self.postMessage({ type: 'result', result });
  }
};

// ─── Python sys.settrace tracer (injected into Pyodide) ──────────────────────

const TRACER_PYTHON_CODE = `
import sys
import json
import io
import math
import heapq
import bisect
import random
import traceback as _tb
import types as _types
import typing
import collections

# Pre-defined LeetCode data structures
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
    def __repr__(self):
        vals = []
        curr = self
        count = 0
        while curr and count < 20:
            vals.append(str(curr.val))
            curr = curr.next
            count += 1
        if curr:
            vals.append('...')
        return ' -> '.join(vals) if vals else 'None'

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
    def __repr__(self):
        return f"TreeNode({self.val})"

class Node:
    def __init__(self, val=0, neighbors=None, left=None, right=None, next=None, random=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []
        self.left = left
        self.right = right
        self.next = next
        self.random = random

_steps = []
_stdout_capture = io.StringIO()
_MAX_STEPS = 5000
_TRUNCATED = False
_TOTAL = 0
_last_vars_snapshot = {}
_MAX_USER_LINE = 999999

def _is_list_node(obj):
    return obj is not None and (type(obj).__name__ == 'ListNode' or (hasattr(obj, 'val') and hasattr(obj, 'next')))

def _is_tree_node(obj):
    return obj is not None and (type(obj).__name__ == 'TreeNode' or (hasattr(obj, 'val') and hasattr(obj, 'left') and hasattr(obj, 'right')))

def _safe_repr(val, depth=0):
    if depth > 3:
        return "..."
    if val is None:
        return "None"
    if isinstance(val, bool):
        return str(val)
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, str):
        return json.dumps(val)
    if _is_list_node(val):
        vals = []
        curr = val
        count = 0
        visited = set()
        while curr and id(curr) not in visited and count < 15:
            visited.add(id(curr))
            vals.append(str(curr.val))
            curr = curr.next
            count += 1
        if curr:
            vals.append('...')
        return ' -> '.join(vals) if vals else 'None'
    if _is_tree_node(val):
        return f"TreeNode({val.val})"
    if isinstance(val, (list, tuple)):
        if len(val) > 30:
            return f"[...{len(val)} items]"
        inner = ", ".join(_safe_repr(v, depth+1) for v in val[:30])
        return f"[{inner}]"
    if isinstance(val, dict):
        items = list(val.items())[:15]
        inner = ", ".join(f"{_safe_repr(k, depth+1)}: {_safe_repr(v, depth+1)}" for k, v in items)
        return "{" + inner + "}"
    if isinstance(val, set):
        items = list(val)[:15]
        return "{" + ", ".join(_safe_repr(v, depth+1) for v in items) + "}"
    if hasattr(val, '__dict__'):
        cls_name = type(val).__name__
        attrs = ", ".join(f"{k}={_safe_repr(v, depth+1)}" for k, v in val.__dict__.items() if not k.startswith('_'))
        return f"{cls_name}({attrs})"
    return repr(val)[:200]

def _safe_clone(val, depth=0):
    if depth > 8:
        return "..."
    if val is None or isinstance(val, (bool, int, str)):
        return val
    if isinstance(val, float):
        if math.isinf(val):
            return "Infinity" if val > 0 else "-Infinity"
        if math.isnan(val):
            return "NaN"
        return val
    if _is_list_node(val):
        nodes = []
        curr = val
        visited = set()
        while curr and id(curr) not in visited and len(nodes) < 50:
            visited.add(id(curr))
            nodes.append({
                "__id": f"node_{id(curr)}",
                "val": curr.val,
                "next": f"node_{id(curr.next)}" if curr.next else None,
                "nextId": f"node_{id(curr.next)}" if curr.next else None,
            })
            curr = curr.next
        return nodes
    if _is_tree_node(val):
        return {
            "val": val.val,
            "left": _safe_clone(val.left, depth + 1) if val.left else None,
            "right": _safe_clone(val.right, depth + 1) if val.right else None,
        }
    if isinstance(val, (list, tuple)):
        return [_safe_clone(v, depth+1) for v in val[:50]]
    if isinstance(val, dict):
        return {str(k): _safe_clone(v, depth+1) for k, v in list(val.items())[:20]}
    if isinstance(val, set):
        return list(val)[:20]
    if hasattr(val, '__dict__'):
        d = {"__class__": type(val).__name__}
        for k, v in val.__dict__.items():
            if not k.startswith('_'):
                d[k] = _safe_clone(v, depth + 1)
        return d
    return repr(val)[:200]

def _get_type(val):
    if val is None:
        return "NoneType"
    if isinstance(val, bool):
        return "bool"
    if isinstance(val, int):
        return "int"
    if isinstance(val, float):
        return "float"
    if isinstance(val, str):
        return "str"
    if _is_list_node(val):
        return "linkedList"
    if _is_tree_node(val):
        return "binaryTree"
    if isinstance(val, list):
        return "list"
    if isinstance(val, dict):
        return "dict"
    if isinstance(val, tuple):
        return "tuple"
    if isinstance(val, set):
        return "set"
    if hasattr(val, '__dict__'):
        cls_name = type(val).__name__
        cls_lower = cls_name.lower()
        if 'unionfind' in cls_lower or 'dsu' in cls_lower or 'disjoint' in cls_lower:
            return "unionFind"
        if 'fenwick' in cls_lower or 'bit' in cls_lower or 'binaryindexedtree' in cls_lower:
            return "fenwickTree"
        if 'segtree' in cls_lower or 'segmenttree' in cls_lower:
            return "segmentTree"
        return cls_name
    return type(val).__name__

SKIP_VARS = frozenset({
    '__name__', '__doc__', '__package__', '__loader__', '__spec__',
    '__builtins__', '__file__', '__cached__', '_tracer_fn',
    '_steps', '_stdout_capture', '_MAX_STEPS', '_TRUNCATED', '_TOTAL',
    '_safe_repr', '_safe_clone', '_get_type', '_is_list_node', '_is_tree_node',
    '_is_unwanted_var', 'SKIP_VARS', 'self',
    '_last_vars_snapshot', '_MAX_USER_LINE', 'ListNode', 'TreeNode', 'Node',
    '_to_list_node', '_to_tree_node', '_convert_arg', '_serialize',
    '_sol', '_result', '_raw_args', '_params_names', '_converted_args',
    'sys', 'json', 'io', 'math', 'heapq', 'bisect', 'random', '_tb', '_types',
    'typing', 'collections',
})

def _is_unwanted_var(k, v):
    if k in SKIP_VARS or k.startswith('__') or k.startswith('_'):
        return True
    if isinstance(v, type):
        return True
    if callable(v) and not hasattr(v, '__dict__'):
        return True
    v_type_name = type(v).__name__
    if 'GenericAlias' in v_type_name or v_type_name in ('TypeVar', 'Any'):
        return True
    mod = getattr(v, '__module__', '')
    if mod and (mod.startswith(('typing', 'collections', 'abc', 'sys', 'io', 'math', 'json', 'bisect', 'random', 'types'))):
        return True
    return False

def _tracer_fn(frame, event, arg):
    global _TRUNCATED, _TOTAL, _last_vars_snapshot, _MAX_USER_LINE
    if _TRUNCATED:
        return None

    # Only trace user code (filter out driver/tracer lines)
    filename = frame.f_code.co_filename
    if filename not in ('<algolens>', '<string>'):
        return _tracer_fn

    if frame.f_lineno > _MAX_USER_LINE:
        return _tracer_fn

    if frame.f_code.co_name in ('_to_list_node', '_to_tree_node', '_convert_arg', '_serialize'):
        return _tracer_fn

    _TOTAL += 1

    if len(_steps) >= _MAX_STEPS:
        _TRUNCATED = True
        return None

    # Build variables snapshot
    local_vars = {k: v for k, v in frame.f_locals.items() if not _is_unwanted_var(k, v)}
    variables = {}
    for k, v in local_vars.items():
        variables[k] = {
            "type": _get_type(v),
            "repr": _safe_repr(v),
            "value": _safe_clone(v),
        }

    # Detect mutations and comparisons on list variables
    mutations = []
    for k, v in local_vars.items():
        if isinstance(v, list):
            prev = _last_vars_snapshot.get(k)
            if isinstance(prev, list):
                if len(prev) == len(v):
                    changed = [idx for idx in range(len(v)) if v[idx] != prev[idx]]
                    if len(changed) > 0:
                        is_swap = len(changed) == 2 and v[changed[0]] == prev[changed[1]] and v[changed[1]] == prev[changed[0]]
                        mutations.append({
                            "stepIndex": len(_steps),
                            "op": "swap" if is_swap else "change",
                            "dsType": "array",
                            "dsId": k,
                            "varName": k,
                            "highlightIndices": changed,
                            "description": f"Swapped {k}[{changed[0]}] ({v[changed[0]]}) and {k}[{changed[1]}] ({v[changed[1]]})" if is_swap else f"Updated {k} at {changed}"
                        })
                else:
                    op = "push" if len(v) > len(prev) else "pop"
                    mutations.append({
                        "stepIndex": len(_steps),
                        "op": op,
                        "dsType": "array",
                        "dsId": k,
                        "varName": k,
                        "highlightIndices": [len(v) - 1] if len(v) > len(prev) else [],
                        "description": f"{op.capitalize()} on {k} (length {len(prev)} -> {len(v)})"
                    })

    if not mutations:
        arr_cand = next(((k, v) for k, v in local_vars.items() if isinstance(v, list)), None)
        if arr_cand:
            arr_name, arr_val = arr_cand
            j_val = local_vars.get('j')
            i_val = local_vars.get('i')
            mid_val = local_vars.get('mid')
            if isinstance(j_val, int) and 0 <= j_val < len(arr_val):
                second = j_val + 1 if j_val + 1 < len(arr_val) else None
                indices = [j_val, second] if second is not None else [j_val]
                mutations.append({
                    "stepIndex": len(_steps),
                    "op": "compare",
                    "dsType": "array",
                    "dsId": arr_name,
                    "varName": arr_name,
                    "highlightIndices": indices,
                    "description": f"Comparing {arr_name}[{indices[0]}] and {arr_name}[{indices[1]}]" if len(indices) == 2 else f"Checking {arr_name}[{j_val}]"
                })
            elif isinstance(mid_val, int) and 0 <= mid_val < len(arr_val):
                mutations.append({
                    "stepIndex": len(_steps),
                    "op": "compare",
                    "dsType": "array",
                    "dsId": arr_name,
                    "varName": arr_name,
                    "highlightIndices": [mid_val],
                    "description": f"Checking midpoint {arr_name}[{mid_val}]"
                })
            elif isinstance(i_val, int) and 0 <= i_val < len(arr_val):
                mutations.append({
                    "stepIndex": len(_steps),
                    "op": "compare",
                    "dsType": "array",
                    "dsId": arr_name,
                    "varName": arr_name,
                    "highlightIndices": [i_val],
                    "description": f"Inspecting {arr_name}[{i_val}]"
                })

    # Update snapshot with copies
    _last_vars_snapshot = {}
    for k, v in local_vars.items():
        if isinstance(v, list):
            _last_vars_snapshot[k] = list(v)

    # Build call stack
    call_stack = []
    f = frame
    while f is not None:
        if f.f_code.co_filename in ('<algolens>', '<string>'):
            frame_locals = {}
            arg_count = f.f_code.co_argcount
            arg_names = f.f_code.co_varnames[:arg_count]
            for arg_name in arg_names:
                if arg_name in f.f_locals and not arg_name.startswith('_'):
                    val = f.f_locals[arg_name]
                    if not _is_unwanted_var(arg_name, val):
                        frame_locals[arg_name] = {
                            "repr": _safe_repr(val),
                            "value": _safe_clone(val),
                        }
            call_stack.append({
                "name": f.f_code.co_name,
                "line": f.f_lineno,
                "locals": frame_locals,
            })
        f = f.f_back

    ev = event
    if event == 'call':
        ev = 'call'
    elif event == 'return':
        ev = 'return'
    elif event == 'exception':
        ev = 'exception'
    else:
        ev = 'line'

    step = {
        "index": len(_steps),
        "line": frame.f_lineno,
        "event": ev,
        "variables": variables,
        "callStack": list(reversed(call_stack)),
        "mutations": mutations,
        "stdout": _stdout_capture.getvalue() or None,
    }

    if event == 'exception' and arg is not None:
        exc_type, exc_val, _ = arg
        step["exception"] = {
            "type": exc_type.__name__,
            "message": str(exc_val),
        }

    _steps.append(step)
    return _tracer_fn


def run_with_trace(user_code, max_steps=5000, user_input="", user_line_count=0):
    global _steps, _stdout_capture, _TRUNCATED, _TOTAL, _MAX_STEPS, _last_vars_snapshot, _MAX_USER_LINE
    _steps = []
    _stdout_capture = io.StringIO()
    _TRUNCATED = False
    _TOTAL = 0
    _MAX_STEPS = max_steps
    _last_vars_snapshot = {}

    driver_marker = '# ── AlgoLens generated driver'
    if user_line_count and user_line_count > 0:
        _MAX_USER_LINE = user_line_count
    elif driver_marker in user_code:
        _MAX_USER_LINE = len(user_code.split(driver_marker)[0].splitlines())
    else:
        _MAX_USER_LINE = len(user_code.splitlines())

    # Redirect stdout
    old_stdout = sys.stdout
    sys.stdout = _stdout_capture

    stderr_capture = io.StringIO()
    old_stderr = sys.stderr
    sys.stderr = stderr_capture

    # Redirect stdin for competitive programming input() and sys.stdin
    old_stdin = sys.stdin
    stdin_lines = []
    if user_input:
        try:
            parsed = json.loads(user_input)
            def _extract_tokens(item):
                if isinstance(item, (list, tuple)):
                    return " ".join(str(x) for x in item)
                return str(item)
            if isinstance(parsed, list):
                for elem in parsed:
                    stdin_lines.append(_extract_tokens(elem))
            else:
                stdin_lines.append(str(parsed))
        except Exception:
            stdin_lines = [str(user_input)]
    stdin_content = "\n".join(stdin_lines) + "\n" if stdin_lines else ""
    sys.stdin = io.StringIO(stdin_content)

    error = None
    exec_globals = {
        "__name__": "__main__",
        "__builtins__": __builtins__,
    }
    builtins_map = exec_globals["__builtins__"] if isinstance(exec_globals["__builtins__"], dict) else exec_globals["__builtins__"].__dict__
    for k in dir(typing):
        if not k.startswith('_'):
            try:
                builtins_map[k] = getattr(typing, k)
            except Exception:
                pass
    for k in dir(collections):
        if not k.startswith('_'):
            try:
                builtins_map[k] = getattr(collections, k)
            except Exception:
                pass
    builtins_map["ListNode"] = ListNode
    builtins_map["TreeNode"] = TreeNode
    builtins_map["Node"] = Node
    builtins_map["math"] = math
    builtins_map["heapq"] = heapq
    builtins_map["bisect"] = bisect
    builtins_map["random"] = random

    def _worker_input(prompt=""):
        if prompt:
            _stdout_capture.write(str(prompt))
        line = sys.stdin.readline()
        if not line:
            return ""
        if line.endswith('\n'):
            line = line[:-1]
        return line

    builtins_map["input"] = _worker_input

    try:
        compiled = compile(user_code, '<algolens>', 'exec')
        sys.settrace(_tracer_fn)
        exec(compiled, exec_globals)
    except Exception as e:
        error = _tb.format_exc()
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout
        sys.stderr = old_stderr
        sys.stdin = old_stdin

    return json.dumps({
        "steps": _steps,
        "stdout": _stdout_capture.getvalue(),
        "stderr": stderr_capture.getvalue(),
        "error": error,
        "truncated": _TRUNCATED,
        "totalSteps": _TOTAL,
    })
`;

async function runPythonTrace(
  py: PyodideInterface,
  request: TraceRequest & { userLineCount?: number },
): Promise<TraceResult> {
  // Install tracer once
  await py.runPythonAsync(TRACER_PYTHON_CODE);

  py.globals.set('__user_code_str__', request.code);
  py.globals.set('__user_input_str__', request.input || '');
  py.globals.set('__max_steps__', request.maxSteps ?? 5000);
  py.globals.set('__user_line_count__', request.userLineCount ?? 0);

  let rawJson: string;
  try {
    rawJson = (await py.runPythonAsync(
      'run_with_trace(__user_code_str__, __max_steps__, __user_input_str__, __user_line_count__)',
    )) as string;
  } catch (e) {
    return {
      steps: [],
      language: 'python',
      mode: request.mode === 'auto' ? 'function' : request.mode,
      truncated: false,
      totalSteps: 0,
      stdout: '',
      stderr: String(e),
      error: String(e),
    };
  }

  const sanitized = (rawJson as string)
    .replace(/:\s*Infinity\b/g, ': "Infinity"')
    .replace(/:\s*-Infinity\b/g, ': "-Infinity"')
    .replace(/:\s*NaN\b/g, ': "NaN"');
  const data = JSON.parse(sanitized) as {
    steps: TraceResult['steps'];
    stdout: string;
    stderr: string;
    error: string | null;
    truncated: boolean;
    totalSteps: number;
  };

  return {
    steps: data.steps,
    language: 'python',
    mode: request.mode === 'auto' ? 'function' : request.mode,
    truncated: data.truncated,
    totalSteps: data.totalSteps,
    stdout: data.stdout,
    stderr: data.stderr,
    error: data.error ?? undefined,
  };
}
