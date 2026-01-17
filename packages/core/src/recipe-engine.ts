import type {
  CodeGraph,
  Recipe,
  MigrationPlan,
  FileNode,
} from '@atlasshift/shared';
import { GraphBuilder } from './graph-builder.js';
import { Planner } from './planner.js';

/**
 * Executes recipes to generate migration plans
 */
export class RecipeEngine {
  private graphBuilder: GraphBuilder;
  private planner: Planner;

  constructor() {
    this.graphBuilder = new GraphBuilder();
    this.planner = new Planner();
  }

  /**
   * Executes a recipe on a set of files
   */
  execute(recipe: Recipe, files: FileNode[]): MigrationPlan {
    // Build graph from files
    const graph = this.graphBuilder.build(files);

    // Get transformations from recipe
    const plan = recipe.plan(graph);

    return plan;
  }

  /**
   * Validates that a recipe can be safely applied
   */
  validateRecipe(recipe: Recipe, files: FileNode[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    try {
      const graph = this.graphBuilder.build(files);
      const plan = recipe.plan(graph);

      // Validate plan has steps
      if (plan.steps.length === 0) {
        errors.push('Recipe produced no transformation steps');
      }

      // Validate invariants
      if (plan.invariants.length === 0) {
        errors.push('Recipe produced no invariants');
      }
    } catch (error) {
      errors.push(
        `Recipe execution failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
