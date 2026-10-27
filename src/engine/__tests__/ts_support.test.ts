import { describe, it, expect } from 'vitest';
import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const traverse = (_traverse as any).default ?? _traverse;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generate = (_generate as any).default ?? _generate;

describe('TypeScript support in Babel AST', () => {
  it('strips TypeScript type annotations cleanly', () => {
    const code = `interface ListNode {
  val: number;
  next: ListNode | null;
}
type MyNum = number;

class Solution {
  twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    for (let i: number = 0; i < nums.length; i++) {
      const diff: number = (target - nums[i]) as number;
      if (map.has(diff)) {
        return [map.get(diff)!, i];
      }
      map.set(nums[i], i);
    }
    return [] as number[];
  }
}`;

    const ast = parser.parse(code, {
      sourceType: 'script',
      plugins: ['jsx', 'typescript'],
      errorRecovery: true,
    });

    traverse(ast, {
      TSTypeAnnotation(path: any) { path.remove(); },
      TSTypeParameterDeclaration(path: any) { path.remove(); },
      TSTypeParameterInstantiation(path: any) { path.remove(); },
      TSAsExpression(path: any) { path.replaceWith(path.node.expression); },
      TSTypeAssertion(path: any) { path.replaceWith(path.node.expression); },
      TSNonNullExpression(path: any) { path.replaceWith(path.node.expression); },
      TSInterfaceDeclaration(path: any) { path.remove(); },
      TSTypeAliasDeclaration(path: any) { path.remove(); },
    });

    const stripped = generate(ast).code;
    console.log('STRIPPED CODE:\n', stripped);
    expect(stripped).not.toContain(': number');
    expect(stripped).not.toContain('interface');
    expect(stripped).toContain('twoSum(nums, target)');
  });
});
