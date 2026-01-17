import type { Recipe, CodeGraph, MigrationPlan, Transformation } from '@atlasshift/shared';
import { createExtractModuleTransformation } from '../transformations.js';

/**
 * Example recipe that demonstrates architecture-level transformation
 * This recipe extracts utility functions into a separate module
 */
export function createExampleRecipe(): Recipe {
  return {
    id: 'example-extract-utils',
    name: 'Extract Utilities',
    description: 'Extracts utility functions into a separate utils module',
    version: '1.0.0',
    plan: (graph: CodeGraph): MigrationPlan => {
      // Find utility functions (simplified heuristic: functions with "util" or "helper" in name)
      const utilityFunctions = graph.nodes.filter(
        (node) =>
          node.type === 'function' &&
          (node.name.toLowerCase().includes('util') ||
            node.name.toLowerCase().includes('helper')),
      );

      const transformations: Transformation[] = [];

      if (utilityFunctions.length > 0) {
        const functionIds = utilityFunctions.map((f) => f.id);
        const extractTransformation = createExtractModuleTransformation(
          functionIds,
          'src/utils.ts',
          'utils',
        );
        transformations.push(extractTransformation);
      }

      // Create a simple planner to generate the plan
      // In a real implementation, this would use the Planner class
      const steps = transformations.map((transformation, index) => ({
        id: `step-${index + 1}`,
        transformation,
        dependencies: index > 0 ? [`step-${index}`] : [],
        estimatedRisk: 'low' as const,
      }));

      return {
        id: `plan-${Date.now()}`,
        steps,
        invariants: [], // Would be populated by planner
        createdAt: new Date(),
      };
    },
  };
}
