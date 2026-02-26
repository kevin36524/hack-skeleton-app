/**
 * In-process coordination maps for streaming workflows.
 *
 * These Maps are keyed by a per-request streamId (UUID) and are only populated
 * for the duration of an active SSE stream. They hold no user credentials —
 * only callbacks, AbortControllers, and booleans.
 *
 * CloudRun note: these Maps are in-memory per instance. The SSE POST request
 * and the workflow steps that call back into these Maps always run on the same
 * instance (same process, same request). The DELETE /cancel endpoint, however,
 * may land on a different CloudRun instance and will return 404 in that case.
 * If reliable cross-instance cancellation is required, replace these Maps with
 * an external store (e.g. Redis pub/sub).
 */
export const profileStreamCallbacks = new Map<string, (token: string) => void>();
export const workflowAbortControllers = new Map<string, AbortController>();
export const workflowKillSwitches = new Map<string, boolean>();

/**
 * Kill a running workflow by its streamId.
 * Returns true if a workflow was found and killed, false otherwise.
 */
export function killWorkflow(streamId: string): boolean {
  const controller = workflowAbortControllers.get(streamId);
  if (controller) {
    controller.abort();
    workflowKillSwitches.set(streamId, true);
    workflowAbortControllers.delete(streamId);
    profileStreamCallbacks.delete(streamId);
    return true;
  }
  workflowKillSwitches.set(streamId, true);
  return false;
}

/**
 * Check if a workflow has been killed.
 */
export function isWorkflowKilled(streamId: string): boolean {
  return workflowKillSwitches.get(streamId) === true;
}

/**
 * Cleanup all tracking for a workflow.
 */
export function cleanupWorkflow(streamId: string): void {
  workflowAbortControllers.delete(streamId);
  workflowKillSwitches.delete(streamId);
  profileStreamCallbacks.delete(streamId);
}
