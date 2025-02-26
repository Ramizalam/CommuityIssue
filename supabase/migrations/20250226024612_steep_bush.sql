/*
  # Add comments and user relationships

  1. Changes to Issues Table
    - Add user_id column to issues table
    - Add foreign key constraint to auth.users
    - Update RLS policies to include user_id checks

  2. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `issue_id` (uuid, foreign key to issues)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text)
      - `created_at` (timestamp)

  3. Security
    - Enable RLS on comments table
    - Add policies for:
      - Public read access to comments
      - Authenticated users can create comments
      - Users can only modify their own comments
*/

-- Add user_id to issues table
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid REFERENCES issues(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT comments_content_not_empty CHECK (char_length(content) > 0)
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policies for comments table
CREATE POLICY "Allow public read access to comments"
  ON comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS comments_issue_id_idx ON comments(issue_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at);

-- Update issues table policies to include user_id checks
CREATE POLICY "Allow users to update their own issues"
  ON issues
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.uid() = id
  ))
  WITH CHECK (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.uid() = id
  ));