-- ============================================================================
-- HACCP CCP + Metal Detector Monitoring Module
-- Frozen meat skewer — foreign-body detection before packing.
--
-- ADDITIVE ONLY. Does not alter existing tables (ccp_master, capa_actions,
-- audit_logs, metal_detector_logs, processes are left untouched).
-- Apply to D1:  wrangler d1 execute smart-qa-db --file schema/ccp_metal_detector.sql
--
-- Audit posture: no hard delete anywhere. Rows are voided/superseded via
-- status flags. Critical limits are revision-locked (is_locked / is_current).
-- ============================================================================

-- Revision-locked critical limits per CCP + hazard type (Fe / Non-Fe / SUS).
CREATE TABLE IF NOT EXISTS ccp_critical_limits (
  limit_id         TEXT PRIMARY KEY,
  ccp_id           TEXT NOT NULL,
  hazard_type      TEXT NOT NULL CHECK(hazard_type IN ('Fe','Non-Fe','SUS')),
  limit_value      REAL NOT NULL,
  unit             TEXT NOT NULL DEFAULT 'mm',
  revision         INTEGER NOT NULL DEFAULT 1,
  is_locked        INTEGER NOT NULL DEFAULT 1,   -- locked once approved
  is_current       INTEGER NOT NULL DEFAULT 1,   -- 0 = superseded by newer revision
  effective_date   TEXT NOT NULL DEFAULT (datetime('now')),
  superseded_date  TEXT,
  approved_by      TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Physical metal detector devices on the packing lines.
CREATE TABLE IF NOT EXISTS metal_detector_devices (
  device_id         TEXT PRIMARY KEY,
  device_name       TEXT NOT NULL,
  location          TEXT,
  line_no           TEXT,
  ccp_id            TEXT,
  fe_sensitivity    REAL,             -- mm
  nonfe_sensitivity REAL,
  sus_sensitivity   REAL,
  reject_type       TEXT,             -- Auto Reject / Air Blast / Belt Stop
  last_verified_at  TEXT,
  status            TEXT NOT NULL CHECK(status IN ('ACTIVE','MAINTENANCE','INACTIVE')) DEFAULT 'ACTIVE',
  is_active         INTEGER NOT NULL DEFAULT 1,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Main CCP monitoring record: one metal-detector verification event.
CREATE TABLE IF NOT EXISTS metal_detector_test_logs (
  test_id            TEXT PRIMARY KEY,
  test_ref           TEXT UNIQUE NOT NULL,
  test_datetime      TEXT NOT NULL,
  shift              TEXT,
  line_no            TEXT,
  product_name       TEXT,
  fg_code            TEXT,
  lot_no             TEXT,
  device_id          TEXT NOT NULL,
  frequency_type     TEXT NOT NULL,   -- Start-up / Production period / Product change / After maintenance / End of production
  fe_result          TEXT NOT NULL CHECK(fe_result    IN ('PASS','FAIL')) DEFAULT 'PASS',
  nonfe_result       TEXT NOT NULL CHECK(nonfe_result IN ('PASS','FAIL')) DEFAULT 'PASS',
  sus_result         TEXT NOT NULL CHECK(sus_result   IN ('PASS','FAIL')) DEFAULT 'PASS',
  reject_mechanism   TEXT NOT NULL CHECK(reject_mechanism IN ('OK','NG')) DEFAULT 'OK',
  ccp_result         TEXT NOT NULL CHECK(ccp_result IN ('PASS','FAIL')) DEFAULT 'PASS',
  production_stopped INTEGER NOT NULL DEFAULT 0,
  affected_from_time TEXT,
  affected_to_time   TEXT,
  qty_held           REAL,
  qty_held_unit      TEXT,
  corrective_action  TEXT,
  final_disposition  TEXT,
  inspector          TEXT NOT NULL,
  verified_by        TEXT,
  verified_at        TEXT,
  remark             TEXT,
  attachment_url     TEXT,            -- R2 object key placeholder
  deviation_id       TEXT,            -- FK -> ccp_deviation_logs
  hold_id            TEXT,            -- FK -> product_hold_records
  capa_id            TEXT,            -- FK -> capa_actions
  status             TEXT NOT NULL CHECK(status IN ('CLOSED','PENDING_VERIFICATION','VOID')) DEFAULT 'CLOSED',
  is_void            INTEGER NOT NULL DEFAULT 0,
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  created_by         TEXT,
  updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Individual reject / detected-piece detail lines for a test.
CREATE TABLE IF NOT EXISTS metal_detector_reject_logs (
  reject_id        TEXT PRIMARY KEY,
  test_id          TEXT NOT NULL,
  device_id        TEXT,
  reject_time      TEXT NOT NULL DEFAULT (datetime('now')),
  metal_type       TEXT,             -- Fe / Non-Fe / SUS / Unknown
  detected_size_mm REAL,
  action           TEXT,
  disposition      TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- CCP deviation raised on every CCP FAIL.
CREATE TABLE IF NOT EXISTS ccp_deviation_logs (
  deviation_id       TEXT PRIMARY KEY,
  ccp_id             TEXT,
  source_test_id     TEXT,
  deviation_datetime TEXT NOT NULL DEFAULT (datetime('now')),
  line_no            TEXT,
  product_name       TEXT,
  lot_no             TEXT,
  description        TEXT NOT NULL,
  root_cause         TEXT,
  corrective_action  TEXT,
  production_stopped INTEGER NOT NULL DEFAULT 1,
  capa_id            TEXT,
  hold_id            TEXT,
  verified_by        TEXT,
  verified_at        TEXT,
  disposition        TEXT,
  status             TEXT NOT NULL CHECK(status IN ('OPEN','UNDER_REVIEW','VERIFIED','CLOSED')) DEFAULT 'OPEN',
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  created_by         TEXT,
  updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Product hold (quarantine) records.
CREATE TABLE IF NOT EXISTS product_hold_records (
  hold_id            TEXT PRIMARY KEY,
  source_type        TEXT DEFAULT 'CCP_METAL_DETECTOR',
  source_ref         TEXT,
  deviation_id       TEXT,
  product_name       TEXT,
  fg_code            TEXT,
  lot_no             TEXT,
  line_no            TEXT,
  affected_from_time TEXT,
  affected_to_time   TEXT,
  qty_held           REAL,
  qty_unit           TEXT,
  hold_reason        TEXT,
  disposition        TEXT CHECK(disposition IN ('PENDING','RELEASE','REWORK','REJECT','DESTROY')) DEFAULT 'PENDING',
  released_by        TEXT,
  released_at        TEXT,
  status             TEXT NOT NULL CHECK(status IN ('ON_HOLD','RELEASED','DISPOSED')) DEFAULT 'ON_HOLD',
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  created_by         TEXT,
  updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- QA verification / e-signature-ready sign-off trail.
CREATE TABLE IF NOT EXISTS verification_records (
  verification_id   TEXT PRIMARY KEY,
  source_type       TEXT NOT NULL,   -- METAL_DETECTOR_TEST / CCP_DEVIATION / PRODUCT_HOLD
  source_ref        TEXT NOT NULL,
  verification_type TEXT,            -- QA / QA_SUPERVISOR
  result            TEXT NOT NULL CHECK(result IN ('VERIFIED','REJECTED','PENDING')) DEFAULT 'PENDING',
  comment           TEXT,
  verified_by       TEXT,
  signature_hash    TEXT,            -- e-signature placeholder
  verified_at       TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_mdt_datetime ON metal_detector_test_logs(test_datetime);
CREATE INDEX IF NOT EXISTS idx_mdt_result   ON metal_detector_test_logs(ccp_result);
CREATE INDEX IF NOT EXISTS idx_dev_status   ON ccp_deviation_logs(status);
CREATE INDEX IF NOT EXISTS idx_hold_status  ON product_hold_records(status);
CREATE INDEX IF NOT EXISTS idx_ver_result   ON verification_records(result);

-- ---------------------------------------------------------------------------
-- Seed: critical limits for the metal detector before packing (frozen skewers)
-- References the existing ccp_master rows CCP001/002/003 (process PC0012).
-- ---------------------------------------------------------------------------
INSERT OR IGNORE INTO ccp_critical_limits (limit_id, ccp_id, hazard_type, limit_value, unit, revision, is_locked, approved_by)
VALUES
  ('CL-MD-FE-R1',    'CCP001', 'Fe',     1.0, 'mm', 1, 1, 'QA Manager'),
  ('CL-MD-NONFE-R1', 'CCP002', 'Non-Fe', 1.5, 'mm', 1, 1, 'QA Manager'),
  ('CL-MD-SUS-R1',   'CCP003', 'SUS',    2.0, 'mm', 1, 1, 'QA Manager');

INSERT OR IGNORE INTO metal_detector_devices
  (device_id, device_name, location, line_no, ccp_id, fe_sensitivity, nonfe_sensitivity, sus_sensitivity, reject_type, status)
VALUES
  ('MD-PACK-01', 'Metal Detector — Packing Line 1', 'Packing Area', 'Line 1', 'CCP001', 1.0, 1.5, 2.0, 'Auto Reject + Belt Stop', 'ACTIVE'),
  ('MD-PACK-02', 'Metal Detector — Packing Line 2', 'Packing Area', 'Line 2', 'CCP001', 1.0, 1.5, 2.0, 'Auto Reject + Belt Stop', 'ACTIVE');

-- ============================================================================
-- Thermal CCP (cooking >= 75C core / freezing <= -18C core) — reuses the
-- shared ccp_deviation_logs / product_hold_records / verification_records /
-- capa_actions / audit_logs infrastructure above.
-- ============================================================================
CREATE TABLE IF NOT EXISTS thermal_ccp_limits (
  limit_id         TEXT PRIMARY KEY,
  ccp_id           TEXT,
  stage            TEXT NOT NULL CHECK(stage IN ('COOKING','FREEZING')),
  limit_direction  TEXT NOT NULL CHECK(limit_direction IN ('MIN','MAX')),
  limit_value      REAL NOT NULL,
  unit             TEXT NOT NULL DEFAULT 'C',
  min_hold_minutes REAL,
  revision         INTEGER NOT NULL DEFAULT 1,
  is_locked        INTEGER NOT NULL DEFAULT 1,
  is_current       INTEGER NOT NULL DEFAULT 1,
  effective_date   TEXT NOT NULL DEFAULT (datetime('now')),
  superseded_date  TEXT,
  approved_by      TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS thermal_equipment (
  equipment_id       TEXT PRIMARY KEY,
  equipment_name     TEXT NOT NULL,
  equipment_type     TEXT NOT NULL CHECK(equipment_type IN ('COOKER','BLAST_FREEZER','PROBE','OTHER')),
  stage              TEXT CHECK(stage IN ('COOKING','FREEZING')),
  location           TEXT,
  line_no            TEXT,
  ccp_id             TEXT,
  last_calibrated_at TEXT,
  status             TEXT NOT NULL CHECK(status IN ('ACTIVE','MAINTENANCE','INACTIVE')) DEFAULT 'ACTIVE',
  is_active          INTEGER NOT NULL DEFAULT 1,
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS thermal_monitoring_logs (
  log_id             TEXT PRIMARY KEY,
  log_ref            TEXT UNIQUE NOT NULL,
  log_datetime       TEXT NOT NULL,
  shift              TEXT,
  line_no            TEXT,
  stage              TEXT NOT NULL CHECK(stage IN ('COOKING','FREEZING')),
  product_name       TEXT,
  fg_code            TEXT,
  lot_no             TEXT,
  batch_no           TEXT,
  equipment_id       TEXT NOT NULL,
  probe_id           TEXT,
  frequency_type     TEXT NOT NULL,
  core_temp          REAL,
  hold_minutes       REAL,
  limit_value        REAL,
  limit_direction    TEXT,
  ccp_result         TEXT NOT NULL CHECK(ccp_result IN ('PASS','FAIL')) DEFAULT 'PASS',
  production_stopped INTEGER NOT NULL DEFAULT 0,
  affected_from_time TEXT,
  affected_to_time   TEXT,
  qty_held           REAL,
  qty_held_unit      TEXT,
  corrective_action  TEXT,
  final_disposition  TEXT,
  inspector          TEXT NOT NULL,
  verified_by        TEXT,
  verified_at        TEXT,
  remark             TEXT,
  attachment_url     TEXT,
  deviation_id       TEXT,
  hold_id            TEXT,
  capa_id            TEXT,
  status             TEXT NOT NULL CHECK(status IN ('CLOSED','PENDING_VERIFICATION','VOID')) DEFAULT 'CLOSED',
  is_void            INTEGER NOT NULL DEFAULT 0,
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  created_by         TEXT,
  updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_thermal_datetime ON thermal_monitoring_logs(log_datetime);
CREATE INDEX IF NOT EXISTS idx_thermal_result   ON thermal_monitoring_logs(ccp_result);
CREATE INDEX IF NOT EXISTS idx_thermal_stage    ON thermal_monitoring_logs(stage);

-- Freezing CCP + locked thermal limits + equipment.
INSERT OR IGNORE INTO ccp_master (ccp_id, process_id, ccp_name, critical_limit, is_active)
VALUES ('CCP005', 'PC0008', 'อุณหภูมิแช่เยือกแข็ง (Blast Freezer)', '≤ -18 °C', 1);

INSERT OR IGNORE INTO thermal_ccp_limits (limit_id, ccp_id, stage, limit_direction, limit_value, unit, min_hold_minutes, revision, is_locked, approved_by)
VALUES
  ('TL-COOK-R1', 'CCP004', 'COOKING',  'MIN',  75.0, 'C', 1.0, 1, 1, 'QA Manager'),
  ('TL-FRZ-R1',  'CCP005', 'FREEZING', 'MAX', -18.0, 'C', NULL, 1, 1, 'QA Manager');

INSERT OR IGNORE INTO thermal_equipment (equipment_id, equipment_name, equipment_type, stage, location, line_no, ccp_id, status)
VALUES
  ('COOK-01', 'เตาต้ม/สตีมเมอร์ Line 1', 'COOKER', 'COOKING', 'Cooking Area', 'Line 1', 'CCP004', 'ACTIVE'),
  ('COOK-02', 'เตาต้ม/สตีมเมอร์ Line 2', 'COOKER', 'COOKING', 'Cooking Area', 'Line 2', 'CCP004', 'ACTIVE'),
  ('BFRZ-01', 'Blast Freezer #1', 'BLAST_FREEZER', 'FREEZING', 'Freezing Area', 'Line 1', 'CCP005', 'ACTIVE'),
  ('PROBE-01', 'Probe Thermometer (สอบเทียบ)', 'PROBE', NULL, 'QA Lab', NULL, NULL, 'ACTIVE');
