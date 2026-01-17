#!/usr/bin/env node

import { Command } from 'commander';
import { readFile, readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import type { FileNode } from '@atlasshift/shared';
import { RecipeEngine, createExampleRecipe } from '@atlasshift/core';

const program = new Command();

program
  .name('atlisshift')
  .description('Architecture-level code migrations with automatic invariant mining')
  .version('0.1.0');

program
  .command('plan')
  .description('Generate a migration plan for a directory')
  .argument('<directory>', 'Directory to analyze')
  .option('-r, --recipe <recipe>', 'Recipe to use', 'example')
  .action(async (directory: string, options: { recipe: string }) => {
    try {
      const files = await loadFiles(directory);
      console.log(`Loaded ${files.length} files`);

      const recipe = getRecipe(options.recipe);
      const engine = new RecipeEngine();

      const validation = engine.validateRecipe(recipe, files);
      if (!validation.valid) {
        console.error('Recipe validation failed:');
        for (const error of validation.errors) {
          console.error(`  - ${error}`);
        }
        process.exit(1);
      }

      const plan = engine.execute(recipe, files);
      console.log(`\nGenerated migration plan: ${plan.id}`);
      console.log(`Steps: ${plan.steps.length}`);
      console.log(`Invariants: ${plan.invariants.length}\n`);

      for (const step of plan.steps) {
        console.log(`  ${step.id}: ${step.transformation.name} (risk: ${step.estimatedRisk})`);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('apply')
  .description('Apply a migration plan')
  .argument('<plan-id>', 'Plan ID to apply')
  .option('--dry-run', 'Show what would be changed without applying', false)
  .action(async (planId: string, options: { dryRun: boolean }) => {
    console.log(`Applying plan: ${planId}`);
    if (options.dryRun) {
      console.log('(dry run mode - no changes will be made)');
    }
    // Implementation would load plan and apply transformations
    console.log('Apply command not yet fully implemented');
  });

program.parse();

async function loadFiles(directory: string): Promise<FileNode[]> {
  const files: FileNode[] = [];
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        // Skip node_modules and other common directories
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry)) {
          await walk(fullPath);
        }
      } else if (stats.isFile()) {
        const ext = extname(entry);
        if (extensions.includes(ext)) {
          const content = await readFile(fullPath, 'utf-8');
          files.push({
            path: fullPath,
            content,
            language: ext === '.ts' || ext === '.tsx' ? 'typescript' : 'javascript',
          });
        }
      }
    }
  }

  await walk(directory);
  return files;
}

function getRecipe(name: string) {
  if (name === 'example') {
    return createExampleRecipe();
  }
  throw new Error(`Unknown recipe: ${name}`);
}
