import type { CodeGraph, Invariant } from '@atlasshift/shared';

/**
 * Mines invariants from a code graph
 */
export class InvariantMiner {
  /**
   * Discovers invariants in the code graph
   */
  mine(graph: CodeGraph): Invariant[] {
    const invariants: Invariant[] = [];

    // Structural invariants
    invariants.push(...this.mineStructuralInvariants(graph));

    // Dependency invariants
    invariants.push(...this.mineDependencyInvariants(graph));

    // Semantic invariants
    invariants.push(...this.mineSemanticInvariants(graph));

    return invariants;
  }

  private mineStructuralInvariants(graph: CodeGraph): Invariant[] {
    const invariants: Invariant[] = [];

    // Every file node should exist
    invariants.push({
      id: 'inv-file-exists',
      type: 'structural',
      description: 'All file nodes must have valid paths',
      check: (g) => {
        const fileNodes = g.nodes.filter((n) => n.type === 'file');
        return fileNodes.every((n) => n.filePath.length > 0);
      },
      severity: 'error',
    });

    // No orphaned nodes (nodes without edges)
    invariants.push({
      id: 'inv-no-orphans',
      type: 'structural',
      description: 'No orphaned nodes (all nodes should be connected)',
      check: (g) => {
        const nodeIds = new Set(g.nodes.map((n) => n.id));
        const connectedNodeIds = new Set<string>();
        for (const edge of g.edges) {
          connectedNodeIds.add(edge.from);
          connectedNodeIds.add(edge.to);
        }
        // Allow some orphaned nodes (e.g., entry points)
        const orphanedCount = Array.from(nodeIds).filter(
          (id) => !connectedNodeIds.has(id),
        ).length;
        return orphanedCount < nodeIds.size * 0.1; // Less than 10% orphaned
      },
      severity: 'warning',
    });

    return invariants;
  }

  private mineDependencyInvariants(graph: CodeGraph): Invariant[] {
    const invariants: Invariant[] = [];

    // No circular dependencies
    invariants.push({
      id: 'inv-no-circular',
      type: 'dependency',
      description: 'No circular import dependencies',
      check: (g) => {
        return !this.hasCircularDependencies(g);
      },
      severity: 'error',
    });

    // Import targets must exist
    invariants.push({
      id: 'inv-imports-exist',
      type: 'dependency',
      description: 'All import targets must exist in the graph',
      check: (g) => {
        const nodeIds = new Set(g.nodes.map((n) => n.id));
        for (const edge of g.edges) {
          if (edge.type === 'imports' && !nodeIds.has(edge.to)) {
            return false;
          }
        }
        return true;
      },
      severity: 'error',
    });

    return invariants;
  }

  private mineSemanticInvariants(graph: CodeGraph): Invariant[] {
    const invariants: Invariant[] = [];

    // Functions should be called
    invariants.push({
      id: 'inv-functions-used',
      type: 'semantic',
      description: 'Functions should have call edges',
      check: (g) => {
        const functionNodes = g.nodes.filter((n) => n.type === 'function');
        if (functionNodes.length === 0) {
          return true;
        }
        const calledFunctions = new Set(
          g.edges
            .filter((e) => e.type === 'calls')
            .map((e) => e.to),
        );
        // Allow some uncalled functions (e.g., exports, entry points)
        const uncalledCount = functionNodes.filter(
          (n) => !calledFunctions.has(n.id),
        ).length;
        return uncalledCount < functionNodes.length * 0.3; // Less than 30% uncalled
      },
      severity: 'warning',
    });

    return invariants;
  }

  private hasCircularDependencies(graph: CodeGraph): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const nodeIds = new Set(graph.nodes.map((n) => n.id));
    const adjacencyList = new Map<string, string[]>();

    // Build adjacency list for import edges only
    for (const edge of graph.edges) {
      if (edge.type === 'imports') {
        if (!adjacencyList.has(edge.from)) {
          adjacencyList.set(edge.from, []);
        }
        adjacencyList.get(edge.from)?.push(edge.to);
      }
    }

    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        return true;
      }
      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = adjacencyList.get(nodeId) ?? [];
      for (const neighbor of neighbors) {
        if (hasCycle(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of nodeIds) {
      if (!visited.has(nodeId)) {
        if (hasCycle(nodeId)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Validates that a graph satisfies all invariants
   */
  validate(graph: CodeGraph, invariants: Invariant[]): {
    valid: boolean;
    violations: Array<{ invariant: Invariant; message: string }>;
  } {
    const violations: Array<{ invariant: Invariant; message: string }> = [];

    for (const invariant of invariants) {
      if (!invariant.check(graph)) {
        violations.push({
          invariant,
          message: `Invariant ${invariant.id} violated: ${invariant.description}`,
        });
      }
    }

    const hasErrors = violations.some(
      (v) => v.invariant.severity === 'error',
    );

    return {
      valid: !hasErrors,
      violations,
    };
  }
}
