self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    try {
      payload = { body: event.data ? event.data.text() : '' };
    } catch {
      payload = {};
    }
  }

  const title = payload.title || 'Nexus PC World';
  const body = payload.body || 'You have a new notification.';
  const url = payload.url || '/';

  const options = {
    body,
    data: { url }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        try {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin) {
            await client.focus();
            if ('navigate' in client) {
              await client.navigate(url);
            }
            return;
          }
        } catch {
          // ignore
        }
      }
      await self.clients.openWindow(url);
    })()
  );
});
