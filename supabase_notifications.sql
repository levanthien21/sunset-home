-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_role TEXT, -- 'admin', 'staff', or null (if user_id is used)
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    link TEXT, -- optional link to click
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications or role-based ones" 
ON public.notifications FOR SELECT 
USING (
  user_id = auth.uid() OR 
  (target_role = 'admin' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role LIKE '%admin%')) OR
  (target_role = 'staff' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role LIKE '%staff%'))
);

CREATE POLICY "Anyone can insert notifications (for booking flow)" 
ON public.notifications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (
  user_id = auth.uid() OR 
  (target_role = 'admin' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role LIKE '%admin%')) OR
  (target_role = 'staff' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role LIKE '%staff%'))
);

-- Enable realtime
alter publication supabase_realtime add table notifications;
