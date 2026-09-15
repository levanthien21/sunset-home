import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Khởi tạo Supabase client (chỉ khởi tạo nếu có key để tránh lỗi khi chưa cấu hình)
export const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

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
  // B? sung start_time v� end_time cho Database m?i
  try {
    if (booking.checkIn && booking.checkOut) {
      const safeCheckInStr = booking.checkIn.replace(" ", "T");
      const start = new Date(safeCheckInStr);
      if (!isNaN(start.getTime())) {
        booking.start_time = start.toISOString();
        const extraMatch = booking.checkOut.match(/\(\+(\d+)h\)/);
        const extra = extraMatch ? parseInt(extraMatch[1]) : 0;
        let end = new Date(start.getTime());
        const hourMatch = booking.checkOut.match(/(\d+)\s*(h|gi[oờ])/i);
        if (hourMatch) {
          end = new Date(start.getTime() + (parseInt(hourMatch[1]) + extra) * 3600000);
        } else if (booking.checkOut.toLowerCase().includes("m") && booking.checkOut.toLowerCase().includes("m") && (booking.checkOut.includes("đêm") || booking.checkOut.includes("dem") || booking.checkOut.includes("m"))) {
          end.setDate(end.getDate() + 1);
          end.setHours(10, 0, 0, 0);
          end = new Date(end.getTime() + extra * 3600000);
        } else if (booking.checkOut.toLowerCase().includes("ng") && (booking.checkOut.includes("ngày") || booking.checkOut.includes("ngay"))) {
          end.setDate(end.getDate() + 1);
          end.setHours(12, 0, 0, 0);
          end = new Date(end.getTime() + extra * 3600000);
        } else {
          end = new Date(start.getTime() + (1 + extra) * 3600000);
        }
        booking.end_time = end.toISOString();
      }
    }
  } catch(e) {
    console.error("L?i t�nh to�n start_time/end_time:", e);
  }

  if (supabase) {
    try {
      const { error } = await supabase
        .from('bookings')
        .insert([booking]);
        
      if (error) {
        console.error("Lỗi Supabase chi tiết:", error);
        throw error;
      }
    } catch (e) {
      console.error("Lỗi lưu dữ liệu Supabase:", e);
      throw e; // Bắt buộc throw để UI chặn lại, không cho redirect sang PayOS nếu DB lỗi
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
    throw e;
  }
};

export const deleteBranch = async (branchId: number) => {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('branches').delete().match({ id: branchId });
    if (error) throw error;
  } catch (e) {
    console.error("Lỗi xóa chi nhánh:", e);
    throw e;
  }
};

export const addRoom = async (roomData: any) => {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('rooms').insert([roomData]);
    if (error) throw error;
  } catch (e) {
    console.error("Lỗi thêm phòng mới:", e);
    throw e;
  }
};

export const updateRoom = async (roomId: string, updateData: any) => {
  if (supabase) {
    const { data, error } = await supabase.from('rooms').update(updateData).eq('id', roomId).select();
    if (error) throw error;
    return data;
  }
};

export const deleteRoom = async (roomId: string) => {
  if (supabase) {
    const { error } = await supabase.from('rooms').delete().eq('id', roomId);
    if (error) throw error;
    return true;
  }
};

export const updateUserRole = async (userId: string, newRole: string) => {
  if (supabase) {
    const { data, error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId).select();
    if (error) throw error;
    return data;
  }
};

export const updateBookingAddons = async (bookingId: string, addons: any[], newTotal: number) => {
  if (supabase) {
    const { data, error } = await supabase.from('bookings').update({ addons: addons, total: newTotal }).eq('id', bookingId).select();
    if (error) throw error;
    return data;
  }
};


export const checkAvailabilityWithRPC = async (roomName: string, startTime: string, endTime: string) => {
  if (!supabase) return true;
  try {
    const { data, error } = await supabase.rpc("check_room_availability", {
      p_room_name: roomName,
      p_start_time: startTime,
      p_end_time: endTime
    });
    if (error) {
       console.error("RPC Error:", error);
       return true; // fallback to true if error
    }
    return data;
  } catch(e) {
    return true;
  }
};
export const getBookingHolds = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("booking_holds")
        .select("*")
        .gt("expires_at", new Date().toISOString());
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Error holds:", e);
      return [];
    }
  }
  return [];
};

export const getNotifications = async (userId: string, role: string) => {
  if (!supabase) return [];
  try {
    const roles = role.split(',');
    
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    // Filter by user_id OR target_role
    // Supabase JS doesn't support complex OR easily in one go with arrays, so we use an OR string
    let orQuery = `user_id.eq.${userId}`;
    roles.forEach(r => {
      if (r === 'admin' || r === 'staff') {
        orQuery += `,target_role.eq.${r}`;
      }
    });

    query = query.or(orQuery);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error("Error fetching notifications:", e);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .match({ id: notificationId });
    if (error) throw error;
  } catch (e) {
    console.error("Error marking notification read:", e);
  }
};

export const createNotification = async ({ userId, targetRole, title, message, link }: { userId?: string, targetRole?: string, title: string, message: string, link?: string }) => {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId || null,
        target_role: targetRole || null,
        title,
        message,
        link,
        is_read: false
      }]);
    if (error) throw error;
  } catch (e) {
    console.error("Error creating notification:", e);
  }
};
