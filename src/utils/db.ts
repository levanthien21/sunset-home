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

export const getRooms = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('branch_id', { ascending: true })
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Lỗi lấy dữ liệu phòng Supabase:", e);
      return [];
    }
  }
  return [];
};

export const uploadRoomImage = async (file: File) => {
  if (!supabase) return null;
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('room-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('room-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (e) {
    console.error("Lỗi upload ảnh:", e);
    return null;
  }
};

export const updateRoomImages = async (roomId: string, images: string[]) => {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('rooms')
      .update({ images })
      .match({ id: roomId });
      
    if (error) throw error;
  } catch (e) {
    console.error("Lỗi cập nhật ảnh phòng:", e);
  }
};

export const getBranches = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('id', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Lỗi lấy dữ liệu chi nhánh:", e);
      return [];
    }
  }
  return [];
};

export const updateBranch = async (branchId: number, updateData: any) => {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('branches')
      .update(updateData)
      .match({ id: branchId });
      
    if (error) throw error;
  } catch (e) {
    console.error("Lỗi cập nhật chi nhánh:", e);
  }
};

export const addBranch = async (branchData: any) => {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('branches')
      .insert([branchData]);
      
    if (error) throw error;
  } catch (e) {
    console.error("Lỗi thêm chi nhánh mới:", e);
  }
};
