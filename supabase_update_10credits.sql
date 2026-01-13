-- Update the trigger function to give 10 credits
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, credits)
  values (new.id, 10) -- UPDATED: 10 Credits
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Optional: Update existing users who are still at 5 to 10 (as a gift)
update public.profiles 
set credits = 10 
where credits = 5;
