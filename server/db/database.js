import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DB_PATH = resolve(__dirname, '..', 'data', 'studentcompass.db')

mkdirSync(dirname(DB_PATH), { recursive: true })

export const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS professor_profiles (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS thesis_requests (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'pending',
      professor_id TEXT NOT NULL,
      professor_name TEXT NOT NULL,
      professor_domain TEXT,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      student_email TEXT,
      faculty_name TEXT,
      idea TEXT NOT NULL,
      motivation TEXT NOT NULL,
      file_json TEXT,
      professor_note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recovery_requests (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'pending',
      subject TEXT NOT NULL,
      reason TEXT NOT NULL,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      student_email TEXT,
      faculty_name TEXT,
      group_name TEXT,
      room TEXT,
      professor TEXT,
      day INTEGER,
      start_hour INTEGER,
      end_hour INTEGER,
      professor_note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS portal_threads (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      student_email TEXT,
      professor_id TEXT NOT NULL,
      professor_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS portal_messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL REFERENCES portal_threads(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL,
      sender_name TEXT,
      sender_role TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT,
      body TEXT,
      type TEXT,
      action TEXT,
      meta_json TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS direct_messages (
      id TEXT PRIMARY KEY,
      channel TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_name TEXT,
      content TEXT NOT NULL,
      attachment_json TEXT,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schedule_swaps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course TEXT NOT NULL,
      offer_slot TEXT NOT NULL,
      need_slot TEXT NOT NULL,
      message TEXT,
      submitted_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS streaks (
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 1,
      last_date TEXT NOT NULL,
      PRIMARY KEY (user_id, type)
    );

    CREATE TABLE IF NOT EXISTS challenge_completions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      period_key TEXT NOT NULL,
      challenge_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      proof_text TEXT,
      ai_feedback TEXT,
      points INTEGER NOT NULL DEFAULT 0,
      submitted_at TEXT NOT NULL,
      UNIQUE(user_id, period_key, challenge_id)
    );

    CREATE TABLE IF NOT EXISTS carpool_rides (
      id TEXT PRIMARY KEY,
      driver_id TEXT NOT NULL,
      driver_name TEXT NOT NULL,
      from_city TEXT NOT NULL,
      from_detail TEXT,
      to_city TEXT NOT NULL,
      to_detail TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      seats INTEGER NOT NULL DEFAULT 1,
      price_per_person INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      contact TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS carpool_requests (
      id TEXT PRIMARY KEY,
      ride_id TEXT NOT NULL REFERENCES carpool_rides(id) ON DELETE CASCADE,
      passenger_id TEXT NOT NULL,
      passenger_name TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      UNIQUE(ride_id, passenger_id)
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user_time ON notifications(user_id, timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_direct_messages_channel_time ON direct_messages(channel, timestamp);
    CREATE INDEX IF NOT EXISTS idx_portal_messages_thread_time ON portal_messages(thread_id, timestamp);
    CREATE TABLE IF NOT EXISTS challenge_progress (
      user_id TEXT NOT NULL,
      action_type TEXT NOT NULL,
      period_key TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, action_type, period_key)
    );

    CREATE INDEX IF NOT EXISTS idx_challenge_completions_user ON challenge_completions(user_id);
    CREATE INDEX IF NOT EXISTS idx_challenge_progress_user ON challenge_progress(user_id, action_type);
    CREATE INDEX IF NOT EXISTS idx_carpool_rides_status ON carpool_rides(status, date);
    CREATE INDEX IF NOT EXISTS idx_carpool_rides_driver ON carpool_rides(driver_id);
    CREATE INDEX IF NOT EXISTS idx_carpool_requests_ride ON carpool_requests(ride_id);
    CREATE INDEX IF NOT EXISTS idx_carpool_requests_passenger ON carpool_requests(passenger_id);
  `)
}

migrate()

export function nowIso() {
  return new Date().toISOString()
}

export function json(value) {
  return value == null ? null : JSON.stringify(value)
}

export function parseJson(value, fallback = null) {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}
