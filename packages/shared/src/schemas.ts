import { z } from 'zod';

/**
 * Zod schemas for runtime validation
 */

export const FileNodeSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
  language: z.string().optional(),
});

export const GraphNodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['file', 'function', 'class', 'module', 'variable']),
  name: z.string().min(1),
  filePath: z.string().min(1),
  startLine: z.number().int().positive(),
  endLine: z.number().int().positive(),
  metadata: z.record(z.unknown()).optional(),
});

export const GraphEdgeSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  type: z.enum(['imports', 'calls', 'references', 'extends', 'implements']),
  metadata: z.record(z.unknown()).optional(),
});

export const CodeGraphSchema = z.object({
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
});

export const JobStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  progress: z.number().min(0).max(100),
  currentStep: z.string().optional(),
  error: z.string().optional(),
  result: z
    .object({
      filesChanged: z.number().int().nonnegative(),
      transformationsApplied: z.number().int().nonnegative(),
    })
    .optional(),
});

export const RecipeConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  version: z.string().min(1),
});
