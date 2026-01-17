import { describe, it, expect } from 'vitest';
import { InvariantMiner } from './invariant-miner.js';
import type { CodeGraph } from '@atlasshift/shared';

describe('InvariantMiner', () => {
  it('should mine invariants from a graph', () => {
    const miner = new InvariantMiner();
    const graph: CodeGraph = {
      nodes: [
        {
          id: '1',
          type: 'file',
          name: 'index.ts',
          filePath: 'src/index.ts',
          startLine: 1,
          endLine: 10,
        },
      ],
      edges: [],
    };

    const invariants = miner.mine(graph);

    expect(invariants.length).toBeGreaterThan(0);
  });

  it('should detect circular dependencies', () => {
    const miner = new InvariantMiner();
    const graph: CodeGraph = {
      nodes: [
        { id: '1', type: 'file', name: 'a.ts', filePath: 'a.ts', startLine: 1, endLine: 1 },
        { id: '2', type: 'file', name: 'b.ts', filePath: 'b.ts', startLine: 1, endLine: 1 },
      ],
      edges: [
        { from: '1', to: '2', type: 'imports' },
        { from: '2', to: '1', type: 'imports' },
      ],
    };

    const hasCircular = miner['hasCircularDependencies'](graph);
    expect(hasCircular).toBe(true);
  });

  it('should validate invariants', () => {
    const miner = new InvariantMiner();
    const graph: CodeGraph = {
      nodes: [
        {
          id: '1',
          type: 'file',
          name: 'index.ts',
          filePath: 'src/index.ts',
          startLine: 1,
          endLine: 10,
        },
      ],
      edges: [],
    };

    const invariants = miner.mine(graph);
    const result = miner.validate(graph, invariants);

    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });
});
