import { client } from '../api/client';

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replaceAll('-', '+').replaceAll('_', '/');
  const rawData = globalThis.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.codePointAt(i) || 0;
  return outputArray;
};

export const adminPushService = {
  getVapidPublicKey: async (): Promise<{ publicKey: string }> => {
    return client.get('/admin/push/vapid-public-key');
  },

  ensureSubscribed: async (): Promise<{ ok: boolean; reason?: string }> => {
    if (!('serviceWorker' in navigator)) return { ok: false, reason: 'Service workers are not supported in this browser.' };
    if (!('PushManager' in globalThis)) return { ok: false, reason: 'Push messaging is not supported in this browser.' };

    if (Notification.permission === 'denied') {
      return { ok: false, reason: 'Notifications are blocked in browser settings.' };
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return { ok: false, reason: 'Notification permission was not granted.' };
    }

    const reg = await navigator.serviceWorker.ready;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const { publicKey } = await adminPushService.getVapidPublicKey();
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
    }

    await client.post('/admin/push/subscribe', { subscription: sub, userAgent: navigator.userAgent });
    return { ok: true };
  }
};
