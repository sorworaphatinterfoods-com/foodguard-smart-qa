-- ============================================================================
-- CCP Cold-Chain / Chilling monitoring (CCP006)
--   Storage & transport temperature control for frozen meat skewers.
--   Reuses the shared ccp_deviation_logs / product_hold_records /
--   verification_records / capa_actions / audit_logs infrastructure.
-- ============================================================================

-- Monitoring points: cold rooms, chillers, freezers, reefer vehicles.
CREATE TABLE IF NOT EXISTS coldchain_points (
  point_id             TEXT PRIMARY KEY,
  point_name           TEXT NOT NULL,
  point_type           TEXT NOT NULL CHECK(point_type IN ('FREEZER','COLD_ROOM','CHILLER','TRANSPORT','OTHER')),
  location             TEXT,
  limit_min            REAL,          -- lower critical/sanity bound (nullable)
  limit_max            REAL,          -- upper critical bound (nullable)
  unit                 TEXT NOT NULL DEFAULT 'C',
  target_label         TEXT,
  check_interval_hours REAL DEFAULT 4,
  ccp_id               TEXT,
  status               TEXT NOT NULL CHECK(status IN ('ACTIVE','MAINTENANCE','INACTIVE')) DEFAULT 'ACTIVE',
  is_active            INTEGER NOT NULL DEFAULT 1,
  created_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Temperature readings taken on the monitoring rounds.
CREATE TABLE IF NOT EXISTS coldchain_logs (
  log_id             TEXT PRIMARY KEY,
  log_ref            TEXT UNIQUE NOT NULL,
  log_datetime       TEXT NOT NULL,
  shift              TEXT,
  point_id           TEXT NOT NULL,
  temp               REAL NOT NULL,
  limit_min          REAL,
  limit_max          REAL,
  product_name       TEXT,
  fg_code            TEXT,
  lot_no             TEXT,
  ccp_result         TEXT NOT NULL CHECK(ccp_result IN ('PASS','FAIL')) DEFAULT 'PASS',
  excursion_minutes  REAL,
  affected_from_time TEXT,
  affected_to_time   TEXT,
  qty_held           REAL,
  qty_held_unit      TEXT,
  corrective_action  TEXT,
  final_disposition  TEXT,
  recorded_by        TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_cc_datetime ON coldchain_logs(log_datetime);
CREATE INDEX IF NOT EXISTS idx_cc_point    ON coldchain_logs(point_id);
CREATE INDEX IF NOT EXISTS idx_cc_result   ON coldchain_logs(ccp_result);

-- CCP + seed monitoring points.
INSERT OR IGNORE INTO ccp_master (ccp_id, process_id, ccp_name, critical_limit, is_active)
VALUES ('CCP006', 'PC0009', 'อุณหภูมิห้องเย็นเก็บรักษา/ขนส่ง (Cold Chain)', '≤ -18 °C', 1);

INSERT OR IGNORE INTO coldchain_points
  (point_id, point_name, point_type, location, limit_min, limit_max, unit, target_label, check_interval_hours, ccp_id, status)
VALUES
  ('CR-01', 'ห้องเย็นเก็บ FG #1 (Frozen)', 'FREEZER',   'FG Cold Store', -30, -18, 'C', '≤ -18°C', 4, 'CCP006', 'ACTIVE'),
  ('CR-02', 'ห้องเย็นเก็บ FG #2 (Frozen)', 'FREEZER',   'FG Cold Store', -30, -18, 'C', '≤ -18°C', 4, 'CCP006', 'ACTIVE'),
  ('CH-01', 'ห้องเย็นวัตถุดิบ (Chiller)',   'CHILLER',   'RM Chiller',      0,   4, 'C', '0 – 4°C', 4, 'CCP006', 'ACTIVE'),
  ('TRK-01', 'รถห้องเย็น Reefer #1',        'TRANSPORT', 'Dispatch',      -30, -18, 'C', '≤ -18°C', 2, 'CCP006', 'ACTIVE');
