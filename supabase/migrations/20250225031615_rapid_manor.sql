/*
  # Add location coordinates to issues table

  1. Changes
    - Add latitude and longitude columns to issues table
    - Make both columns required for better data consistency
    - Add an index on (latitude, longitude) for faster geospatial queries

  2. Notes
    - Using double precision for better accuracy in coordinates
    - Index will help with future location-based queries
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'issues' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE issues 
    ADD COLUMN latitude double precision NOT NULL DEFAULT 0,
    ADD COLUMN longitude double precision NOT NULL DEFAULT 0;

    CREATE INDEX issues_location_idx ON issues (latitude, longitude);
  END IF;
END $$;