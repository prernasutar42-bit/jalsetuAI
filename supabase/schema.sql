-- Supabase PostgreSQL Schema for FloodWatch
-- Enables PostGIS extension if available for GIS operations
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ZONES (36 Maharashtra districts)
CREATE TABLE IF NOT EXISTS zones (
    id INT PRIMARY KEY,
    code VARCHAR(16) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    region VARCHAR(64) NOT NULL,
    centroid_lat DOUBLE PRECISION NOT NULL,
    centroid_lon DOUBLE PRECISION NOT NULL,
    elevation_m DOUBLE PRECISION NOT NULL,       -- Approximate static terrain elevation
    slope_deg DOUBLE PRECISION NOT NULL,         -- Approximate mean terrain slope
    dist_to_river_m DOUBLE PRECISION NOT NULL,   -- Approximate distance to nearest major river
    past_flood_count INT NOT NULL DEFAULT 0,    -- Historical recorded inundation frequency
    geometry JSONB DEFAULT NULL                 -- District boundary GeoJSON polygon (optional)
);

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
    home_zone_id INT REFERENCES zones(id) ON DELETE SET NULL,
    email_alerts BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. OBSERVATIONS (Hydrology & weather telemetry log)
CREATE TABLE IF NOT EXISTS observations (
    id SERIAL PRIMARY KEY,
    zone_id INT NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    rainfall_1h_mm DOUBLE PRECISION NOT NULL DEFAULT 0,
    rainfall_24h_mm DOUBLE PRECISION NOT NULL DEFAULT 0,
    river_level_m DOUBLE PRECISION DEFAULT NULL,
    river_status VARCHAR(32) DEFAULT 'normal',
    is_stale BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_observations_zone_timestamp ON observations(zone_id, timestamp DESC);

-- 4. PREDICTIONS (ML inference outputs for 24h, 48h, 72h horizons)
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    zone_id INT NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    horizon_hours INT NOT NULL CHECK (horizon_hours IN (24, 48, 72)),
    probability DOUBLE PRECISION NOT NULL CHECK (probability >= 0.0 AND probability <= 1.0),
    level VARCHAR(32) NOT NULL CHECK (level IN ('low', 'moderate', 'high', 'severe')),
    factors JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_zone_created ON predictions(zone_id, created_at DESC);

-- 5. ALERTS (Official early warning bulletins issued by ML or admin)
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    zone_id INT NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    level VARCHAR(32) NOT NULL CHECK (level IN ('low', 'moderate', 'high', 'severe')),
    message TEXT NOT NULL,
    source VARCHAR(32) NOT NULL CHECK (source IN ('model', 'admin')),
    created_by VARCHAR(128) DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_zone_created ON alerts(zone_id, created_at DESC);
