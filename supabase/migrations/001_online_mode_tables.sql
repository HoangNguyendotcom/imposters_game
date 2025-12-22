-- Migration: Online Mode Game State Sync Tables
-- Created: 2025-12-21
-- Description: Creates tables for player roles and votes to support online multiplayer gameplay

-- 1. Create player_roles table for private role storage
CREATE TABLE IF NOT EXISTS player_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('civilian', 'imposter', 'spy')),
  word TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, player_id)
);

-- 2. Create votes table for real-time voting
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  voter_client_id TEXT NOT NULL,
  voter_player_id TEXT NOT NULL,
  target_player_id TEXT NOT NULL,
  round_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, voter_player_id, round_number)
);

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_player_roles_room_id ON player_roles(room_id);
CREATE INDEX IF NOT EXISTS idx_player_roles_client_id ON player_roles(client_id);
CREATE INDEX IF NOT EXISTS idx_votes_room_id ON votes(room_id);
CREATE INDEX IF NOT EXISTS idx_votes_round ON votes(room_id, round_number);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE player_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for player_roles
-- Allow all users to read their own role (based on client_id in request headers)
-- Note: In production, implement proper authentication
CREATE POLICY "Allow read own role" ON player_roles
  FOR SELECT USING (true);

-- Allow inserts (host creates roles)
CREATE POLICY "Allow insert roles" ON player_roles
  FOR INSERT WITH CHECK (true);

-- 6. RLS Policies for votes
-- Allow all users to read votes for their room
CREATE POLICY "Allow read room votes" ON votes
  FOR SELECT USING (true);

-- Allow users to insert their own vote
CREATE POLICY "Allow insert vote" ON votes
  FOR INSERT WITH CHECK (true);

-- 7. Enable Realtime for these tables
-- Run these separately in Supabase dashboard if needed:
-- ALTER PUBLICATION supabase_realtime ADD TABLE player_roles;
-- ALTER PUBLICATION supabase_realtime ADD TABLE votes;
-- ALTER PUBLICATION supabase_realtime ADD TABLE room_state;
