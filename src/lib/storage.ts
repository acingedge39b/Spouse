import { Submission, VerifiedUser, Appointment } from '../types';

const USERS_KEY = 'irb_study_users_verified';
const SUBMISSIONS_KEY = 'irb_study_submissions';
const SESSION_TOKEN_KEY = 'irb_study_session_token';
const PERSISTENT_SESSION_KEY = 'irb_study_persistent_auth';
const COOKIE_NAME = 'irb_participant_verified';

// In-memory cache for recorded media blobs created during the active browser session
export const mediaBlobCache = new Map<string, Blob>();

const INITIAL_SEED_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-seed-01',
    submissionCode: 'SUB-4109',
    mediaType: 'video_blurred',
    mediaBlobUrl: '',
    durationSeconds: 142,
    status: 'submitted',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    blurAlgorithm: 'Client-Side Canvas Gaussian (BlazeFace/Tracking)',
    primaryPromptReflected: 'Prompt 1: Expectations and spousal pressure',
    promptNotes: 'Spoke about differing expectations around career vs family obligations after 6 years of marriage.',
    fileSizeBytes: 4210400,
  },
  {
    id: 'sub-seed-02',
    submissionCode: 'SUB-8924',
    mediaType: 'audio_only',
    mediaBlobUrl: '',
    durationSeconds: 218,
    status: 'transcribed',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    blurAlgorithm: 'Audio-Only Encrypted MediaStream',
    primaryPromptReflected: 'Prompt 2: Somatic & mental health impacts',
    promptNotes: 'Participant described persistent insomnia, somatic tension in neck/shoulders, and navigating communication boundaries.',
    fileSizeBytes: 2450120,
  },
  {
    id: 'sub-seed-03',
    submissionCode: 'SUB-2035',
    mediaType: 'video_blurred',
    mediaBlobUrl: '',
    durationSeconds: 185,
    status: 'submitted',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    blurAlgorithm: 'Client-Side Canvas Pixelate (BlazeFace/Tracking)',
    primaryPromptReflected: 'Prompt 3: Coping strategies and boundary setting',
    promptNotes: 'Explored couples counseling attempts, individual journaling, and renegotiating chore distribution.',
    fileSizeBytes: 5120300,
  }
];

export function getVerifiedUsers(): VerifiedUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Check if the user is already verified via persistent storage or cookie
 * so they NEVER have to re-enter email or OTP repeatedly!
 */
export function isUserAlreadyVerified(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(PERSISTENT_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.email && parsed?.token) return true;
    }
    // Also check document.cookie
    if (document.cookie.includes(`${COOKIE_NAME}=`)) {
      return true;
    }
  } catch {
    // fallback
  }
  return false;
}

export function getPersistentVerifiedUser(): { email: string; token: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PERSISTENT_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    // Check cookie
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const [key, val] = c.trim().split('=');
      if (key === COOKIE_NAME && val) {
        return { email: decodeURIComponent(val), token: 'tok_cookie_verified' };
      }
    }
  } catch {}
  return null;
}

export function saveVerifiedUser(email: string): VerifiedUser {
  const users = getVerifiedUsers();
  const token = 'tok_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  const newUser: VerifiedUser = {
    id: 'usr_' + Math.random().toString(36).substring(2, 10),
    email,
    verifiedAt: new Date().toISOString(),
    sessionToken: token
  };
  users.push(newUser);
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    
    // PERMANENT REMEMBER-ME STORAGE & COOKIE
    localStorage.setItem(PERSISTENT_SESSION_KEY, JSON.stringify({
      email,
      token,
      verifiedAt: newUser.verifiedAt
    }));

    // Set 1-year cookie
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(email)}; path=/; max-age=31536000; SameSite=Lax`;
  } catch (e) {
    console.error('Failed to store verified user', e);
  }
  return newUser;
}

export function clearActiveSessionToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(PERSISTENT_SESSION_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function getActiveSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(SESSION_TOKEN_KEY) || getPersistentVerifiedUser()?.token || null;
}

export function getSubmissions(): Submission[] {
  if (typeof window === 'undefined') return INITIAL_SEED_SUBMISSIONS;
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(INITIAL_SEED_SUBMISSIONS));
      return INITIAL_SEED_SUBMISSIONS;
    }
    const parsed: Submission[] = JSON.parse(raw);
    return parsed.map(sub => {
      const cachedBlob = mediaBlobCache.get(sub.submissionCode);
      if (cachedBlob && !sub.mediaBlobUrl) {
        return {
          ...sub,
          mediaBlobUrl: URL.createObjectURL(cachedBlob)
        };
      }
      return sub;
    });
  } catch {
    return INITIAL_SEED_SUBMISSIONS;
  }
}

export function saveSubmission(submission: Omit<Submission, 'id' | 'submissionCode' | 'submittedAt'>, blob?: Blob): Submission {
  const submissions = getSubmissions();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const code = `SUB-${randomNum}`;

  let blobUrl: string | undefined = undefined;
  if (blob) {
    mediaBlobCache.set(code, blob);
    blobUrl = URL.createObjectURL(blob);
  }

  const newSub: Submission = {
    ...submission,
    id: 'sub_' + Math.random().toString(36).substring(2, 11),
    submissionCode: code,
    submittedAt: new Date().toISOString(),
    mediaBlobUrl: blobUrl,
  };

  submissions.unshift(newSub);
  try {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  } catch (e) {
    console.error('Failed to save submission to localStorage', e);
  }

  return newSub;
}

export function getSubmissionByCode(code: string): Submission | undefined {
  const cleaned = code.trim().toUpperCase();
  const submissions = getSubmissions();
  return submissions.find(s => s.submissionCode.toUpperCase() === cleaned);
}

export function withdrawSubmission(code: string): boolean {
  const cleaned = code.trim().toUpperCase();
  const submissions = getSubmissions();
  const filtered = submissions.filter(s => s.submissionCode.toUpperCase() !== cleaned);
  
  if (filtered.length !== submissions.length) {
    try {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(filtered));
      mediaBlobCache.delete(cleaned);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

// ----------------- 1-ON-1 APPOINTMENTS & EXPRESSING STORAGE -----------------
const APPOINTMENTS_KEY = 'irb_study_appointments';

const INITIAL_SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-seed-01',
    appointmentCode: 'APT-4821',
    type: 'live_interview',
    researcher: 'Maya Lin, M.S. (Doctoral Candidate)',
    date: '2026-10-20',
    timeSlot: '02:00 PM - 02:45 PM EST',
    format: 'video_face_blurred',
    participantAlias: 'Participant R.H.',
    focusArea: 'Navigating career vs family expectations',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: 'confirmed',
    meetingLink: 'https://meet.google.com/irb-psyd-482'
  }
];

export function getAppointments(): Appointment[] {
  if (typeof window === 'undefined') return INITIAL_SEED_APPOINTMENTS;
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    if (!raw) {
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(INITIAL_SEED_APPOINTMENTS));
      return INITIAL_SEED_APPOINTMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SEED_APPOINTMENTS;
  }
}

export function saveAppointment(
  data: Omit<Appointment, 'id' | 'appointmentCode' | 'createdAt' | 'status' | 'meetingLink'>
): Appointment {
  const appointments = getAppointments();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const code = `APT-${randomNum}`;
  const newApt: Appointment = {
    ...data,
    id: 'apt_' + Math.random().toString(36).substring(2, 11),
    appointmentCode: code,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
    meetingLink: `https://meet.google.com/irb-study-${code.toLowerCase()}`
  };
  appointments.unshift(newApt);
  try {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  } catch (e) {
    console.error('Failed to save appointment', e);
  }
  return newApt;
}

export function cancelAppointment(code: string): boolean {
  const appointments = getAppointments();
  const updated = appointments.map(apt => 
    apt.appointmentCode.toUpperCase() === code.trim().toUpperCase()
      ? { ...apt, status: 'cancelled' as const }
      : apt
  );
  try {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

