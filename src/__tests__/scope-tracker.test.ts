import { describe, it, expect } from 'vitest';
import { ScopeTracker, ScopeType } from '../utils/scope-tracker';

// Create a minimal mock AST node
const createMockNode = (type: string): { type: string } => ({ type });

describe('ScopeTracker', () => {
  it('should create a root global scope', () => {
    const rootNode = createMockNode('Program') as any;
    const tracker = new ScopeTracker(rootNode);

    const currentScope = (tracker as any).currentScope;
    expect(currentScope.type).toBe('global');
    expect(currentScope.parent).toBeNull();
  });

  it('should enter and exit scopes correctly', () => {
    const rootNode = createMockNode('Program') as any;
    const tracker = new ScopeTracker(rootNode);

    const funcNode = createMockNode('FunctionDeclaration') as any;
    tracker.enterScope('function', funcNode);

    let currentScope = (tracker as any).currentScope;
    expect(currentScope.type).toBe('function');
    expect(currentScope.parent?.type).toBe('global');

    tracker.exitScope();
    currentScope = (tracker as any).currentScope;
    expect(currentScope.type).toBe('global');
  });

  it('should handle nested scopes', () => {
    const rootNode = createMockNode('Program') as any;
    const tracker = new ScopeTracker(rootNode);

    // Enter function scope
    const funcNode = createMockNode('FunctionDeclaration') as any;
    tracker.enterScope('function', funcNode);

    // Enter block scope
    const blockNode = createMockNode('BlockStatement') as any;
    tracker.enterScope('block', blockNode);

    let currentScope = (tracker as any).currentScope;
    expect(currentScope.type).toBe('block');
    expect(currentScope.parent?.type).toBe('function');

    // Exit block
    tracker.exitScope();
    currentScope = (tracker as any).currentScope;
    expect(currentScope.type).toBe('function');

    // Exit function
    tracker.exitScope();
    currentScope = (tracker as any).currentScope;
    expect(currentScope.type).toBe('global');
  });

  it('should declare variables in current scope', () => {
    const rootNode = createMockNode('Program') as any;
    const tracker = new ScopeTracker(rootNode);

    const varNode = createMockNode('VariableDeclarator') as any;
    tracker.declareVariable('myVar', varNode, 1);

    const currentScope = (tracker as any).currentScope;
    expect(currentScope.variables.has('myVar')).toBe(true);

    const varInfo = currentScope.variables.get('myVar');
    expect(varInfo?.name).toBe('myVar');
    expect(varInfo?.declarationLine).toBe(1);
    expect(varInfo?.isParameter).toBe(false);
    expect(varInfo?.isDestructured).toBe(false);
    expect(varInfo?.isLoopVariable).toBe(false);
  });

  it('should declare variables with options', () => {
    const rootNode = createMockNode('Program') as any;
    const tracker = new ScopeTracker(rootNode);

    const paramNode = createMockNode('Identifier') as any;
    tracker.declareVariable('param', paramNode, 1, {
      isParameter: true,
      isDestructured: true,
      isLoopVariable: false,
    });

    const currentScope = (tracker as any).currentScope;
    const varInfo = currentScope.variables.get('param');

    expect(varInfo?.isParameter).toBe(true);
    expect(varInfo?.isDestructured).toBe(true);
    expect(varInfo?.isLoopVariable).toBe(false);
  });

  it('should add references to variables', () => {
    const rootNode = createMockNode('Program') as any;
    const tracker = new ScopeTracker(rootNode);

    // Declare in global scope
    const varNode = createMockNode('VariableDeclarator') as any;
    tracker.declareVariable('myVar', varNode, 1);

    // Add reference
    const refNode = createMockNode('Identifier') as any;
    tracker.addReference('myVar', refNode);

    const currentScope = (tracker as any).currentScope;
    const varInfo = currentScope.variables.get('myVar');
    expect(varInfo?.references).toHaveLength(1);
    expect(varInfo?.references[0]).toBe(refNode);
  });

  it('should find variables in parent scopes', () => {
    const rootNode = createMockNode('Program') as any;
    const tracker = new ScopeTracker(rootNode);

    // Declare in global scope
    const varNode = createMockNode('VariableDeclarator') as any;
    tracker.declareVariable('globalVar', varNode, 1);

    // Enter function scope
    const funcNode = createMockNode('FunctionDeclaration') as any;
    tracker.enterScope('function', funcNode);

    // Should find in parent
    const found = tracker.findVariable('globalVar');
    expect(found).toBeDefined();
    expect(found?.name).toBe('globalVar');
  });

  it('should not find non-existent variables', () => {
    const rootNode = createMockNode('Program') as any;
    const tracker = new ScopeTracker(rootNode);

    const found = tracker.findVariable('nonExistent');
    expect(found).toBeFalsy(); // null or undefined
  });

  it('should track all scopes in allScopes array', () => {
    const rootNode = createMockNode('Program') as any;
    const tracker = new ScopeTracker(rootNode);

    const allScopes = (tracker as any).allScopes;
    expect(allScopes).toHaveLength(1);

    const funcNode = createMockNode('FunctionDeclaration') as any;
    tracker.enterScope('function', funcNode);
    expect((tracker as any).allScopes).toHaveLength(2);

    const blockNode = createMockNode('BlockStatement') as any;
    tracker.enterScope('block', blockNode);
    expect((tracker as any).allScopes).toHaveLength(3);
  });

  it('should handle exitScope at root gracefully', () => {
    const rootNode = createMockNode('Program') as any;
    const tracker = new ScopeTracker(rootNode);

    // Should not throw when exiting root scope
    expect(() => tracker.exitScope()).not.toThrow();

    const currentScope = (tracker as any).currentScope;
    expect(currentScope.type).toBe('global');
  });

  it('should handle different scope types', () => {
    const rootNode = createMockNode('Program') as any;
    const tracker = new ScopeTracker(rootNode);

    const scopeTypes: ScopeType[] = ['function', 'block', 'loop', 'class'];

    for (const scopeType of scopeTypes) {
      const node = createMockNode(scopeType) as any;
      tracker.enterScope(scopeType, node);

      const currentScope = (tracker as any).currentScope;
      expect(currentScope.type).toBe(scopeType);

      tracker.exitScope();
    }
  });
});
