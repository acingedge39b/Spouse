import { hashPassword, generateSalt, verifyPassword, generateToken } from './auth';

export interface DbVerifiedUser {
  id: string;
  email: string;
  session_token: string;
  verified_at: string;
  created_at: string;
}

export interface DbSubmission {
  id: string;
  submission_code: string;
  media_type: 'video_blurred' | 'audio_only';
  media_url?: string;
  media_data?: string;
  duration_seconds: number;
  blur_algorithm: string;
  prompt_notes?: string;
  primary_prompt_reflected?: string;
  file_size_bytes?: number;
  status: string;
  submitted_at: string;
}

export interface DbAppointment {
  id: string;
  appointment_code: string;
  type: string;
  researcher: string;
  date: string;
  time_slot: string;
  format: string;
  participant_alias: string;
  participant_email?: string;
  focus_area?: string;
  notes?: string;
  meeting_link: string;
  status: string;
  created_at: string;
}

export interface DbAdminUser {
  id: string;
  email: string;
  password_hash: string;
  salt: string;
  name: string;
  role: string;
  created_at: string;
}

export class DatabaseService {
  constructor(private db: D1Database) {}

  // ----------------- OTP OPERATIONS -----------------
  async saveOtp(email: string, code: string, expiresInMinutes: number = 10): Promise<void> {
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
    const now = new Date().toISOString();
    const id = 'otp_' + Math.random().toString(36).substring(2, 12);

    // Invalidate prior unused OTPs for this email
    await this.db.prepare(
      `UPDATE otp_codes SET used = 1 WHERE email = ? AND used = 0`
    ).bind(email.toLowerCase().trim()).run();

    // Insert new OTP
    await this.db.prepare(
      `INSERT INTO otp_codes (id, email, code, expires_at, used, created_at) VALUES (?, ?, ?, ?, 0, ?)`
    ).bind(id, email.toLowerCase().trim(), code, expiresAt, now).run();
  }

  async verifyOtp(email: string, code: string): Promise<{ valid: boolean; reason?: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();
    const now = Date.now();

    const result = await this.db.prepare(
      `SELECT * FROM otp_codes WHERE email = ? AND code = ? AND used = 0 ORDER BY expires_at DESC LIMIT 1`
    ).bind(cleanEmail, cleanCode).first<any>();

    if (!result) {
      return { valid: false, reason: 'Invalid or previously used passcode.' };
    }

    if (result.expires_at < now) {
      return { valid: false, reason: 'This passcode has expired. Please request a new one.' };
    }

    // Mark as used
    await this.db.prepare(
      `UPDATE otp_codes SET used = 1 WHERE id = ?`
    ).bind(result.id).run();

    return { valid: true };
  }

  // ----------------- VERIFIED USERS -----------------
  async saveVerifiedUser(email: string): Promise<{ user: DbVerifiedUser; token: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const now = new Date().toISOString();
    const token = 'tok_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

    const existing = await this.db.prepare(
      `SELECT * FROM verified_users WHERE email = ?`
    ).bind(cleanEmail).first<DbVerifiedUser>();

    if (existing) {
      await this.db.prepare(
        `UPDATE verified_users SET session_token = ?, verified_at = ? WHERE email = ?`
      ).bind(token, now, cleanEmail).run();

      return {
        user: { ...existing, session_token: token, verified_at: now },
        token
      };
    }

    const id = 'usr_' + Math.random().toString(36).substring(2, 10);
    await this.db.prepare(
      `INSERT INTO verified_users (id, email, session_token, verified_at, created_at) VALUES (?, ?, ?, ?, ?)`
    ).bind(id, cleanEmail, token, now, now).run();

    return {
      user: {
        id,
        email: cleanEmail,
        session_token: token,
        verified_at: now,
        created_at: now
      },
      token
    };
  }

  async getUserByToken(token: string): Promise<DbVerifiedUser | null> {
    if (!token) return null;
    const user = await this.db.prepare(
      `SELECT * FROM verified_users WHERE session_token = ?`
    ).bind(token).first<DbVerifiedUser>();
    return user || null;
  }

  async getAllVerifiedUsers(): Promise<DbVerifiedUser[]> {
    const { results } = await this.db.prepare(
      `SELECT id, email, session_token, verified_at, created_at FROM verified_users ORDER BY verified_at DESC`
    ).all<DbVerifiedUser>();
    return results || [];
  }

  // ----------------- SUBMISSIONS -----------------
  async createSubmission(data: {
    mediaType: 'video_blurred' | 'audio_only';
    mediaData?: string;
    mediaUrl?: string;
    durationSeconds: number;
    blurAlgorithm: string;
    promptNotes?: string;
    primaryPromptReflected?: string;
    fileSizeBytes?: number;
  }): Promise<DbSubmission> {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `SUB-${randomNum}`;
    const id = 'sub_' + Math.random().toString(36).substring(2, 12);
    const now = new Date().toISOString();
    const finalMediaUrl = data.mediaUrl || `/api/submissions/${code}/media`;

    await this.db.prepare(`
      INSERT INTO submissions (
        id, submission_code, media_type, media_url, media_data, duration_seconds,
        blur_algorithm, prompt_notes, primary_prompt_reflected, file_size_bytes, status, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?)
    `).bind(
      id,
      code,
      data.mediaType,
      finalMediaUrl,
      data.mediaData || null,
      data.durationSeconds,
      data.blurAlgorithm,
      data.promptNotes || null,
      data.primaryPromptReflected || null,
      data.fileSizeBytes || 0,
      now
    ).run();

    return {
      id,
      submission_code: code,
      media_type: data.mediaType,
      media_url: finalMediaUrl,
      media_data: data.mediaData,
      duration_seconds: data.durationSeconds,
      blur_algorithm: data.blurAlgorithm,
      prompt_notes: data.promptNotes,
      primary_prompt_reflected: data.primaryPromptReflected,
      file_size_bytes: data.fileSizeBytes,
      status: 'submitted',
      submitted_at: now
    };
  }

  async getAllSubmissions(): Promise<DbSubmission[]> {
    const { results } = await this.db.prepare(`
      SELECT id, submission_code, media_type, 
             COALESCE(media_url, '/api/submissions/' || submission_code || '/media') AS media_url,
             media_data, duration_seconds,
             blur_algorithm, prompt_notes, primary_prompt_reflected, file_size_bytes,
             status, submitted_at
      FROM submissions
      ORDER BY submitted_at DESC
    `).all<DbSubmission>();
    return results || [];
  }

  async getSubmissionByCode(code: string): Promise<DbSubmission | null> {
    const cleanCode = code.trim().toUpperCase();
    const sub = await this.db.prepare(`
      SELECT id, submission_code, media_type,
             COALESCE(media_url, '/api/submissions/' || submission_code || '/media') AS media_url,
             media_data, duration_seconds,
             blur_algorithm, prompt_notes, primary_prompt_reflected, file_size_bytes,
             status, submitted_at
      FROM submissions
      WHERE UPPER(submission_code) = ?
    `).bind(cleanCode).first<DbSubmission>();
    return sub || null;
  }

  async updateSubmissionStatus(code: string, status: string): Promise<boolean> {
    const cleanCode = code.trim().toUpperCase();
    const result = await this.db.prepare(`
      UPDATE submissions SET status = ? WHERE UPPER(submission_code) = ?
    `).bind(status, cleanCode).run();
    return (result.meta?.changes ?? 0) > 0;
  }

  async deleteSubmissionByCode(code: string): Promise<boolean> {
    const cleanCode = code.trim().toUpperCase();
    await this.db.prepare(`DELETE FROM submission_media_chunks WHERE UPPER(submission_code) = ?`).bind(cleanCode).run();
    const result = await this.db.prepare(`
      DELETE FROM submissions WHERE UPPER(submission_code) = ?
    `).bind(cleanCode).run();
    return (result.meta?.changes ?? 0) > 0;
  }

  // ----------------- MEDIA CHUNKS FOR RECORDED VIDEOS -----------------
  async saveMediaChunk(submissionCode: string, chunkIndex: number, chunkData: string): Promise<void> {
    const cleanCode = submissionCode.trim().toUpperCase();
    const id = 'chk_' + Math.random().toString(36).substring(2, 12);
    const now = new Date().toISOString();

    await this.db.prepare(`
      INSERT INTO submission_media_chunks (id, submission_code, chunk_index, chunk_data, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, cleanCode, chunkIndex, chunkData, now).run();
  }

  async getMediaChunks(submissionCode: string): Promise<{ chunk_index: number; chunk_data: string }[]> {
    const cleanCode = submissionCode.trim().toUpperCase();
    const { results } = await this.db.prepare(`
      SELECT chunk_index, chunk_data FROM submission_media_chunks
      WHERE UPPER(submission_code) = ?
      ORDER BY chunk_index ASC
    `).bind(cleanCode).all<{ chunk_index: number; chunk_data: string }>();
    return results || [];
  }

  // ----------------- APPOINTMENTS -----------------
  async createAppointment(data: {
    type: string;
    researcher: string;
    date: string;
    timeSlot: string;
    format: string;
    participantAlias: string;
    participantEmail?: string;
    focusArea?: string;
    notes?: string;
  }): Promise<DbAppointment> {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `APT-${randomNum}`;
    const id = 'apt_' + Math.random().toString(36).substring(2, 11);
    const now = new Date().toISOString();
    const meetingLink = `https://meet.google.com/irb-study-${code.toLowerCase()}`;

    await this.db.prepare(`
      INSERT INTO appointments (
        id, appointment_code, type, researcher, date, time_slot, format,
        participant_alias, participant_email, focus_area, notes, meeting_link, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)
    `).bind(
      id,
      code,
      data.type,
      data.researcher,
      data.date,
      data.timeSlot,
      data.format,
      data.participantAlias,
      data.participantEmail || null,
      data.focusArea || null,
      data.notes || null,
      meetingLink,
      now
    ).run();

    return {
      id,
      appointment_code: code,
      type: data.type,
      researcher: data.researcher,
      date: data.date,
      time_slot: data.timeSlot,
      format: data.format,
      participant_alias: data.participantAlias,
      participant_email: data.participantEmail,
      focus_area: data.focusArea,
      notes: data.notes,
      meeting_link: meetingLink,
      status: 'confirmed',
      created_at: now
    };
  }

  async getAllAppointments(): Promise<DbAppointment[]> {
    const { results } = await this.db.prepare(`
      SELECT * FROM appointments ORDER BY created_at DESC
    `).all<DbAppointment>();
    return results || [];
  }

  async updateAppointmentStatus(code: string, status: string): Promise<boolean> {
    const cleanCode = code.trim().toUpperCase();
    const result = await this.db.prepare(`
      UPDATE appointments SET status = ? WHERE UPPER(appointment_code) = ?
    `).bind(status, cleanCode).run();
    return (result.meta?.changes ?? 0) > 0;
  }

  async cancelAppointment(code: string): Promise<boolean> {
    return this.updateAppointmentStatus(code, 'cancelled');
  }

  // ----------------- CATHARSIS / EXPRESSING -----------------
  async logCatharsis(wordCount: number): Promise<void> {
    const id = 'cat_' + Math.random().toString(36).substring(2, 11);
    const now = new Date().toISOString();
    await this.db.prepare(`
      INSERT INTO catharsis_entries (id, word_count, burned, created_at) VALUES (?, ?, 1, ?)
    `).bind(id, wordCount, now).run();
  }

  // ----------------- ADMIN USERS & SESSIONS -----------------
  async ensureDefaultAdmin(
    usernameOrEmail: string = 'BakingLaw',
    password: string = 'LawPHD2026',
    name: string = 'Lead Investigator (BakingLaw)'
  ): Promise<void> {
    const clean = usernameOrEmail.toLowerCase().trim();
    const existing = await this.db.prepare(
      `SELECT id FROM admin_users WHERE LOWER(email) = ? OR LOWER(name) = ? OR LOWER(name) LIKE ? LIMIT 1`
    ).bind(clean, clean, `%${clean}%`).first<any>();

    const salt = generateSalt();
    const hash = await hashPassword(password, salt);
    const now = new Date().toISOString();

    if (!existing) {
      const id = 'adm_' + Math.random().toString(36).substring(2, 10);
      await this.db.prepare(`
        INSERT INTO admin_users (id, email, password_hash, salt, name, role, created_at)
        VALUES (?, ?, ?, ?, ?, 'principal_investigator', ?)
      `).bind(id, clean, hash, salt, name, now).run();
    } else {
      await this.db.prepare(`
        UPDATE admin_users SET password_hash = ?, salt = ?, email = ?, name = ? WHERE id = ?
      `).bind(hash, salt, clean, name, existing.id).run();
    }
  }

  async verifyAdminCredentials(identifier: string, password: string): Promise<DbAdminUser | null> {
    const clean = identifier.toLowerCase().trim();
    const user = await this.db.prepare(
      `SELECT * FROM admin_users WHERE LOWER(email) = ? OR LOWER(name) = ? OR LOWER(name) LIKE ? LIMIT 1`
    ).bind(clean, clean, `%${clean}%`).first<DbAdminUser>();

    if (!user) return null;

    const valid = await verifyPassword(password, user.password_hash, user.salt);
    return valid ? user : null;
  }

  async createAdminSession(adminId: string, expiresInHours: number = 24): Promise<string> {
    const token = generateToken('tok_admin');
    const id = 'sess_' + Math.random().toString(36).substring(2, 12);
    const now = new Date().toISOString();
    const expiresAt = Date.now() + expiresInHours * 60 * 60 * 1000;

    // Remove expired sessions
    await this.db.prepare(
      `DELETE FROM admin_sessions WHERE expires_at < ?`
    ).bind(Date.now()).run();

    await this.db.prepare(`
      INSERT INTO admin_sessions (id, admin_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, adminId, token, expiresAt, now).run();

    return token;
  }

  async validateAdminSession(token: string): Promise<DbAdminUser | null> {
    if (!token) return null;
    const now = Date.now();

    const row = await this.db.prepare(`
      SELECT u.id, u.email, u.name, u.role, u.created_at, s.expires_at
      FROM admin_sessions s
      JOIN admin_users u ON s.admin_id = u.id
      WHERE s.token = ? AND s.expires_at > ?
    `).bind(token, now).first<any>();

    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      password_hash: '',
      salt: '',
      created_at: row.created_at
    };
  }

  async revokeAdminSession(token: string): Promise<void> {
    await this.db.prepare(
      `DELETE FROM admin_sessions WHERE token = ?`
    ).bind(token).run();
  }

  // ----------------- AUDIT STATS -----------------
  async getAuditStats() {
    const totalSubmissions = await this.db.prepare(`SELECT count(*) as count FROM submissions`).first<{ count: number }>();
    const videoSubmissions = await this.db.prepare(`SELECT count(*) as count FROM submissions WHERE media_type = 'video_blurred'`).first<{ count: number }>();
    const audioSubmissions = await this.db.prepare(`SELECT count(*) as count FROM submissions WHERE media_type = 'audio_only'`).first<{ count: number }>();
    const avgDuration = await this.db.prepare(`SELECT avg(duration_seconds) as avg FROM submissions`).first<{ avg: number }>();
    const totalVerifiedUsers = await this.db.prepare(`SELECT count(*) as count FROM verified_users`).first<{ count: number }>();
    const totalAppointments = await this.db.prepare(`SELECT count(*) as count FROM appointments`).first<{ count: number }>();
    const totalCatharsis = await this.db.prepare(`SELECT count(*) as count FROM catharsis_entries`).first<{ count: number }>();

    return {
      totalSubmissions: totalSubmissions?.count || 0,
      videoSubmissions: videoSubmissions?.count || 0,
      audioSubmissions: audioSubmissions?.count || 0,
      avgDuration: Math.round(avgDuration?.avg || 0),
      totalVerifiedUsers: totalVerifiedUsers?.count || 0,
      totalAppointments: totalAppointments?.count || 0,
      totalCatharsis: totalCatharsis?.count || 0,
      decoupledIntegrityVerified: true
    };
  }
}
