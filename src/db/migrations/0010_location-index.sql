-- Custom SQL migration file, put your code below! --
CREATE INDEX idx_location_gist ON locations USING gist ("location");