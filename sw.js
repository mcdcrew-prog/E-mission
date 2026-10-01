/* McEquipment — service worker
   Reçoit les notifications push envoyées par Supabase (fonction "notify"),
   même quand l'application est fermée, et met à jour le badge de l'icône. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (e) { data = { title: "McEquipment", body: event.data ? event.data.text() : "" }; }
  event.waitUntil((async () => {
    // Badge (nombre) sur l'icône de l'application installée
    if (typeof data.badge === "number" && "setAppBadge" in self.navigator) {
      try { data.badge > 0 ? await self.navigator.setAppBadge(data.badge) : await self.navigator.clearAppBadge(); } catch (e) {}
    }
    await self.registration.showNotification(data.title || "McEquipment", {
      body: data.body || "",
      icon: "icon-192.png",
      badge: "badge-72.png",          // petite icône monochrome (barre d'état Android)
      tag: data.tag || "mcequipment",  // une seule notification par type de compte, mise à jour
      renotify: true,
      data: { url: data.url || "./" },
    });
  })());
});

// Toucher la notification : ouvre (ou ramène au premier plan) l'application
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || "./", self.registration.scope).href;
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const w of wins) { if ("focus" in w) { await w.focus(); return; } }
    if (self.clients.openWindow) await self.clients.openWindow(url);
  })());
});
