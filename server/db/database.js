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

    CREATE INDEX IF NOT EXISTS idx_notifications_user_time ON notifications(user_id, timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_direct_messages_channel_time ON direct_messages(channel, timestamp);
    CREATE INDEX IF NOT EXISTS idx_portal_messages_thread_time ON portal_messages(thread_id, timestamp);
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
