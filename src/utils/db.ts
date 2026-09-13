import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Khởi tạo Supabase client (chỉ khởi tạo nếu có key để tránh lỗi khi chưa cấu hình)
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export const getBookings = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Lỗi lấy dữ liệu Supabase:", e);
      return [];
    }
  }
  return JSON.parse(localStorage.getItem('sunset_bookings') || '[]');
};

export const addBooking = async (booking: any) => {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('bookings')
        .insert([booking]);
        
      if (error) throw error;
    } catch (e) {
      console.error("Lỗi lưu dữ liệu Supabase:", e);
    }
  } else {
    const existing = JSON.parse(localStorage.getItem('sunset_bookings') || '[]');
    localStorage.setItem('sunset_bookings', JSON.stringify([booking, ...existing]));
  }
};

export const updateBookingStatus = async (bookingId: string, status: string) => {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .match({ id: bookingId });
        
      if (error) throw error;
    } catch (e) {
      console.error("Lỗi cập nhật dữ liệu Supabase:", e);
    }
  } else {
    const existing = JSON.parse(localStorage.getItem('sunset_bookings') || '[]');
    const updated = existing.map((b: any) => (b.id === bookingId || b.bookingId === bookingId ? { ...b, status } : b));
    localStorage.setItem('sunset_bookings', JSON.stringify(updated));
  }
};
