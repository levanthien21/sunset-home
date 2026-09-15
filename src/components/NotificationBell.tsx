import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getNotifications, markNotificationAsRead } from '../utils/db';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const role = localStorage.getItem('auth_role') || 'customer';
    
    const fetchNotifs = async () => {
      const data = await getNotifications(user.id, role);
      setNotifications(data);
    };

    fetchNotifs();
    // Poll every 10 seconds since realtime requires dashboard setup
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = async (n: any) => {
    if (!n.is_read) {
      await markNotificationAsRead(n.id);
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item));
    }
    if (n.link) {
      setIsOpen(false);
      navigate(n.link);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-yellow-600 transition-colors rounded-full hover:bg-gray-100/50"
      >
        <Bell className="w-5 h-5 md:w-6 md:h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 md:w-2.5 md:h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-sm md:text-base">Thông báo</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] md:text-xs font-bold text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-100">
                {unreadCount} mới
              </span>
            )}
          </div>
          
          <div className="max-h-[60vh] md:max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <Bell className="w-8 h-8 text-gray-200 mb-3" />
                <p className="text-sm text-gray-500 font-medium">Chưa có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!n.is_read ? 'bg-yellow-50/20' : ''}`}
                  >
                    <div className="mt-1 flex-shrink-0">
                      {!n.is_read ? (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
                      ) : (
                        <Check className="w-3.5 h-3.5 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-xs md:text-sm mb-1 ${!n.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                        {n.title}
                      </h4>
                      <p className="text-[11px] md:text-xs text-gray-500 mb-2 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[9px] md:text-[10px] text-gray-400 font-medium uppercase tracking-wider flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(n.created_at).toLocaleString('vi-VN', { 
                          hour: '2-digit', minute: '2-digit', 
                          day: '2-digit', month: '2-digit', year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {notifications.length > 0 && (
             <div className="p-3 bg-gray-50/50 border-t border-gray-100 text-center">
               <button 
                onClick={() => {
                  notifications.filter(n => !n.is_read).forEach(n => markNotificationAsRead(n.id));
                  setNotifications(prev => prev.map(item => ({...item, is_read: true})));
                }}
                className="text-[11px] font-bold text-gray-500 hover:text-gray-900 uppercase tracking-widest transition-colors"
               >
                 Đánh dấu đã đọc tất cả
               </button>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
