ALTER TABLE public.account_book
  ADD COLUMN IF NOT EXISTS has_time boolean NOT NULL DEFAULT true;
