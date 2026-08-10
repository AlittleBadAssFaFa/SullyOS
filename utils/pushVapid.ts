/**
 * Shared VAPID credentials store.
 *
 * Both Instant Push (utils/instantPushClient.ts) and Proactive Push
 * (utils/proactivePushConfig.ts) read VAPID from here so they don't fight
 * over the single per-origin pushManager.subscription — same VAPID → no
 * unsubscribe-and-rebuild churn.
 *
 * Private key is intentionally persisted too: the user has to paste it
 * into their Cloudflare Worker env, and re-displaying it later is much
 * easier than regenerating + re-deploying. localStorage already holds
 * API keys / client tokens, one more secret of comparable sensitivity
 * does not change the threat model.
 *
 * The personal deployment may provide only its public VAPID key as a safe
 * default. The matching private key remains a Cloudflare Worker secret and
 * is never bundled into the public site.
 */

import { PERSONAL_VAPID_PUBLIC_KEY, PERSONAL_VAPID_VERSION } from '../config/personalFork';

const PUSH_VAPID_KEY = 'push_vapid_v1';
const LEGACY_INSTANT_KEY = 'instant_push_config_v1';
const PERSONAL_VAPID_MIGRATION_KEY = 'personal_vapid_default_version';

export interface PushVapid {
  vapidPublicKey: string;
  vapidPrivateKey: string;
  vapidEmail?: string;
  updatedAt?: number;
}

const EMPTY: PushVapid = {
  vapidPublicKey: PERSONAL_VAPID_PUBLIC_KEY,
  vapidPrivateKey: '',
};

let migrated = false;

// One-shot migration: the previous Instant Push config stored vapidPublicKey
// inline. Copy it across on first read so existing users don't lose their
// subscription. Private key was never persisted before — user has to
// re-enter / regenerate to round-trip it back.
function migrateFromInstantConfigIfNeeded(): void {
  if (migrated) return;
  migrated = true;
  if (typeof localStorage === 'undefined') return;
  try {
    if (localStorage.getItem(PUSH_VAPID_KEY)) return;
    const legacy = localStorage.getItem(LEGACY_INSTANT_KEY);
    if (!legacy) return;
    const parsed = JSON.parse(legacy) as { vapidPublicKey?: string };
    const pub = (parsed?.vapidPublicKey || '').trim();
    if (!pub) return;
    const next: PushVapid = {
      vapidPublicKey: pub,
      vapidPrivateKey: '',
      updatedAt: Date.now(),
    };
    localStorage.setItem(PUSH_VAPID_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

function applyPersonalVapidDefaultIfNeeded(): void {
  if (typeof localStorage === 'undefined' || !PERSONAL_VAPID_PUBLIC_KEY) return;
  try {
    if (localStorage.getItem(PERSONAL_VAPID_MIGRATION_KEY) === PERSONAL_VAPID_VERSION) return;

    const raw = localStorage.getItem(PUSH_VAPID_KEY);
    const current = raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<PushVapid>) } : { ...EMPTY };
    if (current.vapidPublicKey !== PERSONAL_VAPID_PUBLIC_KEY) {
      localStorage.setItem(PUSH_VAPID_KEY, JSON.stringify({
        vapidPublicKey: PERSONAL_VAPID_PUBLIC_KEY,
        vapidPrivateKey: '',
        updatedAt: Date.now(),
      } satisfies PushVapid));
    }
    localStorage.setItem(PERSONAL_VAPID_MIGRATION_KEY, PERSONAL_VAPID_VERSION);
  } catch { /* ignore */ }
}

export function loadPushVapid(): PushVapid {
  if (typeof localStorage === 'undefined') return { ...EMPTY };
  try {
    migrateFromInstantConfigIfNeeded();
    applyPersonalVapidDefaultIfNeeded();
    const raw = localStorage.getItem(PUSH_VAPID_KEY);
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as Partial<PushVapid>) };
  } catch { /* ignore */ }
  return { ...EMPTY };
}

export function savePushVapid(v: PushVapid): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const next: PushVapid = {
      vapidPublicKey: v.vapidPublicKey.trim(),
      vapidPrivateKey: v.vapidPrivateKey.trim(),
      vapidEmail: v.vapidEmail?.trim() || undefined,
      updatedAt: Date.now(),
    };
    localStorage.setItem(PUSH_VAPID_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

export function clearPushVapid(): void {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.removeItem(PUSH_VAPID_KEY); } catch { /* ignore */ }
}

export function isPushVapidReady(v?: PushVapid): boolean {
  const x = v ?? loadPushVapid();
  // VAPID public keys are 65 raw bytes → 87 base64url chars. >60 is a loose
  // sanity check that catches "empty", "BAKnuY" partial paste, etc.
  return x.vapidPublicKey.length > 60;
}
