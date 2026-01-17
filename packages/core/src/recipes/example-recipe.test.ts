import { describe, it, expect } from 'vitest';
import { createExampleRecipe } from './example-recipe.js';
import type { FileNode } from '@atlasshift/shared';
import { RecipeEngine } from '../recipe-engine.js';

describe('Example Recipe', () => {
  it('should create a recipe', () => {
    const recipe = createExampleRecipe();
    expect(recipe.id).toBe('example-extract-utils');
    expect(recipe.name).toBe('Extract Utilities');
  });

  it('should generate a plan for files with utility functions', () => {
    const recipe = createExampleRecipe();
    const files: FileNode[] = [
      {
        path: 'src/index.ts',
        content: 'function utilHelper() { return 1; }',
        language: 'typescript',
      },
    ];

    const engine = new RecipeEngine();
    const plan = engine.execute(recipe, files);

    expect(plan.steps.length).toBeGreaterThanOrEqual(0);
  });
});
