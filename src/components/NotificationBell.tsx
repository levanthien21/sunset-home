import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, X } from 'lucide-react';
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
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

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
        <>
          {/* Mobile Overlay */}
          <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsOpen(false)}></div>
          
          <div className="fixed md:absolute top-16 md:top-full left-4 right-4 md:left-auto md:right-0 md:mt-2 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 transform origin-top-right transition-all">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
              <h3 className="font-bold text-gray-900 text-base flex items-center">
                Thông báo
                {unreadCount > 0 && (
                  <span className="ml-2 text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full shadow-sm">
                    {unreadCount} mới
                  </span>
                )}
              </h3>
              <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-gray-700 bg-white rounded-full shadow-sm">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto overscroll-contain">
              {notifications.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center justify-center bg-white">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Bạn chưa có thông báo nào</p>
                  <p className="text-xs text-gray-400 mt-1">Các cập nhật về đơn đặt phòng sẽ hiển thị ở đây.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 bg-white">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 group ${!n.is_read ? 'bg-yellow-50/30' : ''}`}
                    >
                      <div className="mt-1 flex-shrink-0">
                        {!n.is_read ? (
                          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.4)]"></div>
                        ) : (
                          <Check className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm mb-1 truncate ${!n.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {n.title}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium flex items-center">
                          <Clock className="w-3 h-3 mr-1.5" />
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
               <div className="p-3 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 text-center sticky bottom-0">
                 <button 
                  onClick={() => {
                    notifications.filter(n => !n.is_read).forEach(n => markNotificationAsRead(n.id));
                    setNotifications(prev => prev.map(item => ({...item, is_read: true})));
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100 w-full"
                 >
                   ĐÁNH DẤU ĐÃ ĐỌC TẤT CẢ
                 </button>
               </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
