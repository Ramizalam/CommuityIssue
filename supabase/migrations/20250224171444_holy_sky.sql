/*
  # Add storage policies for issue images

  1. Storage Setup
    - Create "issue-images" bucket for storing issue-related images
    - Enable public access to allow image viewing
  
  2. Security
    - Add policy for authenticated users to upload images
    - Add policy for public read access to images
*/

-- Create a new storage bucket for issue images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('issue-images', 'issue-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'issue-images'
  AND auth.role() = 'authenticated'
);

-- Allow public read access to images
CREATE POLICY "Allow public read access to images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'issue-images');