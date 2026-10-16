export type StudyStep = 
  | 'landing'
  | 'screening'
  | 'ineligible'
  | 'consent'
  | 'otp'
  | 'recording'
  | 'confirmation';

export interface ScreeningAnswers {
  age18Plus: boolean | null;
  formalMarriage: boolean | null;
  willingToRecord: boolean | null;
}

export interface ConsentAgreements {
  academicUse: boolean;
  voluntaryExit: boolean;
  noLegalNames: boolean;
}

export interface VerifiedUser {
  id: string;
  email: string;
  verifiedAt: string;
  sessionToken: string;
}

export type BlurMode = 'gaussian' | 'pixelate' | 'shield' | 'silhouette';

export interface Submission {
  id: string;
  submissionCode: string; // e.g. "SUB-8924"
  mediaType: 'video_blurred' | 'audio_only';
  mediaUrl?: string;
  mediaBlobUrl?: string;
  durationSeconds: number;
  status: 'submitted' | 'transcribed' | 'archived' | 'rejected';
  submittedAt: string;
  blurAlgorithm: string;
  promptNotes?: string;
  primaryPromptReflected?: string;
  fileSizeBytes?: number;
}

export interface CrisisHelpline {
  name: string;
  number: string;
  text?: string;
  description: string;
  hours: string;
  country: string;
  url?: string;
  badge?: string;
}

export interface Appointment {
  id: string;
  appointmentCode: string; // e.g. "APT-4821"
  type: 'live_interview' | 'private_expressing';
  researcher: 'Maya Lin, M.S. (Doctoral Candidate)' | 'Dr. Evelyn Reed, Ph.D. (Faculty Advisor)' | 'First Available';
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "02:00 PM - 02:45 PM EST"
  format: 'video_face_blurred' | 'audio_only' | 'phone_call';
  participantAlias: string;
  participantEmail?: string;
  focusArea?: string;
  notes?: string;
  createdAt: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  meetingLink: string;
}
