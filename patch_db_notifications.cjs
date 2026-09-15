const fs = require('fs');

let content = fs.readFileSync('c:/Users/ASUS/Desktop/Sunset home/src/utils/db.ts', 'utf8');

const newFunctions = `
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
    let orQuery = \`user_id.eq.\${userId}\`;
    roles.forEach(r => {
      if (r === 'admin' || r === 'staff') {
        orQuery += \`,target_role.eq.\${r}\`;
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
`;

if (!content.includes('getNotifications')) {
  content += newFunctions;
  fs.writeFileSync('c:/Users/ASUS/Desktop/Sunset home/src/utils/db.ts', content);
  console.log('db.ts updated');
} else {
  console.log('db.ts already updated');
}
