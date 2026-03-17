import { supabase } from '../lib/supabase';

// Helper to create and play a sound using Web Audio API
const createSound = (type: 'newBooking' | 'callServer' | 'callServer2' | 'callServer3') => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'newBooking') {
            // 3 quick high-pitched beeps
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, now); // A5

            gainNode.gain.setValueAtTime(0, now);

            // Beep 1
            gainNode.gain.linearRampToValueAtTime(1, now + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

            // Beep 2
            gainNode.gain.linearRampToValueAtTime(1, now + 0.3);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

            // Beep 3
            gainNode.gain.linearRampToValueAtTime(1, now + 0.55);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

            oscillator.start(now);
            oscillator.stop(now + 0.8);

        } else if (type === 'callServer') {
            // Attention grabbing double chime (Din-Dong)
            oscillator.type = 'triangle';

            // First note (higher)
            oscillator.frequency.setValueAtTime(987.77, now); // B5
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(1, now + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

            // Second note (lower)
            oscillator.frequency.setValueAtTime(783.99, now + 0.5); // G5
            gainNode.gain.linearRampToValueAtTime(1, now + 0.55);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

            oscillator.start(now);
            oscillator.stop(now + 1.5);
        } else if (type === 'callServer2') {
            // Classic bell
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1046.50, now); // C6
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(1, now + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

            oscillator.start(now);
            oscillator.stop(now + 1.6);
        } else if (type === 'callServer3') {
            // Urgent ringing
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800, now);
            gainNode.gain.setValueAtTime(0, now);

            for (let i = 0; i < 5; i++) {
                const time = now + (i * 0.2);
                gainNode.gain.linearRampToValueAtTime(0.8, time);
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
    subscribeToKitchenCalls(callback: (payload: { tableNames: string[], orderId: string }) => void) {
        if (!this.isSubscribed) {
            this.channel
                .on(
                    'broadcast',
                    { event: 'call-server' },
                    (payload) => {
                        console.log('Received kitchen call:', payload);
                        callback(payload.payload as any);
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
    async broadcastCallServer(tableNames: string[], orderId: string) {
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

        return this.channel.send({
            type: 'broadcast',
            event: 'call-server',
            payload: { tableNames, orderId, timestamp: new Date().toISOString() },
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
