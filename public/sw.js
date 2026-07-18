// This event listener is fired when the service worker receives a push message.
self.addEventListener('push', function (event) {
  console.log('[Service Worker] Push Received.');

  // The event.data is the payload sent from your server.
  if (event.data) {
    const data = event.data.json();
    const title = data.title || 'New Notification';
    const options = {
      body: data.body || 'You have a new update.',
      icon: data.icon || '/icon-192x192.png', // A default icon for your app
      badge: '/badge-72x72.png', // A small badge icon
    };

    // This displays the notification to the user.
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

// This event listener is fired when a user clicks on the notification.
self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  // This opens the app to a specific URL when the notification is clicked.
  // IMPORTANT: Replace 'https://your-app-domain.com' with your actual website URL.
  event.waitUntil(clients.openWindow('https://your-app-domain.com/dashboard'));
});