import { describe, it, expect } from 'vitest';
import { GraphBuilder } from './graph-builder.js';
import type { FileNode } from '@atlasshift/shared';

describe('GraphBuilder', () => {
  it('should build a graph from file nodes', () => {
    const builder = new GraphBuilder();
    const files: FileNode[] = [
      {
        path: 'src/index.ts',
        content: 'export const x = 1;',
        language: 'typescript',
      },
    ];

    const graph = builder.build(files);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].type).toBe('file');
    expect(graph.nodes[0].filePath).toBe('src/index.ts');
  });

  it('should extract imports', () => {
    const builder = new GraphBuilder();
    const files: FileNode[] = [
      {
        path: 'src/index.ts',
        content: "import { foo } from './utils';",
        language: 'typescript',
      },
      {
        path: 'src/utils.ts',
        content: 'export const foo = 1;',
        language: 'typescript',
      },
    ];

    const graph = builder.build(files);

    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges.length).toBeGreaterThan(0);
    const importEdge = graph.edges.find((e) => e.type === 'imports');
    expect(importEdge).toBeDefined();
  });

  it('should extract functions', () => {
    const builder = new GraphBuilder();
    const files: FileNode[] = [
      {
        path: 'src/index.ts',
        content: 'function test() {\n  return 1;\n}',
        language: 'typescript',
      },
    ];

    const graph = builder.build(files);

    const functionNodes = graph.nodes.filter((n) => n.type === 'function');
    expect(functionNodes.length).toBeGreaterThan(0);
    expect(functionNodes[0].name).toBe('test');
  });
});
