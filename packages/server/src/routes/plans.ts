import { Router } from 'express';
import { RecipeEngine } from '@atlasshift/core';
import { createExampleRecipe } from '@atlasshift/core';
import type { FileNode } from '@atlasshift/shared';

export const planRouter = Router();

// Generate a migration plan
planRouter.post('/', async (req, res) => {
  try {
    const { files } = req.body as { files: FileNode[] };

    if (!files || !Array.isArray(files)) {
      res.status(400).json({ error: 'Invalid request: files array required' });
      return;
    }

    const recipe = createExampleRecipe();
    const engine = new RecipeEngine();

    const validation = engine.validateRecipe(recipe, files);
    if (!validation.valid) {
      res.status(400).json({
        error: 'Recipe validation failed',
        details: validation.errors,
      });
      return;
    }

    const plan = engine.execute(recipe, files);

    res.json(plan);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});
