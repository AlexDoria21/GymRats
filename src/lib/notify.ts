// Notifications for the rest timer and the day-session reminder.
//
// Two backends:
//  - Native (Capacitor APK): @capacitor/local-notifications — fires real Android
//    notifications scheduled at an absolute time, even with the screen locked or
//    the app closed. This is the reliable path on the phone.
//  - Web (browser/PWA): the Web Notification API, shown via the service worker,
//    and scheduled with Notification Triggers where supported (Chrome/Android).

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const ICON = '/pwa-192x192.png';
const BADGE = '/maskable-512x512.png';
const TAG = 'rest-timer';
const SESSION_TAG = 'day-session';
const REST_ID = 1001;
const SESSION_ID = 1002;

const native = Capacitor.isNativePlatform();

export type PermState = 'granted' | 'denied' | 'prompt' | 'unsupported';

interface RestNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  renotify?: boolean;
  showTrigger?: unknown;
}

export function canNotify(): boolean {
  if (native) return true;
  return typeof window !== 'undefined' && 'Notification' in window;
}

/** Current permission state (async — the native plugin checks asynchronously). */
export async function getPermission(): Promise<PermState> {
  if (native) {
    try {
      const r = await LocalNotifications.checkPermissions();
      return (r.display as PermState) ?? 'prompt';
    } catch {
      return 'unsupported';
    }
  }
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  const p = Notification.permission;
  return p === 'default' ? 'prompt' : p;
}

export async function requestNotifications(): Promise<boolean> {
  if (native) {
    try {
      const r = await LocalNotifications.requestPermissions();
      return r.display === 'granted';
    } catch {
      return false;
    }
  }
  if (!canNotify()) return false;
  try {
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

/** Ask once if the user hasn't decided yet (call inside a user gesture). */
export async function ensureNotifyPermission(): Promise<void> {
  if (!canNotify()) return;
  if ((await getPermission()) === 'prompt') await requestNotifications();
}

// --- native (Capacitor) helpers ---
async function nativeSchedule(id: number, title: string, body: string, atMs?: number) {
  try {
    if ((await LocalNotifications.checkPermissions()).display !== 'granted') return;
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          schedule: atMs ? { at: new Date(atMs), allowWhileIdle: true } : undefined,
        },
      ],
    });
  } catch {
    /* ignore */
  }
}
async function nativeCancel(id: number) {
  try {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  } catch {
    /* ignore */
  }
}
/** Post a notification immediately (no schedule.at → fires now). */
async function nativeNotifyNow(id: number, title: string, body: string) {
  try {
    if ((await LocalNotifications.checkPermissions()).display !== 'granted') return;
    await LocalNotifications.schedule({ notifications: [{ id, title, body }] });
  } catch {
    /* ignore */
  }
}

// --- web (service worker) helpers ---
/** Active service worker registration, or null (e.g. in dev where there is no SW). */
async function activeReg(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    return reg && reg.active ? reg : null;
  } catch {
    return null;
  }
}

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

/** Show the notification right now. */
export async function notify(title: string, body: string): Promise<void> {
  if (native) {
    // The JS countdown reaches zero ~half a second before the pre-scheduled OS
    // alarm would, and the timer then cancels that alarm — so when the app is in
    // the foreground we must post the notification ourselves, right now.
    await nativeNotifyNow(REST_ID, title, body);
    return;
  }
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

/** Schedule the rest-finished alert at an absolute time. */
export async function scheduleNotification(
  title: string,
  body: string,
  atMs: number
): Promise<void> {
  if (native) {
    await nativeSchedule(REST_ID, title, body, atMs);
    return;
  }
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

/** Cancel any pending/shown rest-timer notification (on pause/reset/close). */
export function cancelScheduled(): Promise<void> {
  if (native) return nativeCancel(REST_ID);
  return cancelByTag(TAG);
}

/** Schedule the "you forgot to finish your routine" reminder at an absolute time. */
export async function scheduleSessionReminder(atMs: number, body: string): Promise<void> {
  if (native) {
    await nativeSchedule(SESSION_ID, '¿Rutina terminada?', body, atMs);
    return;
  }
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
  if (native) return nativeCancel(SESSION_ID);
  return cancelByTag(SESSION_TAG);
}
