import { Router } from 'express';
import { randomUUID } from 'crypto';
import { JobRunner } from '../job-runner.js';
import type { JobStatus, FileNode } from '@atlasshift/shared';
import { createExampleRecipe } from '@atlasshift/core';

export const jobRunner = new JobRunner();
export const jobRouter = Router();

// Get job status
jobRouter.get('/:jobId', (req, res) => {
  const { jobId } = req.params;
  const status = jobRunner.getJobStatus(jobId);

  if (!status) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.json(status);
});

// Create and start a new job
jobRouter.post('/', async (req, res) => {
  try {
    const { files } = req.body as { files: FileNode[] };

    if (!files || !Array.isArray(files)) {
      res.status(400).json({ error: 'Invalid request: files array required' });
      return;
    }

    const jobId = randomUUID();
    const recipe = createExampleRecipe();

    // Start job (non-blocking)
    const status = await jobRunner.startJob(jobId, recipe, files);

    res.status(201).json(status);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Cancel a job
jobRouter.post('/:jobId/cancel', (req, res) => {
  const { jobId } = req.params;
  const cancelled = jobRunner.cancelJob(jobId);

  if (!cancelled) {
    res.status(404).json({ error: 'Job not found or not running' });
    return;
  }

  res.json({ message: 'Job cancelled', jobId });
});
