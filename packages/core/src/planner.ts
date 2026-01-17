import type {
  CodeGraph,
  MigrationPlan,
  PlanStep,
  Transformation,
  Invariant,
} from '@atlasshift/shared';
import { InvariantMiner } from './invariant-miner.js';

/**
 * Plans a migration by creating a sequence of transformations
 */
export class Planner {
  private invariantMiner: InvariantMiner;

  constructor() {
    this.invariantMiner = new InvariantMiner();
  }

  /**
   * Creates a migration plan from a graph and available transformations
   */
  plan(
    graph: CodeGraph,
    transformations: Transformation[],
  ): MigrationPlan {
    // Mine invariants first
    const invariants = this.invariantMiner.mine(graph);

    // Create plan steps
    const steps: PlanStep[] = this.createPlanSteps(
      graph,
      transformations,
      invariants,
    );

    return {
      id: this.generatePlanId(),
      steps,
      invariants,
      createdAt: new Date(),
    };
  }

  private createPlanSteps(
    graph: CodeGraph,
    transformations: Transformation[],
    invariants: Invariant[],
  ): PlanStep[] {
    const steps: PlanStep[] = [];
    const appliedTransformations = new Set<string>();
    let currentGraph = graph;

    for (const transformation of transformations) {
      // Check if transformation would violate invariants
      const testGraph = transformation.apply(currentGraph);
      const validation = this.invariantMiner.validate(testGraph, invariants);

      if (!validation.valid) {
        // Skip transformations that violate error-level invariants
        const hasErrors = validation.violations.some(
          (v) => v.invariant.severity === 'error',
        );
        if (hasErrors) {
          continue;
        }
      }

      // Estimate risk
      const risk = this.estimateRisk(transformation, currentGraph, invariants);

      // Determine dependencies (simplified - would analyze actual dependencies)
      const dependencies = this.getDependencies(
        transformation.id,
        steps,
      );

      steps.push({
        id: `step-${steps.length + 1}`,
        transformation,
        dependencies,
        estimatedRisk: risk,
      });

      appliedTransformations.add(transformation.id);
      currentGraph = testGraph;
    }

    return steps;
  }

  private estimateRisk(
    transformation: Transformation,
    graph: CodeGraph,
    invariants: Invariant[],
  ): 'low' | 'medium' | 'high' {
    // Apply transformation to test
    const testGraph = transformation.apply(graph);
    const validation = this.invariantMiner.validate(testGraph, invariants);

    if (validation.violations.length === 0) {
      return 'low';
    }

    const errorCount = validation.violations.filter(
      (v) => v.invariant.severity === 'error',
    ).length;

    if (errorCount > 0) {
      return 'high';
    }

    return 'medium';
  }

  private getDependencies(
    transformationId: string,
    existingSteps: PlanStep[],
  ): string[] {
    // Simplified dependency calculation
    // In a real implementation, this would analyze transformation dependencies
    if (existingSteps.length === 0) {
      return [];
    }

    // Return last step as dependency (simplified)
    return [existingSteps[existingSteps.length - 1].id];
  }

  private generatePlanId(): string {
    return `plan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
