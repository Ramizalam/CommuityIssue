/*
  # Create issues table for community problem reporting

  1. New Tables
    - `issues`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `location` (text)
      - `image_url` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `issues` table
    - Add policies for public read access
    - Add policies for authenticated users to create issues
*/

CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  location text NOT NULL,
  image_url text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Allow public read access to issues
CREATE POLICY "Allow public read access"
  ON issues
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to create issues
CREATE POLICY "Allow authenticated users to create issues"
  ON issues
  FOR INSERT
  TO authenticated
  WITH CHECK (true);