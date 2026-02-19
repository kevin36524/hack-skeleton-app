/**
 * Global map bridging workflow step token emissions to the SSE API route.
 * Keyed by streamId; value is called for each streamed text token.
 * Both the workflow step and the API route run in the same Next.js server
 * process, so a module-level Map is a safe coordination mechanism.
 */
export const profileStreamCallbacks = new Map<string, (token: string) => void>();
