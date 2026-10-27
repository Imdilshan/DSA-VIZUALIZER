/**
 * JSTracer.ts
 *
 * Core JavaScript execution tracer. Instruments JavaScript code using Babel AST,
 * executes it in a sandboxed Function scope with step-by-step state snapshots,
 * deep-copies variable environments with object identity and cycle detection,
 * tracks recursive call stacks, and records data structure mutations.
 */

import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import * as t from '@babel/types';
import type { TraceRequest, TraceResult, TraceStep, DSMutation } from './TraceTypes';

// Babel ESM interop
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const traverse = (_traverse as any).default ?? _traverse;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generate = (_generate as any).default ?? _generate;

// ─── Object Registry & Identity Tracking ─────────────────────────────────────

export class ObjectRegistry {
  private objectMap = new WeakMap<object, string>();
  private idCounter = 0;

  getId(obj: unknown): string | null {
    if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) return null;
    let id = this.objectMap.get(obj as object);
    if (!id) {
      this.idCounter++;
      let prefix = 'obj';
      if (isListNode(obj)) prefix = 'node';
      else if (isTreeNode(obj)) prefix = 'tree';
      else if (Array.isArray(obj)) prefix = 'arr';
      else if (obj instanceof Map) prefix = 'map';
      else if (obj instanceof Set) prefix = 'set';
      id = `${prefix}_${this.idCounter}`;
      this.objectMap.set(obj as object, id);
    }
    return id;
  }
}

export function isListNode(val: unknown): boolean {
  return (
    val !== null &&
    typeof val === 'object' &&
    'val' in val &&
    'next' in val
  );
}

export function isTreeNode(val: unknown): boolean {
  return (
    val !== null &&
    typeof val === 'object' &&
    'val' in val &&
    ('left' in val || 'right' in val)
  );
}

export function serializeValue(
  val: unknown,
  registry: ObjectRegistry,
  visited = new Set<unknown>(),
  depth = 0,
): unknown {
  if (val === null || val === undefined) return val;
  if (typeof val === 'number' || typeof val === 'boolean' || typeof val === 'string') return val;
  if (typeof val === 'function') return `[Function: ${(val as Function).name || 'anonymous'}]`;
  if (typeof val !== 'object') return String(val);

  const id = registry.getId(val);

  // Cycle detection
  if (visited.has(val)) {
    return { __id: id, __ref: true };
  }
  const nextVisited = new Set(visited);
  nextVisited.add(val);

  if (isListNode(val)) {
    const node = val as { val: unknown; next?: unknown };
    return {
      __id: id,
      __type: 'linkedList',
      val: node.val,
      next: node.next ? serializeValue(node.next, registry, nextVisited, depth + 1) : null,
      nextId: node.next ? registry.getId(node.next) : null,
    };
  }

  if (isTreeNode(val)) {
    const node = val as { val: unknown; left?: unknown; right?: unknown };
    return {
      __id: id,
      __type: 'binaryTree',
      val: node.val,
      left: node.left ? serializeValue(node.left, registry, nextVisited, depth + 1) : null,
      right: node.right ? serializeValue(node.right, registry, nextVisited, depth + 1) : null,
      leftId: node.left ? registry.getId(node.left) : null,
      rightId: node.right ? registry.getId(node.right) : null,
    };
  }

  if (val instanceof Map) {
    const entries: Array<{ key: unknown; value: unknown }> = [];
    for (const [k, v] of val.entries()) {
      entries.push({
        key: serializeValue(k, registry, nextVisited, depth + 1),
        value: serializeValue(v, registry, nextVisited, depth + 1),
      });
    }
    return { __id: id, __type: 'hashMap', entries };
  }

  if (val instanceof Set) {
    const items: unknown[] = [];
    for (const item of val.values()) {
      items.push(serializeValue(item, registry, nextVisited, depth + 1));
    }
    return { __id: id, __type: 'hashSet', items };
  }

  if (Array.isArray(val)) {
    if (depth > 6) return '[...]';
    return val.map((item) => serializeValue(item, registry, nextVisited, depth + 1));
  }

  // Plain object / Dictionary
  if (depth > 6) return '{...}';
  const out: Record<string, unknown> = { __id: id };
  for (const [k, v] of Object.entries(val as object)) {
    out[k] = serializeValue(v, registry, nextVisited, depth + 1);
  }
  return out;
}

export function getType(val: unknown): string {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (Array.isArray(val)) return 'array';
  if (isListNode(val)) return 'linkedList';
  if (isTreeNode(val)) return 'binaryTree';
  if (val instanceof Map) return 'hashMap';
  if (val instanceof Set) return 'hashSet';
  if (typeof val === 'object' && val !== null) {
    const keys = Object.keys(val);
    const vals = Object.values(val);
    if (keys.length > 0 && vals.every((v) => Array.isArray(v))) {
      return 'graph';
    }
    return 'hashMap';
  }
  return typeof val;
}

export function safeRepr(val: unknown, depth = 0): string {
  if (depth > 3) return '...';
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'string') return `"${val}"`;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (val instanceof Error || (typeof val === 'object' && val !== null && ('message' in val || 'stack' in val))) {
    const err = val as { name?: string; message?: string; stack?: string };
    return `${err.name || 'Error'}: ${err.message || ''}`;
  }
  if (isListNode(val)) return `Node(${(val as { val: unknown }).val})`;
  if (isTreeNode(val)) return `TreeNode(${(val as { val: unknown }).val})`;
  if (Array.isArray(val)) {
    if (val.length > 20) return `[...${val.length} items]`;
    return `[${val.map((v) => safeRepr(v, depth + 1)).join(', ')}]`;
  }
  if (val instanceof Map) {
    const entries = Array.from(val.entries()).slice(0, 8);
    return `Map(${val.size}) {${entries.map(([k, v]) => `${safeRepr(k)} => ${safeRepr(v)}`).join(', ')}}`;
  }
  if (val instanceof Set) {
    const items = Array.from(val.values()).slice(0, 8);
    return `Set(${val.size}) {${items.map((i) => safeRepr(i)).join(', ')}}`;
  }
  if (typeof val === 'object') {
    const entries = Object.entries(val as object).slice(0, 8);
    return `{${entries.map(([k, v]) => `${k}: ${safeRepr(v, depth + 1)}`).join(', ')}}`;
  }
  return String(val);
}

// ─── AST Instrumentation ─────────────────────────────────────────────────────

function buildVarSnapshot(path: import('@babel/traverse').NodePath): t.ObjectExpression {
  const bindings = path.scope.getAllBindings();
  const properties: t.ObjectProperty[] = [];
  for (const name of Object.keys(bindings)) {
    if (
      name.startsWith('__') ||
      name === 'console' ||
      name === 'arguments'
    ) {
      continue;
    }
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) continue;

    try {
      properties.push(
        t.objectProperty(
          t.stringLiteral(name),
          t.arrowFunctionExpression([], t.identifier(name)),
        ),
      );
    } catch {
      // ignore
    }
  }
  return t.objectExpression(properties);
}

export function instrumentCode(code: string, maxUserLine: number): string {
  let ast: ReturnType<typeof parser.parse>;
  try {
    ast = parser.parse(code, {
      sourceType: 'script',
      plugins: ['jsx', 'typescript'],
      errorRecovery: true,
    });
  } catch (err) {
    throw new Error(`Syntax error: ${err}`);
  }

  // 0. Strip TypeScript type annotations, interfaces, and type assertions
  traverse(ast, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TSTypeAnnotation(path: any) { path.remove(); },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TSTypeParameterDeclaration(path: any) { path.remove(); },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TSTypeParameterInstantiation(path: any) { path.remove(); },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TSAsExpression(path: any) { path.replaceWith(path.node.expression); },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TSTypeAssertion(path: any) { path.replaceWith(path.node.expression); },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TSNonNullExpression(path: any) { path.replaceWith(path.node.expression); },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TSInterfaceDeclaration(path: any) { path.remove(); },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TSTypeAliasDeclaration(path: any) { path.remove(); },
  });

  // 1. Wrap functions to track callStack
  traverse(ast, {
    Function(path: import('@babel/traverse').NodePath<t.Function>) {
      const node = path.node;
      if (!node.loc || node.loc.start.line > maxUserLine) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((node as any)._fnInstrumented) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (node as any)._fnInstrumented = true;

      let fnName = 'anonymous';
      if (t.isFunctionDeclaration(node) && node.id) {
        fnName = node.id.name;
      } else if (path.parentPath?.isVariableDeclarator() && t.isIdentifier(path.parentPath.node.id)) {
        fnName = path.parentPath.node.id.name;
      }

      // Do not track unnamed inline arrow callbacks (e.g. inside .filter, .map, Array.from) in call stack
      if (fnName === 'anonymous' && t.isArrowFunctionExpression(node)) {
        return;
      }

      const startLine = node.loc.start.line;

      if (!t.isBlockStatement(node.body)) {
        node.body = t.blockStatement([t.returnStatement(node.body)]);
      }

      const enterCall = t.expressionStatement(
        t.callExpression(t.identifier('__enterFunc__'), [
          t.stringLiteral(fnName),
          t.numericLiteral(startLine),
        ]),
      );

      const exitCall = t.expressionStatement(
        t.callExpression(t.identifier('__exitFunc__'), []),
      );

      const tryFinally = t.tryStatement(
        t.blockStatement(node.body.body),
        null,
        t.blockStatement([exitCall]),
      );

      node.body = t.blockStatement([enterCall, tryFinally]);
    },
  });

  // 2. Instrument statements, loops, returns, and conditions
  traverse(ast, {
    Statement(path: import('@babel/traverse').NodePath<t.Statement>) {
      const node = path.node;
      if (!node.loc || node.loc.start.line > maxUserLine) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((node as any)._stepInstrumented) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (node as any)._stepInstrumented = true;

      if (
        t.isBlockStatement(node) ||
        t.isProgram(node) ||
        t.isSwitchCase(node) ||
        t.isEmptyStatement(node) ||
        t.isTryStatement(node)
      ) {
        return;
      }

      // Skip declarations in for-loop headers
      if (path.key === 'init' || path.key === 'left') return;

      const line = node.loc.start.line;
      const varSnapshot = buildVarSnapshot(path);

      if (t.isReturnStatement(node)) {
        const retVal = node.argument || t.identifier('undefined');
        const retVar = path.scope.generateUidIdentifier('ret');
        const decl = t.variableDeclaration('const', [
          t.variableDeclarator(retVar, retVal),
        ]);
        const stepCall = t.expressionStatement(
          t.callExpression(t.identifier('__step__'), [
            t.numericLiteral(line),
            t.stringLiteral('return'),
            varSnapshot,
            retVar,
          ]),
        );
        node.argument = retVar;
        if (!path.parentPath?.isBlockStatement() && !path.parentPath?.isProgram()) {
          path.replaceWith(t.blockStatement([decl, stepCall, path.node]));
        } else {
          path.insertBefore(decl);
          path.insertBefore(stepCall);
        }
        return;
      }

      if (t.isWhileStatement(node) || t.isDoWhileStatement(node)) {
        if (!t.isBlockStatement(node.body)) {
          node.body = t.blockStatement([node.body]);
        }
        if (node.test) {
          const stepCall = t.callExpression(t.identifier('__step__'), [
            t.numericLiteral(line),
            t.stringLiteral('line'),
            varSnapshot,
          ]);
          node.test = t.sequenceExpression([stepCall, node.test]);
        }
        return;
      }

      if (t.isForStatement(node)) {
        if (!t.isBlockStatement(node.body)) {
          node.body = t.blockStatement([node.body]);
        }
        const testExpr = node.test || t.booleanLiteral(true);
        const stepCall = t.callExpression(t.identifier('__step__'), [
          t.numericLiteral(line),
          t.stringLiteral('line'),
          varSnapshot,
        ]);
        node.test = t.sequenceExpression([stepCall, testExpr]);
        return;
      }

      if (t.isIfStatement(node)) {
        if (!t.isBlockStatement(node.consequent)) {
          node.consequent = t.blockStatement([node.consequent]);
        }
        if (node.alternate && !t.isBlockStatement(node.alternate) && !t.isIfStatement(node.alternate)) {
          node.alternate = t.blockStatement([node.alternate]);
        }
        const stepCall = t.callExpression(t.identifier('__step__'), [
          t.numericLiteral(line),
          t.stringLiteral('line'),
          varSnapshot,
        ]);
        node.test = t.sequenceExpression([stepCall, node.test]);
        return;
      }

      const stepCall = t.expressionStatement(
        t.callExpression(t.identifier('__step__'), [
          t.numericLiteral(line),
          t.stringLiteral('line'),
          varSnapshot,
        ]),
      );

      try {
        if (path.parentPath?.isBlockStatement() || path.parentPath?.isProgram()) {
          path.insertBefore(stepCall);
        } else if (
          path.parentPath?.isIfStatement() ||
          path.parentPath?.isWhileStatement() ||
          path.parentPath?.isForStatement()
        ) {
          path.replaceWith(t.blockStatement([stepCall, path.node]));
        }
      } catch {
        // Skip if insertion fails
      }
    },
  });

  return generate(ast, { retainLines: false }, code).code;
}

// ─── Shared Global Classes for User Code ─────────────────────────────────────

export class GlobalListNode {
  val: unknown;
  next: unknown;
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

export class GlobalTreeNode {
  val: unknown;
  left: unknown;
  right: unknown;
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// ─── Execution Sandbox ───────────────────────────────────────────────────────

export async function runTrace(
  request: TraceRequest & { userLineCount?: number },
): Promise<TraceResult> {
  const { code, maxSteps = 5000, timeoutMs = 8000, userLineCount } = request;

  const steps: TraceStep[] = [];
  let stdout = '';
  let stderr = '';
  let truncated = false;
  let totalSteps = 0;

  // Determine max user line so driver code is never instrumented
  const driverMarker = code.indexOf('// ── AlgoLens generated driver');
  const maxUserLine =
    userLineCount ?? (driverMarker !== -1 ? code.slice(0, driverMarker).split('\n').length : 999999);

  let instrumented: string;
  try {
    instrumented = instrumentCode(code, maxUserLine);
  } catch (e) {
    return {
      steps,
      language: 'javascript',
      mode: request.mode === 'auto' ? 'function' : request.mode,
      truncated,
      totalSteps,
      stdout,
      stderr: String(e),
      error: String(e),
    };
  }

  const registry = new ObjectRegistry();
  const callStack: Array<{ name: string; line: number }> = [];
  let stepCount = 0;
  let lastVarsSnapshot: Record<string, unknown> = {};

  function recordStep(
    line: number,
    event: string,
    rawVars: Record<string, unknown>,
    retVal?: unknown,
  ) {
    if (line > maxUserLine || line < 1) {
      return;
    }
    totalSteps++;
    if (stepCount >= maxSteps) {
      truncated = true;
      return;
    }

    const variables: TraceStep['variables'] = {};
    for (const [k, v] of Object.entries(rawVars)) {
      variables[k] = {
        type: getType(v),
        repr: safeRepr(v),
        value: serializeValue(v, registry),
      };
    }

    // ─── Detect Mutations ───────────────────────────────────────────────────
    const mutations: DSMutation[] = [];

    for (const [k, v] of Object.entries(rawVars)) {
      // 1. Array mutations (swaps, updates, pushes)
      if (Array.isArray(v)) {
        const prev = lastVarsSnapshot[k];
        if (Array.isArray(prev)) {
          if (v.length !== prev.length) {
            mutations.push({
              stepIndex: stepCount,
              op: v.length > prev.length ? 'push' : 'pop',
              dsType: 'array',
              dsId: k,
              varName: k,
              description: `${k}.${v.length > prev.length ? 'push' : 'pop'}(), length=${v.length}`,
            });
          } else {
            const changed: number[] = [];
            for (let idx = 0; idx < v.length; idx++) {
              if (v[idx] !== prev[idx]) changed.push(idx);
            }
            if (changed.length > 0) {
              const isSwap =
                changed.length === 2 &&
                v[changed[0]] === prev[changed[1]] &&
                v[changed[1]] === prev[changed[0]];
              mutations.push({
                stepIndex: stepCount,
                op: isSwap ? 'swap' : 'change',
                dsType: 'array',
                dsId: k,
                varName: k,
                highlightIndices: changed,
                description: isSwap
                  ? `Swapped ${k}[${changed[0]}] (${v[changed[0]]}) and ${k}[${changed[1]}] (${v[changed[1]]})`
                  : `Updated ${k} at [${changed.join(', ')}]`,
              });
            }
          }
        }
      }

      // 2. Linked List pointer changes
      if (isListNode(v)) {
        const prev = lastVarsSnapshot[k];
        if (isListNode(prev)) {
          const currNextId = registry.getId((v as { next?: unknown }).next);
          const prevNextId = registry.getId((prev as { next?: unknown }).next);
          if (currNextId !== prevNextId) {
            mutations.push({
              stepIndex: stepCount,
              op: 'pointer_change',
              dsType: 'linkedList',
              dsId: registry.getId(v) || k,
              varName: k,
              description: `${k}.next updated to ${currNextId ? `Node` : 'null'}`,
            });
          }
        }
      }

      // 3. Hash Map / Plain Object mutations
      if (
        (v instanceof Map || (typeof v === 'object' && v !== null && !Array.isArray(v) && !isListNode(v) && !isTreeNode(v))) &&
        !(k in ['__step__', 'console'])
      ) {
        const prev = lastVarsSnapshot[k];
        if (prev && typeof prev === 'object') {
          if (v instanceof Map && prev instanceof Map) {
            if (v.size !== prev.size) {
              mutations.push({
                stepIndex: stepCount,
                op: 'set',
                dsType: 'hashMap',
                dsId: k,
                varName: k,
                description: `Map '${k}' updated (size=${v.size})`,
              });
            }
          } else {
            const currKeys = Object.keys(v as object);
            const prevKeys = Object.keys(prev as object);
            if (
              currKeys.length !== prevKeys.length ||
              currKeys.some(
                (ck) =>
                  (v as Record<string, unknown>)[ck] !== (prev as Record<string, unknown>)[ck],
              )
            ) {
              mutations.push({
                stepIndex: stepCount,
                op: 'set',
                dsType: 'hashMap',
                dsId: k,
                varName: k,
                description: `Updated hash map '${k}'`,
              });
            }
          }
        }
      }
    }

    // 4. Pointer comparisons on array
    if (mutations.length === 0) {
      const arrEntry = Object.entries(rawVars).find(([_, val]) => Array.isArray(val));
      if (arrEntry) {
        const [arrName, arrVal] = arrEntry as [string, unknown[]];
        const jVal = rawVars['j'];
        const iVal = rawVars['i'];
        const midVal = rawVars['mid'];
        if (typeof jVal === 'number' && jVal >= 0 && jVal < arrVal.length) {
          const second = jVal + 1 < arrVal.length ? jVal + 1 : undefined;
          const indices = second !== undefined ? [jVal, second] : [jVal];
          mutations.push({
            stepIndex: stepCount,
            op: 'compare',
            dsType: 'array',
            dsId: arrName,
            varName: arrName,
            highlightIndices: indices,
            description: indices.length === 2
              ? `Comparing ${arrName}[${indices[0]}] and ${arrName}[${indices[1]}]`
              : `Checking ${arrName}[${jVal}]`,
          });
        } else if (typeof midVal === 'number' && midVal >= 0 && midVal < arrVal.length) {
          mutations.push({
            stepIndex: stepCount,
            op: 'compare',
            dsType: 'array',
            dsId: arrName,
            varName: arrName,
            highlightIndices: [midVal],
            description: `Checking midpoint ${arrName}[${midVal}]`,
          });
        } else if (typeof iVal === 'number' && iVal >= 0 && iVal < arrVal.length) {
          mutations.push({
            stepIndex: stepCount,
            op: 'compare',
            dsType: 'array',
            dsId: arrName,
            varName: arrName,
            highlightIndices: [iVal],
            description: `Inspecting ${arrName}[${iVal}]`,
          });
        }
      }
    }

    // Update snapshot for diffing
    lastVarsSnapshot = {};
    for (const [k, v] of Object.entries(rawVars)) {
      if (Array.isArray(v)) {
        lastVarsSnapshot[k] = [...v];
      } else if (v instanceof Map) {
        lastVarsSnapshot[k] = new Map(v);
      } else if (typeof v === 'object' && v !== null && !isListNode(v) && !isTreeNode(v)) {
        lastVarsSnapshot[k] = { ...(v as object) };
      } else {
        lastVarsSnapshot[k] = v;
      }
    }

    steps.push({
      index: stepCount++,
      line,
      event: event as TraceStep['event'],
      variables,
      callStack: callStack.map((f) => ({
        name: f.name,
        line: f.line,
        locals: {},
      })),
      mutations,
      returnValue: retVal !== undefined ? serializeValue(retVal, registry) : undefined,
      stdout: stdout || undefined,
    });
  }

  // Ensure global classes and C++ helpers are accessible
  if (typeof globalThis !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).ListNode = (globalThis as any).ListNode || GlobalListNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).TreeNode = (globalThis as any).TreeNode || GlobalTreeNode;
  }

  const __CPP_END__ = { __is_end__: true };
  if (!('find' in Object.prototype)) {
    Object.defineProperty(Object.prototype, 'find', {
      value: function (key: string | number) {
        return key in this ? (this as Record<string | number, unknown>)[key] : __CPP_END__;
      },
      writable: true,
      configurable: true,
    });
  }
  if (!('end' in Object.prototype)) {
    Object.defineProperty(Object.prototype, 'end', {
      value: function () {
        return __CPP_END__;
      },
      writable: true,
      configurable: true,
    });
  }
  if (!('count' in Object.prototype)) {
    Object.defineProperty(Object.prototype, 'count', {
      value: function (key: string | number) {
        return key in this ? 1 : 0;
      },
      writable: true,
      configurable: true,
    });
  }

  // C++ Vector polyfills on Array.prototype
  if (!('size' in Array.prototype)) {
    Object.defineProperty(Array.prototype, 'size', {
      value: function () {
        return this.length;
      },
      writable: true,
      configurable: true,
    });
  }
  if (!('empty' in Array.prototype)) {
    Object.defineProperty(Array.prototype, 'empty', {
      value: function () {
        return this.length === 0;
      },
      writable: true,
      configurable: true,
    });
  }
  if (!('push_back' in Array.prototype)) {
    Object.defineProperty(Array.prototype, 'push_back', {
      value: function (x: unknown) {
        return this.push(x);
      },
      writable: true,
      configurable: true,
    });
  }
  if (!('pop_back' in Array.prototype)) {
    Object.defineProperty(Array.prototype, 'pop_back', {
      value: function () {
        return this.pop();
      },
      writable: true,
      configurable: true,
    });
  }

  // Token stream for competitive programming cin >>
  const rawInput = typeof request.input === 'string' ? request.input : JSON.stringify(request.input || '');
  let cinTokens: (number | string)[] = [];
  try {
    const p = JSON.parse(rawInput);
    const flat: (number | string)[] = [];
    const walk = (item: unknown) => {
      if (Array.isArray(item)) item.forEach(walk);
      else if (typeof item === 'number' || typeof item === 'string') flat.push(item);
    };
    walk(p);
    if (flat.length > 0) cinTokens = flat;
  } catch {
    // not JSON
  }
  if (cinTokens.length === 0) {
    cinTokens = rawInput
      .replace(/[[\],]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((tok) => {
        const num = Number(tok);
        return isNaN(num) ? tok : num;
      });
  }
  if (cinTokens.length === 0) {
    cinTokens = [1, 5, 2, 3, 4];
  }
  const cinStream = [...cinTokens];

  // Sandbox Globals
  const sandboxGlobals: Record<string, unknown> = {
    __cin_next: () => {
      return cinStream.length > 0 ? cinStream.shift() : 0;
    },
    __enterFunc__: (name: string, line: number) => {
      callStack.push({ name, line });
    },
    __exitFunc__: () => {
      callStack.pop();
    },
    __step__: (
      line: number,
      event: string,
      varCollector?: Record<string, () => unknown>,
      retVal?: unknown,
    ) => {
      if (truncated) throw new Error('__TRUNCATED__');
      const vars: Record<string, unknown> = {};
      if (varCollector && typeof varCollector === 'object') {
        for (const [k, getter] of Object.entries(varCollector)) {
          try {
            vars[k] = typeof getter === 'function' ? getter() : getter;
          } catch {
            // Variable in TDZ or out of scope, safely ignore
          }
        }
      }
      recordStep(line, event, vars, retVal);
    },
    console: {
      log: (...args: unknown[]) => {
        stdout += args.map((a) => safeRepr(a)).join(' ') + '\n';
      },
      error: (...args: unknown[]) => {
        stderr += args.map((a) => safeRepr(a)).join(' ') + '\n';
      },
      warn: (...args: unknown[]) => {
        stdout += '[warn] ' + args.map((a) => safeRepr(a)).join(' ') + '\n';
      },
    },
    // Block unsafe globals
    fetch: undefined,
    XMLHttpRequest: undefined,
    importScripts: undefined,
    // Provide safe builtins
    Math,
    Array,
    Object,
    String,
    Number,
    Boolean,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    undefined,
    NaN,
    Infinity,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Promise,
    Symbol,
  };

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Execution timed out (infinite loop protection)')), timeoutMs),
  );

  try {
    await Promise.race([
      new Promise<void>((resolve, reject) => {
        try {
          const fn = new (Function as FunctionConstructor)(
            ...Object.keys(sandboxGlobals),
            `"use strict";\n${instrumented}`,
          );
          fn(...Object.values(sandboxGlobals));
          resolve();
        } catch (err: unknown) {
          if (err instanceof Error && err.message === '__TRUNCATED__') {
            resolve();
          } else {
            reject(err);
          }
        }
      }),
      timeoutPromise,
    ]);
  } catch (err: unknown) {
    if (err instanceof Error && err.message !== '__TRUNCATED__') {
      const msg = err.message || String(err);
      stderr += `\nRuntime error: ${msg}`;
      const rawLast = steps.length > 0 ? steps[steps.length - 1].line : 1;
      const lastLine = Math.max(1, Math.min(rawLast, maxUserLine));
      steps.push({
        index: stepCount++,
        line: lastLine,
        event: 'exception',
        variables: steps.length > 0 ? steps[steps.length - 1].variables : {},
        callStack: callStack.map((f) => ({ name: f.name, line: f.line, locals: {} })),
        mutations: [],
        exception: { type: 'RuntimeError', message: msg },
      });
    }
  }

  return {
    steps,
    language: 'javascript',
    mode: request.mode === 'auto' ? 'function' : request.mode,
    truncated,
    totalSteps,
    stdout,
    stderr,
    error: stderr || undefined,
  };
}
