/**
 * Global map bridging workflow step token emissions to the SSE API route.
 * Keyed by streamId; value is called for each streamed text token.
 * Both the workflow step and the API route run in the same Next.js server
 * process, so a module-level Map is a safe coordination mechanism.
 */
export const profileStreamCallbacks = new Map<string, (token: string) => void>();

/**
 * Global map for abort controllers to allow killing running workflows.
 * Keyed by streamId; value is AbortController that can be used to cancel the workflow.
 */
export const workflowAbortControllers = new Map<string, AbortController>();

/**
 * Global map to track if a workflow has been killed.
 * Keyed by streamId; value is boolean indicating if the workflow should stop.
 */
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
