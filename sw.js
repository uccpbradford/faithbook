// The service worker. It shows the notifications Bedrock sends, and opens the
// right page when one is clicked. Bedrock sends JSON: { title, body, url, tag }.
// A newer message with the same tag (the booking id) replaces the older one.

self.addEventListener('activate', (event) => {
  // Take over open tabs straight away, so a click can reuse one of them.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const message = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(message.title || 'FaithBook', {
      body: message.body,
      tag: message.tag,
      data: { url: message.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data.url, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((tabs) => {
      const tab = tabs.find((t) => t.url.startsWith(self.location.origin));
      if (!tab) return self.clients.openWindow(url);
      return tab.focus().then(() => tab.navigate(url));
    }),
  );
});
