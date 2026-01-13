-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text
);

-- Create api_keys table
create table public.api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  key_hash text not null,
  usage_count bigint default 0,
  name text, -- Optional friendly name
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.api_keys enable row level security;

-- RLS Policies
create policy "Users can view own keys" 
  on public.api_keys for select 
  using (auth.uid() = user_id);

create policy "Users can insert own keys" 
  on public.api_keys for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete own keys" 
  on public.api_keys for delete 
  using (auth.uid() = user_id);

-- Function to increment usage count (callable by admin/service role or via RPC if needed)
-- Actually, we'll handle increments in the Next.js API route using the Service Role.
