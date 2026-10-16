import { Submission, VerifiedUser, Appointment } from '../types';
import * as api from './api';

export {
  mediaBlobCache,
  getActiveSessionToken,
  getPersistentVerifiedUser,
  isUserAlreadyVerified,
  clearActiveSessionToken,
  saveLocalVerifiedSession,
  sendOtpApi,
  verifyOtpApi,
  checkSessionApi,
  getVerifiedUsersApi,
  getSubmissionsApi,
  createSubmissionApi,
  getSubmissionByCodeApi,
  withdrawSubmissionApi,
  getAppointmentsApi,
  createAppointmentApi,
  cancelAppointmentApi,
  logCatharsisApi,
  getAuditStatsApi
} from './api';

// Cache for synchronous fallback to avoid component flash during hydration
let cachedSubmissions: Submission[] = [];
let cachedAppointments: Appointment[] = [];
let cachedVerifiedUsers: VerifiedUser[] = [];

// Initialize memory cache from API
if (typeof window !== 'undefined') {
  api.getSubmissionsApi().then(subs => { cachedSubmissions = subs; }).catch(() => {});
  api.getAppointmentsApi().then(apts => { cachedAppointments = apts; }).catch(() => {});
  api.getVerifiedUsersApi().then(users => { cachedVerifiedUsers = users; }).catch(() => {});
}

export function getVerifiedUsers(): VerifiedUser[] {
  return cachedVerifiedUsers;
}

export async function fetchVerifiedUsersAsync(): Promise<VerifiedUser[]> {
  cachedVerifiedUsers = await api.getVerifiedUsersApi();
  return cachedVerifiedUsers;
}

export function getSubmissions(): Submission[] {
  return cachedSubmissions;
}

export async function fetchSubmissionsAsync(): Promise<Submission[]> {
  cachedSubmissions = await api.getSubmissionsApi();
  return cachedSubmissions;
}

export async function saveSubmissionAsync(
  submission: Omit<Submission, 'id' | 'submissionCode' | 'submittedAt'>,
  blob?: Blob
): Promise<Submission> {
  const saved = await api.createSubmissionApi(submission, blob);
  cachedSubmissions = [saved, ...cachedSubmissions];
  return saved;
}

export async function getSubmissionByCodeAsync(code: string): Promise<Submission | null> {
  return await api.getSubmissionByCodeApi(code);
}

export async function withdrawSubmissionAsync(code: string): Promise<boolean> {
  const ok = await api.withdrawSubmissionApi(code);
  if (ok) {
    cachedSubmissions = cachedSubmissions.filter(s => s.submissionCode.toUpperCase() !== code.trim().toUpperCase());
  }
  return ok;
}

export function getAppointments(): Appointment[] {
  return cachedAppointments;
}

export async function fetchAppointmentsAsync(): Promise<Appointment[]> {
  cachedAppointments = await api.getAppointmentsApi();
  return cachedAppointments;
}

export async function saveAppointmentAsync(
  data: Omit<Appointment, 'id' | 'appointmentCode' | 'createdAt' | 'status' | 'meetingLink'>
): Promise<Appointment> {
  const saved = await api.createAppointmentApi(data);
  cachedAppointments = [saved, ...cachedAppointments];
  return saved;
}

export async function cancelAppointmentAsync(code: string): Promise<boolean> {
  const ok = await api.cancelAppointmentApi(code);
  if (ok) {
    cachedAppointments = cachedAppointments.map(a => 
      a.appointmentCode.toUpperCase() === code.trim().toUpperCase() ? { ...a, status: 'cancelled' as const } : a
    );
  }
  return ok;
}
