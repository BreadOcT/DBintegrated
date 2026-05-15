import React from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCircle2, AlertTriangle, Info, Clock, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export function Notifications() {
  const [notifications, setNotifications] = React.useState([
    {
      id: 1,
      title: 'Scan Struk Berhasil',
      message: 'Transaksi "Belanja Bulanan" sebesar Rp 850.000 telah ditambahkan dengan kecerdasan buatan.',
      time: '10 menit yang lalu',
      type: 'success',
      read: false,
    },
    {
      id: 2,
      title: 'Pengeluaran Kategori Makan',
      message: 'Anda sudah menghabiskan 80% dari anggaran makan minggu ini.',
      time: '2 jam yang lalu',
      type: 'warning',
      read: false,
    },
    {
      id: 3,
      title: 'Pembaruan Fitur',
      message: 'Sistem deteksi nota kami sekarang mengenali font dari berbagai struk digital.',
      time: '1 hari yang lalu',
      type: 'info',
      read: true,
    },
    {
      id: 4,
      title: 'Laporan Bulan Lalu Siap',
      message: 'Laporan ringkasan pengeluaran bulan lalu sudah bisa Anda unduh.',
      time: '3 hari yang lalu',
      type: 'info',
      read: true,
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-text-main flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bg-card border border-sand flex items-center justify-center text-text-main shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            Notifikasi
          </h2>
          <p className="text-text-muted text-sm font-medium mt-2">
            Pembaruan terbaru dan peringatan tentang aktivitas Anda.
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-xs font-bold text-nature-green bg-nature-green/10 hover:bg-nature-green/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Tandai Semua Dibaca
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
                  onClick={() => markAsRead(notification.id)}
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
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></div>
                        )}
                      </div>
                      <p className="text-text-muted text-sm leading-relaxed mb-3">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted/70 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {notification.time}
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
            <h3 className="text-lg font-bold text-text-main mb-1">Tidak ada notifikasi</h3>
            <p className="text-text-muted text-sm">Anda sudah membaca semua pemberitahuan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
