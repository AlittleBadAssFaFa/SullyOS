/**
 * Deployment-specific settings for AlittleBadAssFaFa/SullyOS.
 *
 * Keep personal service endpoints here so upstream updates rarely touch them.
 * Secrets must never be added to this file.
 */
export const PERSONAL_PROXY_WORKER = 'https://sully-backend.badfafa.workers.dev';
export const PERSONAL_INSTANT_PUSH_WORKER = 'https://sully-instant-push.alittlebadassfafa.deno.net';
export const PERSONAL_PROACTIVE_PUSH_WORKER = 'https://sully-proactive-push.badfafa.workers.dev';
export const PERSONAL_FORK_REPOSITORY = 'AlittleBadAssFaFa/SullyOS';
