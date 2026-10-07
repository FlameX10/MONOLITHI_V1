-- CREATE EXTENSION IF NOT EXISTS postgis;

-- DROP TABLE IF EXISTS pixel_timeseries CASCADE;

-- CREATE TABLE pixel_timeseries (
--     id SERIAL PRIMARY KEY,

--     mine_id INTEGER NOT NULL,
--     date DATE NOT NULL,

--     latitude DOUBLE PRECISION,
--     longitude DOUBLE PRECISION,

--     geometry GEOMETRY(Point, 4326),

--     b4 DOUBLE PRECISION,
--     b8 DOUBLE PRECISION,
--     b11 DOUBLE PRECISION,
--     ndvi DOUBLE PRECISION,
--     nbr DOUBLE PRECISION,

--     anomaly_label INTEGER,
--     anomaly_score DOUBLE PRECISION,
--     excavated_flag INTEGER,

--     CONSTRAINT uq_pixel_unique
--         UNIQUE (mine_id, date, latitude, longitude)
-- );

-- CREATE INDEX idx_pixel_mine_date
-- ON pixel_timeseries (mine_id, date);

-- CREATE INDEX idx_pixel_geometry
-- ON pixel_timeseries
-- USING GIST (geometry);



-- =====================================================
-- Enable PostGIS (required for geometry support)
-- =====================================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- CLEAN RESET (DEV / TEST ONLY)
-- =====================================================
DROP TABLE IF EXISTS violation_alerts CASCADE;
DROP TABLE IF EXISTS violation_pixels CASCADE;
DROP TABLE IF EXISTS pixel_timeseries CASCADE;

-- =====================================================
-- 1. PIXEL-LEVEL TIME SERIES (df_anomaly)
-- =====================================================
CREATE TABLE pixel_timeseries (
    id SERIAL PRIMARY KEY,

    mine_id INTEGER NOT NULL,
    date DATE NOT NULL,

    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,

    geometry GEOMETRY(Point, 4326),

    b4 DOUBLE PRECISION,
    b8 DOUBLE PRECISION,
    b11 DOUBLE PRECISION,

    ndvi DOUBLE PRECISION,
    nbr DOUBLE PRECISION,

    anomaly_label INTEGER,
    anomaly_score DOUBLE PRECISION,
    excavated_flag INTEGER,

    CONSTRAINT uq_pixel_unique
        UNIQUE (mine_id, date, latitude, longitude)
);

CREATE INDEX idx_pixel_mine_date
ON pixel_timeseries (mine_id, date);

CREATE INDEX idx_pixel_geometry
ON pixel_timeseries
USING GIST (geometry);

-- =====================================================
-- 2. VIOLATION PIXELS
-- =====================================================
CREATE TABLE violation_pixels (
    id SERIAL PRIMARY KEY,

    mine_id INTEGER NOT NULL,
    date DATE NOT NULL,

    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,

    zone_type TEXT,
    pixel_area DOUBLE PRECISION,
    anomaly_score DOUBLE PRECISION,

    geometry GEOMETRY(Point, 4326),

    CONSTRAINT uq_violation_pixel_unique
        UNIQUE (mine_id, date, latitude, longitude, zone_type)
);

CREATE INDEX idx_violation_pixels_mine_date
ON violation_pixels (mine_id, date);

CREATE INDEX idx_violation_pixels_zone
ON violation_pixels (zone_type);

CREATE INDEX idx_violation_pixels_geometry
ON violation_pixels
USING GIST (geometry);

-- =====================================================
-- 3. VIOLATION ALERTS
-- =====================================================
CREATE TABLE violation_alerts (
    id SERIAL PRIMARY KEY,

    mine_id INTEGER NOT NULL,
    date DATE NOT NULL,

    zone_type TEXT,
    alert_type TEXT,
    affected_area DOUBLE PRECISION
);

CREATE INDEX idx_violation_alerts_mine_date
ON violation_alerts (mine_id, date);

CREATE INDEX idx_violation_alerts_type
ON violation_alerts (alert_type);