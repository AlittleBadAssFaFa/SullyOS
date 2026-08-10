/**
 * Deployment-specific settings for AlittleBadAssFaFa/SullyOS.
 *
 * Keep personal service endpoints here so upstream updates rarely touch them.
 * Secrets must never be added to this file.
 */
export const PERSONAL_PROXY_WORKER = 'https://sully-backend.badfafa.workers.dev';
export const PERSONAL_INSTANT_PUSH_WORKER = 'https://sully-instant-push.alittlebadassfafa.deno.net';
export const PERSONAL_AMSG2_WORKER = 'https://sully-amsg.badfafa.top';
export const PERSONAL_VAPID_PUBLIC_KEY = 'BJsaFV4DT08w_6nn3a9YHPP_kBTBoHDT6FAAEwLDSHwrsZKh86Ohn_TmLg9szXUTQV5z_MXs_1yB3UIyKP42gAU';
export const PERSONAL_VAPID_VERSION = '2026-08-10-amsg2';
export const PERSONAL_FORK_REPOSITORY = 'AlittleBadAssFaFa/SullyOS';
