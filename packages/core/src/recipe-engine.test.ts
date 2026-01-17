import { describe, it, expect } from 'vitest';
import { RecipeEngine } from './recipe-engine.js';
import { createExampleRecipe } from './recipes/example-recipe.js';
import type { FileNode } from '@atlasshift/shared';

describe('RecipeEngine', () => {
  it('should execute a recipe', () => {
    const engine = new RecipeEngine();
    const recipe = createExampleRecipe();
    const files: FileNode[] = [
      {
        path: 'src/index.ts',
        content: 'export const x = 1;',
        language: 'typescript',
      },
    ];

    const plan = engine.execute(recipe, files);

    expect(plan.id).toBeDefined();
    expect(plan.steps).toBeDefined();
    expect(plan.invariants).toBeDefined();
  });

  it('should validate a recipe', () => {
    const engine = new RecipeEngine();
    const recipe = createExampleRecipe();
    const files: FileNode[] = [
      {
        path: 'src/index.ts',
        content: 'export const x = 1;',
        language: 'typescript',
      },
    ];

    const validation = engine.validateRecipe(recipe, files);

    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});
