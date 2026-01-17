import type { JobStatus, MigrationPlan, FileNode } from '@atlasshift/shared';
import { RecipeEngine } from '@atlasshift/core';
import type { Recipe } from '@atlasshift/shared';

/**
 * Runs migration jobs asynchronously
 */
export class JobRunner {
  private jobs: Map<string, JobStatus> = new Map();
  private runningJobs: Set<string> = new Set();

  /**
   * Starts a new job
   */
  async startJob(
    jobId: string,
    recipe: Recipe,
    files: FileNode[],
    onProgress?: (status: JobStatus) => void,
  ): Promise<JobStatus> {
    if (this.runningJobs.has(jobId)) {
      throw new Error(`Job ${jobId} is already running`);
    }

    const status: JobStatus = {
      id: jobId,
      status: 'pending',
      progress: 0,
    };

    this.jobs.set(jobId, status);
    this.runningJobs.add(jobId);

    // Run job asynchronously
    this.runJob(jobId, recipe, files, onProgress).catch((error) => {
      const currentStatus = this.jobs.get(jobId);
      if (currentStatus) {
        currentStatus.status = 'failed';
        currentStatus.error = error instanceof Error ? error.message : String(error);
        this.jobs.set(jobId, currentStatus);
        if (onProgress) {
          onProgress(currentStatus);
        }
      }
      this.runningJobs.delete(jobId);
    });

    return status;
  }

  /**
   * Gets job status
   */
  getJobStatus(jobId: string): JobStatus | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Cancels a job
   */
  cancelJob(jobId: string): boolean {
    const status = this.jobs.get(jobId);
    if (status && status.status === 'running') {
      status.status = 'cancelled';
      this.jobs.set(jobId, status);
      this.runningJobs.delete(jobId);
      return true;
    }
    return false;
  }

  private async runJob(
    jobId: string,
    recipe: Recipe,
    files: FileNode[],
    onProgress?: (status: JobStatus) => void,
  ): Promise<void> {
    const updateStatus = (updates: Partial<JobStatus>) => {
      const current = this.jobs.get(jobId);
      if (current) {
        const updated = { ...current, ...updates };
        this.jobs.set(jobId, updated);
        if (onProgress) {
          onProgress(updated);
        }
      }
    };

    updateStatus({ status: 'running', progress: 0 });

    try {
      const engine = new RecipeEngine();

      // Validate recipe
      updateStatus({ progress: 10, currentStep: 'Validating recipe' });
      const validation = engine.validateRecipe(recipe, files);
      if (!validation.valid) {
        throw new Error(`Recipe validation failed: ${validation.errors.join(', ')}`);
      }

      // Generate plan
      updateStatus({ progress: 30, currentStep: 'Generating migration plan' });
      const plan = engine.execute(recipe, files);

      // Simulate applying transformations
      updateStatus({ progress: 50, currentStep: 'Applying transformations' });
      await this.simulateTransformations(plan, (progress) => {
        updateStatus({ progress: 50 + progress * 0.5 });
      });

      // Complete
      updateStatus({
        status: 'completed',
        progress: 100,
        currentStep: 'Completed',
        result: {
          filesChanged: files.length,
          transformationsApplied: plan.steps.length,
        },
      });
    } catch (error) {
      updateStatus({
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      this.runningJobs.delete(jobId);
    }
  }

  private async simulateTransformations(
    plan: MigrationPlan,
    onProgress: (progress: number) => void,
  ): Promise<void> {
    // Simulate transformation steps
    for (let i = 0; i < plan.steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      onProgress(((i + 1) / plan.steps.length) * 100);
    }
  }
}
