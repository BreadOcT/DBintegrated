import React from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCircle2, AlertTriangle, Info, Clock, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { Notification } from '../hooks/useNotifications';
import { useSettings } from '../hooks/useSettings';

interface NotificationsProps {
  notifications: Notification[];
  unreadCount?: number;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}

export function Notifications({ notifications, onMarkAsRead, onMarkAllAsRead }: NotificationsProps) {
  const { t, language } = useSettings();
  const unreadCount = notifications.filter(n => !n.read).length;

  const translateNotificationTitle = (title: string) => {
    if (language === 'en') {
      if (title.toLowerCase().includes('registrasi berhasil')) return 'Registration Successful';
      if (title.toLowerCase().includes('laporan mingguan')) return 'Weekly Report';
      if (title.toLowerCase().includes('tagihan')) return 'Bill Reminder';
      if (title.toLowerCase().includes('transaksi baru')) return 'New Transaction';
      if (title.toLowerCase().includes('profil diperbarui')) return 'Profile Updated';
      if (title.toLowerCase().includes('kata sandi diubah')) return 'Password Changed';
    }
    return title;
  };

  const translateNotificationMessage = (msg: string) => {
    if (language === 'en') {
      if (msg.toLowerCase().includes('akun anda telah berhasil terdaftar')) return 'Your account has been registered successfully.';
      if (msg.toLowerCase().includes('laporan mingguan keuangan')) return 'Your weekly financial report is ready.';
      if (msg.toLowerCase().includes('tagihan akan jatuh tempo')) return 'Your bill is due in 3 days.';
      if (msg.toLowerCase().includes('transaksi baru berhasil dicatat')) return 'A new transaction has been successfully recorded.';
      if (msg.toLowerCase().includes('profil anda berhasil diperbarui')) return 'Your profile has been successfully updated.';
      if (msg.toLowerCase().includes('kata sandi anda berhasil diubah')) return 'Your password has been successfully changed.';
    }
    return msg;
  };

  const translateNotificationTime = (time: string) => {
    if (language === 'en') {
      if (time.toLowerCase() === 'baru saja') return 'Just now';
      if (time.toLowerCase().includes('menit yang lalu')) {
        const minutes = time.match(/\d+/);
        return minutes ? `${minutes[0]}m ago` : 'm ago';
      }
      if (time.toLowerCase().includes('jam yang lalu')) {
        const hours = time.match(/\d+/);
        return hours ? `${hours[0]}h ago` : 'h ago';
      }
      if (time.toLowerCase().includes('hari yang lalu')) {
        const days = time.match(/\d+/);
        return days ? `${days[0]}d ago` : 'd ago';
      }
    }
    return time;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-text-main flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bg-card border border-sand flex items-center justify-center text-text-main shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            {t('notifications.title')}
          </h2>
          <p className="text-text-muted text-sm font-medium mt-2">
            {t('notifications.subtitle')}
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={onMarkAllAsRead}
            className="text-xs font-bold text-nature-green bg-nature-green/10 hover:bg-nature-green/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> {t('notifications.markAllRead')}
          </button>
        )}
      </div>
 
      <div className="bg-bg-base border border-sand rounded-3xl overflow-hidden shadow-sm">
        {notifications.length > 0 ? (
          <div className="divide-y divide-sand/50">
            {notifications.map((notification, index) => {
              const Icon = notification.type === 'success' ? CheckCircle2 :
                           notification.type === 'warning' ? AlertTriangle : Info;
                           
              return (
                <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.05 }}
                   key={notification.id}
                   onClick={() => onMarkAsRead(notification.id)}
                   className={cn(
                     "p-5 md:p-6 transition-all cursor-pointer relative group",
                     notification.read 
                       ? "hover:bg-sand/20" 
                       : "bg-clay/5 hover:bg-clay/10"
                   )}
                >
                  <div className="flex gap-4 items-start">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                      notification.type === 'success' ? "bg-green-500/10 text-green-500" :
                      notification.type === 'warning' ? "bg-orange-500/10 text-orange-500" :
                      "bg-blue-500/10 text-blue-500"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className={cn(
                          "font-bold text-sm md:text-base pr-4",
                          notification.read ? "text-text-main" : "text-clay"
                        )}>
                          {translateNotificationTitle(notification.title)}
                        </h4>
                        {!notification.read && (
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></div>
                        )}
                      </div>
                      <p className="text-text-muted text-sm leading-relaxed mb-3">
                        {translateNotificationMessage(notification.message)}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted/70 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {translateNotificationTime(notification.time)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-bg-card border border-sand flex items-center justify-center text-text-muted mb-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-text-main mb-1">{t('notifications.empty')}</h3>
            <p className="text-text-muted text-sm">{t('notifications.emptyDesc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
