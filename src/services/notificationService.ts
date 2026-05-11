import { supabase } from '../lib/supabase';

export interface KitchenCallPayload {
    tableNames: string[];
    orderId: string;
    readyItems?: string[];
    targetStaffIds?: string[];
    stationIds?: string[];
    timestamp?: string;
}

export interface KitchenDismissPayload {
    orderId?: string;
    readyItems?: string[];
    timestamp?: string;
}

const normalizeTableName = (value: string) =>
    value
        .toLowerCase()
        .replace(/^bàn\s+/i, '')
        .replace(/\s+/g, '')
        .trim();

const resolveTargetStaffForTables = async (tableNames: string[]) => {
    const normalizedTargets = new Set(tableNames.map(normalizeTableName));

    const { data: stations, error } = await supabase
        .from('stations')
        .select('id, tables, staff_ids');

    if (error || !stations) {
        console.error('Error resolving station staff for kitchen call:', error);
        return { targetStaffIds: [] as string[], stationIds: [] as string[] };
    }

    const targetStaffIds = new Set<string>();
    const stationIds = new Set<string>();

    stations.forEach((station: any) => {
        const stationTables = Array.isArray(station.tables) ? station.tables : [];
        const hasTargetTable = stationTables.some((table: string) =>
            normalizedTargets.has(normalizeTableName(table))
        );

        if (!hasTargetTable) return;

        stationIds.add(station.id);
        const staffIds = Array.isArray(station.staff_ids) ? station.staff_ids : [];
        staffIds.forEach((staffId: string) => targetStaffIds.add(staffId));
    });

    return {
        targetStaffIds: Array.from(targetStaffIds),
        stationIds: Array.from(stationIds),
    };
};

// Singleton AudioContext — reused across all sound calls to avoid
// browser rate-limiting and Autoplay Policy blocks.
let _audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
    if (!_audioCtx) {
        _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return _audioCtx;
};

// Resume AudioContext if suspended (Autoplay Policy).
// Must be called during a user gesture (click/tap) at least once.
const ensureAudioResumed = async () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        try {
            await ctx.resume();
        } catch (e) {
            console.warn('AudioContext resume failed:', e);
        }
    }
};

// Warm-up: resume AudioContext on the very first user interaction.
// This guarantees that subsequent programmatic plays work even without
// a direct user gesture (e.g. when a broadcast arrives).
const warmupOnce = () => {
    ensureAudioResumed();
    document.removeEventListener('click', warmupOnce, true);
    document.removeEventListener('touchstart', warmupOnce, true);
    document.removeEventListener('keydown', warmupOnce, true);
};
document.addEventListener('click', warmupOnce, true);
document.addEventListener('touchstart', warmupOnce, true);
document.addEventListener('keydown', warmupOnce, true);

// Helper to create and play a sound using Web Audio API
const createSound = async (type: 'newBooking' | 'callServer' | 'callServer2' | 'callServer3') => {
    try {
        const audioCtx = getAudioContext();

        // Always attempt resume — no-op if already running
        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }

        // If still suspended after resume attempt, bail out silently
        if (audioCtx.state !== 'running') {
            console.warn('AudioContext still suspended – sound skipped. User interaction required.');
            return;
        }

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'newBooking') {
            // 3 quick high-pitched beeps - LOUDEST (Square wave + High gain)
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(880, now); // A5

            gainNode.gain.setValueAtTime(0, now);

            // Beep 1
            gainNode.gain.linearRampToValueAtTime(4, now + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

            // Beep 2
            gainNode.gain.linearRampToValueAtTime(4, now + 0.3);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

            // Beep 3
            gainNode.gain.linearRampToValueAtTime(4, now + 0.55);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

            oscillator.start(now);
            oscillator.stop(now + 0.8);

            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200, 100, 200]);
            }
        } else if (type === 'callServer') {
            // Attention grabbing double chime (Din-Dong) - LOUDEST
            oscillator.type = 'square';

            // First note (higher)
            oscillator.frequency.setValueAtTime(987.77, now); // B5
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(4, now + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

            // Second note (lower)
            oscillator.frequency.setValueAtTime(783.99, now + 0.5); // G5
            gainNode.gain.linearRampToValueAtTime(4, now + 0.55);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

            oscillator.start(now);
            oscillator.stop(now + 1.5);

            if (navigator.vibrate) {
                navigator.vibrate([500, 200, 500]);
            }
        } else if (type === 'callServer2') {
            // Classic bell - LOUDEST
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(1046.50, now); // C6
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(4, now + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

            oscillator.start(now);
            oscillator.stop(now + 1.6);

            if (navigator.vibrate) {
                navigator.vibrate([1000]);
            }
        } else if (type === 'callServer3') {
            // Urgent ringing - LOUDEST
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800, now);
            gainNode.gain.setValueAtTime(0, now);

            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200, 100, 200, 100, 200]);
            }

            for (let i = 0; i < 5; i++) {
                const time = now + (i * 0.2);
                gainNode.gain.linearRampToValueAtTime(4, time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
            }

            oscillator.start(now);
            oscillator.stop(now + 1.1);
        }
    } catch (e) {
        console.error('AudioContext not supported or blocked', e);
    }
};

class NotificationService {
    private channel = supabase.channel('kitchen-notifications');
    private isSubscribed = false;

    // Setup broadcast subscription
    subscribeToKitchenCalls(
        onCall: (payload: KitchenCallPayload) => void,
        onDismiss?: (payload?: KitchenDismissPayload) => void
    ) {
        if (!this.isSubscribed) {
            this.channel
                .on(
                    'broadcast',
                    { event: 'call-server' },
                    (payload) => {
                        console.log('Received kitchen call:', payload);
                        onCall(payload.payload as any);
                    }
                )
                .on(
                    'broadcast',
                    { event: 'dismiss-alert' },
                    (payload) => {
                        console.log('Alert dismissed by another device', payload);
                        if (onDismiss) onDismiss(payload.payload as KitchenDismissPayload);
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        this.isSubscribed = true;
                        console.log('Subscribed to kitchen notifications');
                    }
                });
        }

        return () => {
            // Don't fully unsubscribe if multiple components might use it, 
            // but for this simple app, we can just leave it active or handle cleanup if needed.
        };
    }

    // Send a broadcast from kitchen to servers
    async broadcastCallServer(tableNames: string[], orderId: string, readyItems?: string[]) {
        if (!this.isSubscribed) {
            // Need to subscribe first to broadcast
            await new Promise<void>((resolve) => {
                this.channel.subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        this.isSubscribed = true;
                        resolve();
                    }
                })
            });
        }

        const routing = await resolveTargetStaffForTables(tableNames);

        return this.channel.send({
            type: 'broadcast',
            event: 'call-server',
            payload: {
                tableNames,
                orderId,
                readyItems,
                targetStaffIds: routing.targetStaffIds,
                stationIds: routing.stationIds,
                timestamp: new Date().toISOString()
            },
        });
    }

    // Broadcast dismiss alert to all devices.
    // Nếu truyền orderId/readyItems, thiết bị phục vụ chỉ tắt đúng cảnh báo liên quan.
    async broadcastDismissAlert(payload: KitchenDismissPayload = {}) {
        if (!this.isSubscribed) return;
        return this.channel.send({
            type: 'broadcast',
            event: 'dismiss-alert',
            payload: {
                ...payload,
                timestamp: new Date().toISOString()
            },
        });
    }

    // Play sound for new bookings
    playNewBookingSound() {
        createSound('newBooking');
    }

    // Play sound when kitchen calls
    playCallServerSound(soundType: '1' | '2' | '3' = '1') {
        if (soundType === '1') createSound('callServer');
        else if (soundType === '2') createSound('callServer2');
        else createSound('callServer3');
    }

    // Request browser notification permission
    async requestNotificationPermission() {
        if (!('Notification' in window)) return false;

        if (Notification.permission === 'granted') return true;

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    // Show a standard browser notification
    showBrowserNotification(title: string, options?: NotificationOptions) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;

        new Notification(title, {
            icon: '/vite.svg', // Fallback icon
            ...options
        });
    }
}

export const notificationService = new NotificationService();
