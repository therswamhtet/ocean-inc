-- Migration: v1.1 columns for client description, client active status, and team member username
-- Adds three new columns used by all subsequent v1.1 features.

-- Client description (nullable, max ~200 chars via application validation)
ALTER TABLE clients ADD COLUMN description TEXT;

-- Client active/blocked status (defaults to true for all existing clients)
ALTER TABLE clients ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Team member username (nullable unique handle, validated at DB level)
ALTER TABLE team_members ADD COLUMN username TEXT UNIQUE;
ALTER TABLE team_members ADD CONSTRAINT username_length CHECK (username IS NULL OR (char_length(username) >= 3 AND char_length(username) <= 20));
ALTER TABLE team_members ADD CONSTRAINT username_format CHECK (username IS NULL OR username ~ '^[a-z0-9-]+$');
