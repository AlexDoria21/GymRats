// Local notifications for the rest timer. Best-effort: shown via the service
// worker when one is active (allows display while the page is backgrounded),
// with a plain Notification fallback. On platforms that support Notification
// Triggers (Chrome/Android) we also schedule the alert at an absolute time so
// it fires even with the screen locked; elsewhere it shows when JS runs again.

const ICON = '/pwa-192x192.png';
const BADGE = '/maskable-512x512.png';
const TAG = 'rest-timer';
const SESSION_TAG = 'day-session';

interface RestNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  renotify?: boolean;
  showTrigger?: unknown;
}

export function canNotify(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  return canNotify() ? Notification.permission : 'unsupported';
}

export async function requestNotifications(): Promise<boolean> {
  if (!canNotify()) return false;
  try {
    const res = await Notification.requestPermission();
    return res === 'granted';
  } catch {
    return false;
  }
}

/** Active service worker registration, or null (e.g. in dev where there is no SW). */
async function activeReg(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    return reg && reg.active ? reg : null;
  } catch {
    return null;
  }
}

/** Show the notification right now (when the timer reaches zero with JS running). */
export async function notify(title: string, body: string): Promise<void> {
  if (!canNotify() || Notification.permission !== 'granted') return;
  const options: RestNotificationOptions = {
    body,
    icon: ICON,
    badge: BADGE,
    vibrate: [200, 100, 200],
    tag: TAG,
    renotify: true,
  };
  try {
    const reg = await activeReg();
    if (reg) await reg.showNotification(title, options);
    else new Notification(title, options);
  } catch {
    /* notifications unavailable */
  }
}

/** Schedule the alert at an absolute time via Notification Triggers, where supported. */
export async function scheduleNotification(
  title: string,
  body: string,
  atMs: number
): Promise<void> {
  if (!canNotify() || Notification.permission !== 'granted') return;
  if (!('TimestampTrigger' in window)) return;
  const reg = await activeReg();
  if (!reg) return;
  try {
    const Trigger = (window as unknown as { TimestampTrigger: new (t: number) => unknown })
      .TimestampTrigger;
    const options: RestNotificationOptions = {
      body,
      icon: ICON,
      badge: BADGE,
      tag: TAG,
      showTrigger: new Trigger(atMs),
    };
    await reg.showNotification(title, options);
  } catch {
    /* triggers unsupported */
  }
}

/** Cancel any pending/shown notification with the given tag. */
async function cancelByTag(tag: string): Promise<void> {
  const reg = await activeReg();
  if (!reg) return;
  try {
    const filter = { tag, includeTriggered: false } as unknown as GetNotificationOptions;
    const list = await reg.getNotifications(filter);
    for (const n of list) n.close();
  } catch {
    /* ignore */
  }
}

/** Cancel any pending/shown rest-timer notification (on pause/reset/close). */
export function cancelScheduled(): Promise<void> {
  return cancelByTag(TAG);
}

/**
 * Schedule the "you forgot to finish your routine" reminder at an absolute time
 * (best-effort, via Notification Triggers where supported).
 */
export async function scheduleSessionReminder(atMs: number, body: string): Promise<void> {
  if (!canNotify() || Notification.permission !== 'granted') return;
  if (!('TimestampTrigger' in window)) return;
  const reg = await activeReg();
  if (!reg) return;
  try {
    const Trigger = (window as unknown as { TimestampTrigger: new (t: number) => unknown })
      .TimestampTrigger;
    const options: RestNotificationOptions = {
      body,
      icon: ICON,
      badge: BADGE,
      tag: SESSION_TAG,
      showTrigger: new Trigger(atMs),
    };
    await reg.showNotification('¿Rutina terminada?', options);
  } catch {
    /* triggers unsupported */
  }
}

/** Cancel the pending day-session reminder (on finish/cancel). */
export function cancelSessionReminder(): Promise<void> {
  return cancelByTag(SESSION_TAG);
}
