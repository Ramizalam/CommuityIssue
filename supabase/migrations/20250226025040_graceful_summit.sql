/*
  # Fix storage policies for issue images

  1. Changes
    - Update storage bucket policies to allow authenticated users to upload images
    - Ensure public read access to uploaded images
    - Fix RLS policies for issues table

  2. Security
    - Maintain RLS enforcement
    - Allow authenticated users to upload images
    - Allow public read access to images
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to images" ON storage.objects;

-- Recreate storage policies with correct permissions
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'issue-images'
);

CREATE POLICY "Allow public read access to images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'issue-images');

-- Update issues table policies
DROP POLICY IF EXISTS "Allow authenticated users to create issues" ON issues;

CREATE POLICY "Allow authenticated users to create issues"
ON issues
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);