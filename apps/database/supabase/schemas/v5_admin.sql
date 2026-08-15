ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

CREATE TABLE IF NOT EXISTS public.system_events (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY insert_system_events ON public.system_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- We omit the SELECT policy because admin reads will use the Service Role Key.
