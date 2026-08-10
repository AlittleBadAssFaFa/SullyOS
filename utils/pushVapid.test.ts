import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PERSONAL_VAPID_PUBLIC_KEY, PERSONAL_VAPID_VERSION } from '../config/personalFork';

describe('personal VAPID defaults', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('uses the personal public key on a fresh device', async () => {
    const { loadPushVapid } = await import('./pushVapid');
    expect(loadPushVapid()).toMatchObject({
      vapidPublicKey: PERSONAL_VAPID_PUBLIC_KEY,
      vapidPrivateKey: '',
    });
  });

  it('migrates an old pair once without overriding later manual changes', async () => {
    localStorage.setItem('push_vapid_v1', JSON.stringify({
      vapidPublicKey: 'old-public-key',
      vapidPrivateKey: 'old-private-key',
    }));

    const { loadPushVapid } = await import('./pushVapid');
    expect(loadPushVapid()).toMatchObject({
      vapidPublicKey: PERSONAL_VAPID_PUBLIC_KEY,
      vapidPrivateKey: '',
    });
    expect(localStorage.getItem('personal_vapid_default_version')).toBe(PERSONAL_VAPID_VERSION);

    localStorage.setItem('push_vapid_v1', JSON.stringify({
      vapidPublicKey: 'manual-public-key',
      vapidPrivateKey: 'manual-private-key',
    }));
    expect(loadPushVapid()).toMatchObject({
      vapidPublicKey: 'manual-public-key',
      vapidPrivateKey: 'manual-private-key',
    });
  });
});
