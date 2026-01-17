import type { CodeGraph, Transformation } from '@atlasshift/shared';

/**
 * Common transformations
 */

/**
 * Creates a transformation that renames a node
 */
export function createRenameTransformation(
  nodeId: string,
  newName: string,
): Transformation {
  return {
    id: `rename-${nodeId}-${Date.now()}`,
    name: `Rename ${nodeId}`,
    description: `Renames node ${nodeId} to ${newName}`,
    apply: (graph: CodeGraph) => {
      const newNodes = graph.nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, name: newName };
        }
        return node;
      });

      return {
        ...graph,
        nodes: newNodes,
      };
    },
  };
}

/**
 * Creates a transformation that moves a node to a new file
 */
export function createMoveTransformation(
  nodeId: string,
  newFilePath: string,
): Transformation {
  return {
    id: `move-${nodeId}-${Date.now()}`,
    name: `Move ${nodeId}`,
    description: `Moves node ${nodeId} to ${newFilePath}`,
    apply: (graph: CodeGraph) => {
      const newNodes = graph.nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, filePath: newFilePath };
        }
        return node;
      });

      // Update edges that reference this node
      const newEdges = graph.edges.map((edge) => {
        if (edge.from === nodeId || edge.to === nodeId) {
          // Update edge metadata to reflect move
          return {
            ...edge,
            metadata: {
              ...edge.metadata,
              moved: true,
            },
          };
        }
        return edge;
      });

      return {
        nodes: newNodes,
        edges: newEdges,
      };
    },
  };
}

/**
 * Creates a transformation that extracts code into a new module
 */
export function createExtractModuleTransformation(
  nodeIds: string[],
  newModulePath: string,
  newModuleName: string,
): Transformation {
  return {
    id: `extract-module-${Date.now()}`,
    name: `Extract Module ${newModuleName}`,
    description: `Extracts nodes into new module ${newModulePath}`,
    apply: (graph: CodeGraph) => {
      // Create new module node
      const moduleNodeId = `file:${newModulePath}`;
      const moduleNode = {
        id: moduleNodeId,
        type: 'file' as const,
        name: newModuleName,
        filePath: newModulePath,
        startLine: 1,
        endLine: 1,
        metadata: {},
      };

      // Move selected nodes to new module
      const newNodes = graph.nodes
        .map((node) => {
          if (nodeIds.includes(node.id)) {
            return { ...node, filePath: newModulePath };
          }
          return node;
        })
        .concat([moduleNode]);

      // Update edges
      const newEdges = graph.edges.map((edge) => {
        if (nodeIds.includes(edge.from) || nodeIds.includes(edge.to)) {
          return {
            ...edge,
            metadata: {
              ...edge.metadata,
              extracted: true,
            },
          };
        }
        return edge;
      });

      return {
        nodes: newNodes,
        edges: newEdges,
      };
    },
  };
}
