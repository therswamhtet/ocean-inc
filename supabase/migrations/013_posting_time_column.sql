-- Migration: Add posting_time column to tasks table
-- Allows admins to set a specific posting time for tasks, defaulting to 10:00 AM

ALTER TABLE tasks ADD COLUMN posting_time TIME DEFAULT '10:00:00';
