import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  read: boolean;
}

export function useNotifications() {
  const { user } = useAuth();
  
  // Calculate storage key based on user email or ID to keep notifications isolated per account
  const storageKey = user ? `app_notifications_${user.id}` : 'app_notifications_guest';

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load user-specific notifications when user changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      // If there is an active logged-in user and no saved notifications, show the welcome/greet notification
      if (user) {
        const welcomeNotif: Notification = {
          id: Date.now(),
          title: 'Registrasi Berhasil',
          message: `Selamat datang ${user.name}! Akun Anda telah berhasil dibuat. Mulailah mengelola anggaran Anda dengan bijak hari ini.`,
          time: 'Baru saja',
          type: 'success',
          read: false,
        };
        setNotifications([welcomeNotif]);
        localStorage.setItem(storageKey, JSON.stringify([welcomeNotif]));
      } else {
        setNotifications([]);
      }
    }
  }, [user, storageKey]);

  // Save notifications to localStorage when state updates
  useEffect(() => {
    if (notifications.length > 0 || localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    }
  }, [notifications, storageKey]);

  const addNotification = (notif: Omit<Notification, 'id' | 'read' | 'time'>) => {
    const newNotification: Notification = {
      ...notif,
      id: Date.now(),
      time: 'Baru saja',
      read: false,
    };
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Limit list size to 50 items for optimal performance
      if (updated.length > 50) {
        return updated.slice(0, 50);
      }
      return updated;
    });
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    unreadCount,
  };
}
