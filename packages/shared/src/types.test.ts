import { describe, it, expect } from 'vitest';
import { FileNodeSchema, CodeGraphSchema } from './schemas.js';

describe('Schemas', () => {
  it('should validate FileNode', () => {
    const valid: unknown = {
      path: 'src/index.ts',
      content: 'export const x = 1;',
      language: 'typescript',
    };
    expect(() => FileNodeSchema.parse(valid)).not.toThrow();
  });

  it('should validate CodeGraph', () => {
    const valid: unknown = {
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
    expect(() => CodeGraphSchema.parse(valid)).not.toThrow();
  });
});
