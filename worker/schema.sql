-- Cloudflare D1 Database Schema for PhD Qualitative Research Portal
-- Protocol: IRB-2026-SP84

-- 1. Verified Users Table (Decoupled Auth)
CREATE TABLE IF NOT EXISTS verified_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  session_token TEXT NOT NULL,
  verified_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_session_token ON verified_users(session_token);
CREATE INDEX IF NOT EXISTS idx_users_email ON verified_users(email);

-- 2. OTP Codes Table (Expiring passcodes for bot mitigation)
CREATE TABLE IF NOT EXISTS otp_codes (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);

-- 3. Qualitative Submissions Table (Strictly pseudonymous, decoupled from email)
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  submission_code TEXT UNIQUE NOT NULL,
  media_type TEXT NOT NULL, -- 'video_blurred' | 'audio_only'
  media_url TEXT,
  duration_seconds INTEGER NOT NULL,
  blur_algorithm TEXT NOT NULL,
  prompt_notes TEXT,
  primary_prompt_reflected TEXT,
  file_size_bytes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'submitted', -- 'submitted' | 'transcribed' | 'archived' | 'rejected'
  submitted_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_code ON submissions(submission_code);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- 4. 1-on-1 Appointments & Expressing Consultations
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  appointment_code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'live_interview' | 'private_expressing'
  researcher TEXT NOT NULL,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  format TEXT NOT NULL, -- 'video_face_blurred' | 'audio_only' | 'phone_call'
  participant_alias TEXT NOT NULL,
  participant_email TEXT,
  focus_area TEXT,
  notes TEXT,
  meeting_link TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed', -- 'confirmed' | 'completed' | 'cancelled'
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_appointments_code ON appointments(appointment_code);

-- 5. Catharsis & Emotional Release Log (Anonymous metrics only)
CREATE TABLE IF NOT EXISTS catharsis_entries (
  id TEXT PRIMARY KEY,
  word_count INTEGER NOT NULL,
  burned INTEGER DEFAULT 1,
  created_at TEXT NOT NULL
);

-- 6. Admin Users Table (Principal Investigators & Co-Investigators)
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'principal_investigator',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_users(email);

-- 7. Admin Sessions Table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);

-- 8. Rate Limiting Table (Protects login, OTP, and sensitive endpoints)
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  first_attempt_at INTEGER NOT NULL,
  last_attempt_at INTEGER NOT NULL,
  blocked_until INTEGER DEFAULT 0
);

-- 9. Submission Media Chunks Table (Reliable full video/audio storage on Cloudflare Free Tier)
CREATE TABLE IF NOT EXISTS submission_media_chunks (
  id TEXT PRIMARY KEY,
  submission_code TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_data TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chunks_code ON submission_media_chunks(submission_code);
