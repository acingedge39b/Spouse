import { Submission, VerifiedUser, Appointment } from '../types';

const API_BASE = '/api';
const SESSION_TOKEN_KEY = 'irb_study_session_token';
const PERSISTENT_SESSION_KEY = 'irb_study_persistent_auth';
const COOKIE_NAME = 'irb_participant_verified';

// In-memory cache for media blobs during session
export const mediaBlobCache = new Map<string, Blob>();

function getAuthHeader(): Record<string, string> {
  const token = getActiveSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getActiveSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(SESSION_TOKEN_KEY) || getPersistentVerifiedUser()?.token || null;
}

export function getPersistentVerifiedUser(): { email: string; token: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PERSISTENT_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function isUserAlreadyVerified(): boolean {
  if (typeof window === 'undefined') return false;
  return !!getActiveSessionToken();
}

export function saveLocalVerifiedSession(user: VerifiedUser, token: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    localStorage.setItem(PERSISTENT_SESSION_KEY, JSON.stringify({
      email: user.email,
      token,
      verifiedAt: user.verifiedAt
    }));
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(user.email)}; path=/; max-age=31536000; SameSite=Lax`;
  } catch (e) {
    console.error('Failed to cache session locally', e);
  }
}

export function clearActiveSessionToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(PERSISTENT_SESSION_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

// ----------------- OTP / AUTH API CALLS -----------------

export async function sendOtpApi(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to dispatch passcode.' };
    }
    return {
      success: true,
      message: data.message
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error connecting to backend.' };
  }
}

export async function verifyOtpApi(email: string, code: string): Promise<{
  success: boolean;
  user?: VerifiedUser;
  token?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Passcode verification failed.' };
    }

    const verifiedUser: VerifiedUser = {
      id: data.user.id,
      email: data.user.email,
      verifiedAt: data.user.verified_at || data.user.verifiedAt,
      sessionToken: data.token
    };

    saveLocalVerifiedSession(verifiedUser, data.token);

    return {
      success: true,
      user: verifiedUser,
      token: data.token
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error verifying passcode.' };
  }
}

export async function checkSessionApi(): Promise<VerifiedUser | null> {
  const token = getActiveSessionToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/session`, {
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (data.authenticated && data.user) {
      return {
        id: data.user.id,
        email: data.user.email,
        verifiedAt: data.user.verified_at,
        sessionToken: token
      };
    }
  } catch {}
  return null;
}

export async function getVerifiedUsersApi(): Promise<VerifiedUser[]> {
  try {
    const res = await fetch(`${API_BASE}/auth/users`, {
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.users)) {
      return data.users.map((u: any) => ({
        id: u.id,
        email: u.email,
        verifiedAt: u.verified_at,
        sessionToken: u.session_token
      }));
    }
  } catch (e) {
    console.error('Error fetching verified users from backend', e);
  }
  return [];
}

// ----------------- SUBMISSION API CALLS -----------------

export async function getSubmissionsApi(): Promise<Submission[]> {
  try {
    const res = await fetch(`${API_BASE}/submissions`);
    const data = await res.json();
    if (data.success && Array.isArray(data.submissions)) {
      return data.submissions.map((s: any) => {
        let blobUrl = s.media_url;
        const cachedBlob = mediaBlobCache.get(s.submission_code);
        if (cachedBlob && !blobUrl) {
          blobUrl = URL.createObjectURL(cachedBlob);
        }
        return {
          id: s.id,
          submissionCode: s.submission_code,
          mediaType: s.media_type,
          mediaUrl: s.media_url,
          mediaBlobUrl: blobUrl,
          durationSeconds: s.duration_seconds,
          status: s.status,
          submittedAt: s.submitted_at,
          blurAlgorithm: s.blur_algorithm,
          promptNotes: s.prompt_notes,
          primaryPromptReflected: s.primary_prompt_reflected,
          fileSizeBytes: s.file_size_bytes
        };
      });
    }
  } catch (e) {
    console.error('Error fetching submissions from database', e);
  }
  return [];
}

export async function createSubmissionApi(
  sub: Omit<Submission, 'id' | 'submissionCode' | 'submittedAt'>,
  blob?: Blob
): Promise<Submission> {
  // Convert blob to base64 data url for storage if small, or keep in memory cache
  let base64Media: string | undefined = undefined;
  if (blob && blob.size < 50 * 1024 * 1024) {
    try {
      base64Media = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(blob);
      });
    } catch {}
  }

  const payload = {
    mediaType: sub.mediaType,
    mediaData: base64Media,
    durationSeconds: sub.durationSeconds,
    blurAlgorithm: sub.blurAlgorithm,
    promptNotes: sub.promptNotes,
    primaryPromptReflected: sub.primaryPromptReflected,
    fileSizeBytes: blob?.size || sub.fileSizeBytes || 0
  };

  const res = await fetch(`${API_BASE}/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to save submission to database');
  }

  const s = data.submission;
  if (blob) {
    mediaBlobCache.set(s.submission_code, blob);
  }

  return {
    id: s.id,
    submissionCode: s.submission_code,
    mediaType: s.media_type,
    mediaUrl: s.media_url,
    mediaBlobUrl: blob ? URL.createObjectURL(blob) : s.media_url,
    durationSeconds: s.duration_seconds,
    status: s.status,
    submittedAt: s.submitted_at,
    blurAlgorithm: s.blur_algorithm,
    promptNotes: s.prompt_notes,
    primaryPromptReflected: s.primary_prompt_reflected,
    fileSizeBytes: s.file_size_bytes
  };
}

export async function getSubmissionByCodeApi(code: string): Promise<Submission | null> {
  try {
    const res = await fetch(`${API_BASE}/submissions/${encodeURIComponent(code.trim().toUpperCase())}`);
    const data = await res.json();
    if (!res.ok || !data.success || !data.submission) {
      return null;
    }
    const s = data.submission;
    return {
      id: s.id,
      submissionCode: s.submission_code,
      mediaType: s.media_type,
      mediaUrl: s.media_url,
      durationSeconds: s.duration_seconds,
      status: s.status,
      submittedAt: s.submitted_at,
      blurAlgorithm: s.blur_algorithm,
      promptNotes: s.prompt_notes,
      primaryPromptReflected: s.primary_prompt_reflected,
      fileSizeBytes: s.file_size_bytes
    };
  } catch {
    return null;
  }
}

export async function withdrawSubmissionApi(code: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/submissions/${encodeURIComponent(code.trim().toUpperCase())}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (data.success) {
      mediaBlobCache.delete(code.trim().toUpperCase());
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ----------------- APPOINTMENTS API CALLS -----------------

export async function getAppointmentsApi(): Promise<Appointment[]> {
  try {
    const res = await fetch(`${API_BASE}/appointments`);
    const data = await res.json();
    if (data.success && Array.isArray(data.appointments)) {
      return data.appointments.map((a: any) => ({
        id: a.id,
        appointmentCode: a.appointment_code,
        type: a.type,
        researcher: a.researcher,
        date: a.date,
        timeSlot: a.time_slot,
        format: a.format,
        participantAlias: a.participant_alias,
        participantEmail: a.participant_email,
        focusArea: a.focus_area,
        notes: a.notes,
        meetingLink: a.meeting_link,
        status: a.status,
        createdAt: a.created_at
      }));
    }
  } catch (e) {
    console.error('Error fetching appointments', e);
  }
  return [];
}

export async function createAppointmentApi(
  apt: Omit<Appointment, 'id' | 'appointmentCode' | 'createdAt' | 'status' | 'meetingLink'>
): Promise<Appointment> {
  const payload = {
    type: apt.type,
    researcher: apt.researcher,
    date: apt.date,
    timeSlot: apt.timeSlot,
    format: apt.format,
    participantAlias: apt.participantAlias,
    participantEmail: apt.participantEmail,
    focusArea: apt.focusArea,
    notes: apt.notes
  };

  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to book appointment in database');
  }

  const a = data.appointment;
  return {
    id: a.id,
    appointmentCode: a.appointment_code,
    type: a.type,
    researcher: a.researcher,
    date: a.date,
    timeSlot: a.time_slot,
    format: a.format,
    participantAlias: a.participant_alias,
    participantEmail: a.participant_email,
    focusArea: a.focus_area,
    notes: a.notes,
    meetingLink: a.meeting_link,
    status: a.status,
    createdAt: a.created_at
  };
}

export async function cancelAppointmentApi(code: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/appointments/${encodeURIComponent(code.trim().toUpperCase())}/cancel`, {
      method: 'PATCH'
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

// ----------------- CATHARSIS API CALLS -----------------

export async function logCatharsisApi(wordCount: number): Promise<void> {
  try {
    await fetch(`${API_BASE}/catharsis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wordCount })
    });
  } catch {}
}

// ----------------- AUDIT STATS API -----------------

export async function getAuditStatsApi(): Promise<{
  totalSubmissions: number;
  videoSubmissions: number;
  audioSubmissions: number;
  avgDuration: number;
  totalVerifiedUsers: number;
  totalAppointments: number;
  decoupledIntegrityVerified: boolean;
} | null> {
  try {
    const res = await fetch(`${API_BASE}/audit/stats`);
    const data = await res.json();
    if (data.success) {
      return data.stats;
    }
  } catch {}
  return null;
}

// ----------------- ADMIN API CALLS & RATE LIMITING -----------------

const ADMIN_TOKEN_KEY = 'irb_admin_auth_token';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function saveAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function getAdminAuthHeader(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function adminLoginApi(email: string, password: string): Promise<{
  success: boolean;
  token?: string;
  admin?: { id: string; email: string; name: string; role: string };
  error?: string;
  retryAfterSeconds?: number;
  remainingAttempts?: number;
}> {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Authentication failed',
        retryAfterSeconds: data.retryAfterSeconds,
        remainingAttempts: data.remainingAttempts
      };
    }

    if (data.token) {
      saveAdminToken(data.token);
    }

    return {
      success: true,
      token: data.token,
      admin: data.admin
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error during admin login.' };
  }
}

export async function adminCheckSessionApi(): Promise<{
  authenticated: boolean;
  admin?: { id: string; email: string; name: string; role: string };
}> {
  const token = getAdminToken();
  if (!token) return { authenticated: false };

  try {
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: { ...getAdminAuthHeader() }
    });
    if (!res.ok) {
      clearAdminToken();
      return { authenticated: false };
    }
    const data = await res.json();
    return {
      authenticated: !!data.authenticated,
      admin: data.admin
    };
  } catch {
    return { authenticated: false };
  }
}

export async function adminLogoutApi(): Promise<void> {
  try {
    await fetch(`${API_BASE}/admin/logout`, {
      method: 'POST',
      headers: { ...getAdminAuthHeader() }
    });
  } finally {
    clearAdminToken();
  }
}

export async function getAdminRateLimitsApi(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/admin/rate-limits`, {
      headers: { ...getAdminAuthHeader() }
    });
    const data = await res.json();
    return data.success && Array.isArray(data.limits) ? data.limits : [];
  } catch {
    return [];
  }
}

export async function clearAdminRateLimitsApi(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/rate-limits/clear`, {
      method: 'POST',
      headers: { ...getAdminAuthHeader() }
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

export async function updateSubmissionStatusApi(code: string, status: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/submissions/${encodeURIComponent(code)}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

export async function updateAppointmentStatusApi(code: string, status: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/appointments/${encodeURIComponent(code)}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

export async function downloadCsvDatasetApi(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/admin/export/csv`, {
      headers: { ...getAdminAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to export CSV');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `irb-qualitative-dataset-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('CSV Export error:', err);
    alert('Failed to download CSV dataset.');
  }
}
