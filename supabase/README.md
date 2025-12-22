# Supabase Database Setup

## Running Migrations

To set up the database for online mode:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `migrations/001_online_mode_tables.sql`
5. Click **Run** to execute the migration

## Enable Realtime

After running the migration, enable Realtime for the tables:

1. Go to **Database** → **Replication** in Supabase dashboard
2. Enable replication for these tables:
   - `player_roles`
   - `votes`
   - `room_state`

Alternatively, run these SQL commands in the SQL Editor:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE player_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE room_state;
```

## Tables Overview

### `player_roles`
Stores each player's role and word privately. Players can only access their own role.

### `votes`
Stores votes cast during voting rounds. Enables real-time vote counting.

### `room_state` (existing)
Stores the overall game state that's synchronized to all players.
