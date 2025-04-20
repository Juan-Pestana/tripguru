-- Custom SQL migration file, put your code below! --
-- Custom SQL migration file, put your code below! --
DO $$ 
BEGIN 
  -- Check if PostGIS extension exists
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_extension 
    WHERE extname = 'postgis'
  ) THEN
    -- Create the PostGIS extension if it doesn't exist
    CREATE EXTENSION IF NOT EXISTS postgis;
  END IF;

  -- Ensure spatial_ref_sys table is preserved
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables 
    WHERE table_name = 'spatial_ref_sys'
  ) THEN
    -- Table exists, do nothing
    RAISE NOTICE 'spatial_ref_sys table already exists, preserving it';
  END IF;
END
$$;