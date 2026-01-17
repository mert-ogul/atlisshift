/**
 * Core types for AtlasShift
 */

export interface FileNode {
  path: string;
  content: string;
  language?: string;
}

export interface GraphNode {
  id: string;
  type: 'file' | 'function' | 'class' | 'module' | 'variable';
  name: string;
  filePath: string;
  startLine: number;
  endLine: number;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: 'imports' | 'calls' | 'references' | 'extends' | 'implements';
  metadata?: Record<string, unknown>;
}

export interface CodeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Invariant {
  id: string;
  type: 'structural' | 'semantic' | 'dependency';
  description: string;
  check: (graph: CodeGraph) => boolean;
  severity: 'error' | 'warning';
}

export interface Transformation {
  id: string;
  name: string;
  description: string;
  apply: (graph: CodeGraph) => CodeGraph;
}

export interface PlanStep {
  id: string;
  transformation: Transformation;
  dependencies: string[];
  estimatedRisk: 'low' | 'medium' | 'high';
}

export interface MigrationPlan {
  id: string;
  steps: PlanStep[];
  invariants: Invariant[];
  createdAt: Date;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  version: string;
  plan: (graph: CodeGraph) => MigrationPlan;
}

export interface JobStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep?: string;
  error?: string;
  result?: {
    filesChanged: number;
    transformationsApplied: number;
  };
}
