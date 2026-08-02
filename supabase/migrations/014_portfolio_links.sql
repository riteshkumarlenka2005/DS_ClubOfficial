-- 014_portfolio_links.sql
-- Add portfolio_url column to users and team_members tables

-- Add portfolio_url to users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

-- Add portfolio_url to team_members
ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
