import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  Mic, 
  Phone, 
  X, 
  Check, 
  Sparkles, 
  User, 
  Download, 
  HeartHandshake, 
  Flame, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Send,
  MessageSquare,
  Lock,
  AlertCircle,
  RefreshCw,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { Appointment } from '../types';
import { 
  saveAppointmentAsync, 
  logCatharsisApi, 
  getPersistentVerifiedUser, 
  sendOtpApi, 
  verifyOtpApi 
} from '../lib/storage';

interface OneOnOneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCrisis: () => void;
}

function generateAvailableDates(): { day: string; date: string; full: string }[] {
  const dates: { day: string; date: string; full: string }[] = [];
  const now = new Date();
  let dayOffset = 1;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  while (dates.length < 5) {
    const d = new Date(now);
    d.setDate(now.getDate() + dayOffset);
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push({
        day: dayNames[dayOfWeek],
        date: `${monthNames[d.getMonth()]} ${d.getDate()}`,
        full: `${year}-${month}-${day}`
      });
    }
    dayOffset++;
  }
  return dates;
}

const AVAILABLE_DATES = generateAvailableDates();

const TIME_SLOTS = [
  '10:00 AM - 10:45 AM EST',
  '11:30 AM - 12:15 PM EST',
  '02:00 PM - 02:45 PM EST',
  '03:30 PM - 04:15 PM EST',
  '05:00 PM - 05:45 PM EST',
];

export const OneOnOneAppointmentModal: React.FC<OneOnOneModalProps> = ({
  isOpen,
  onClose,
  onOpenCrisis
}) => {
  const [activeTab, setActiveTab] = useState<'appointment' | 'expressing'>('appointment');
  const persistentUser = getPersistentVerifiedUser();
  const isAlreadyVerified = !!(persistentUser?.email && persistentUser.email.toLowerCase().endsWith('@gmail.com'));

  // Appointment Form State
  const [selectedDate, setSelectedDate] = useState(AVAILABLE_DATES[0]?.full || '');
  const [selectedTime, setSelectedTime] = useState('02:00 PM - 02:45 PM EST');
  const [researcher, setResearcher] = useState<'Maya Lin, M.S. (Doctoral Candidate)' | 'Dr. Evelyn Reed, Ph.D. (Faculty Advisor)' | 'First Available'>('Maya Lin, M.S. (Doctoral Candidate)');
  const [format, setFormat] = useState<'video_face_blurred' | 'audio_only' | 'phone_call'>('video_face_blurred');
  const [participantAlias, setParticipantAlias] = useState('');
  const [participantEmail, setParticipantEmail] = useState(isAlreadyVerified ? persistentUser.email : '');
  const [isEmailVerified, setIsEmailVerified] = useState(isAlreadyVerified);
  const [focusArea, setFocusArea] = useState('Navigating marital expectations and spousal pressure');
  const [notes, setNotes] = useState('');
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // OTP Verification State for 1-1 Appointment
  const [otpStep, setOtpStep] = useState<'idle' | 'otp_sent' | 'verified'>(isAlreadyVerified ? 'verified' : 'idle');
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Resend Countdown Timer
  React.useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Expressing / Catharsis Room State
  const [expressingText, setExpressingText] = useState('');
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [burnEffect, setBurnEffect] = useState(false);
  const [expressingFeedback, setExpressingFeedback] = useState<string | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);

  // Send OTP for Appointment
  const handleSendAppointmentOtp = async () => {
    const cleanEmail = participantEmail.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.endsWith('@gmail.com')) {
      setBookingError('Only personal @gmail.com addresses are accepted for study appointment verification.');
      return;
    }

    setOtpError(null);
    setOtpSuccess(null);
    setBookingError(null);
    setIsSendingOtp(true);

    try {
      const res = await sendOtpApi(cleanEmail);
      setIsSendingOtp(false);

      if (!res.success) {
        setOtpError(res.error || 'Failed to dispatch passcode to Gmail.');
        return;
      }

      setOtpStep('otp_sent');
      setOtpSuccess(res.message || `Passcode sent to ${cleanEmail}. Please check your inbox.`);
      setResendTimer(30);
    } catch (err: any) {
      setIsSendingOtp(false);
      setOtpError(err?.message || 'Error communicating with verification server.');
    }
  };

  // Verify OTP for Appointment
  const handleVerifyAppointmentOtp = async () => {
    const cleanEmail = participantEmail.toLowerCase().trim();
    if (!cleanEmail.endsWith('@gmail.com')) {
      setOtpError('Only @gmail.com addresses are accepted.');
      return;
    }
    if (otpCode.length !== 6) {
      setOtpError('Please enter the complete 6-digit passcode.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      const res = await verifyOtpApi(cleanEmail, otpCode);
      setIsVerifyingOtp(false);

      if (!res.success) {
        setOtpError(res.error || 'Invalid or expired passcode.');
        return;
      }

      setIsEmailVerified(true);
      setOtpStep('verified');
      setOtpSuccess('Gmail verified successfully!');
      setBookingError(null);
    } catch (err: any) {
      setIsVerifyingOtp(false);
      setOtpError(err?.message || 'Passcode verification failed.');
    }
  };

  // Toggle ambient white noise/rain generator using Web Audio API
  const toggleAmbientSound = () => {
    if (isAmbientPlaying) {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      setIsAmbientPlaying(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        // Generate gentle soothing noise buffer (pink/brown noise for calming ambience)
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          data[i] = (b0 + b1 + b2) * 0.05; // soft volume
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);

        noise.connect(gainNode);
        gainNode.connect(ctx.destination);
        noise.start(0);

        setIsAmbientPlaying(true);
      } catch (e) {
        console.warn('Ambient audio could not start', e);
      }
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = participantEmail.toLowerCase().trim();

    // Check @gmail.com requirement
    if (!cleanEmail || !cleanEmail.endsWith('@gmail.com')) {
      setBookingError('A valid personal @gmail.com address is required to receive meeting credentials.');
      return;
    }

    // Require OTP verification
    if (!isEmailVerified) {
      setBookingError('Please verify your @gmail.com address with the single-use passcode before confirming.');
      if (otpStep === 'idle') {
        handleSendAppointmentOtp();
      }
      return;
    }

    const finalAlias = participantAlias.trim() || `Participant #${Math.floor(1000 + Math.random() * 9000)}`;

    setIsBooking(true);
    setBookingError(null);

    try {
      const newApt = await saveAppointmentAsync({
        type: 'live_interview',
        researcher,
        date: selectedDate || AVAILABLE_DATES[0]?.full || new Date().toISOString().split('T')[0],
        timeSlot: selectedTime || '02:00 PM - 02:45 PM EST',
        format,
        participantAlias: finalAlias,
        participantEmail: cleanEmail,
        focusArea,
        notes: notes.trim() || undefined,
      });

      setParticipantAlias(finalAlias);
      setBookedAppointment(newApt);
      setIsBooking(false);
    } catch (err: any) {
      setIsBooking(false);
      setBookingError(err?.message || 'Failed to save appointment to database.');
    }
  };

  const handleDownloadICS = () => {
    if (!bookedAppointment) return;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PhD Research//Spousal Pressure Study//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:1-on-1 Qualitative Interview (#${bookedAppointment.appointmentCode})
DESCRIPTION:Confidential doctoral interview with ${bookedAppointment.researcher}. Meeting Link: ${bookedAppointment.meetingLink}. Participant Alias: ${bookedAppointment.participantAlias}
DTSTART:20261020T140000Z
DTEND:20261020T144500Z
LOCATION:${bookedAppointment.meetingLink}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Interview-${bookedAppointment.appointmentCode}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBurnAndRelease = () => {
    if (!expressingText.trim()) return;
    const wordCount = expressingText.trim().split(/\s+/).length;
    logCatharsisApi(wordCount);
    setBurnEffect(true);
    setTimeout(() => {
      setExpressingText('');
      setBurnEffect(false);
      setExpressingFeedback('Your feelings have been permanently released and dissolved into the void. Zero words stored.');
    }, 1200);
  };

  const handleSaveExpressing = async () => {
    if (!expressingText.trim()) return;
    const wordCount = expressingText.trim().split(/\s+/).length;
    await logCatharsisApi(wordCount);
    setExpressingFeedback('Your unprompted reflections have been encrypted and saved as an anonymous qualitative vignette.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FFFDF7] rounded-3xl neo-card p-0 overflow-hidden flex flex-col max-h-[92vh] border-2 border-black">
        
        {/* Top Header */}
        <div className="bg-[#FFEFEA] border-b-2 border-black px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neo-card bg-[#FF5A36] text-white flex items-center justify-center font-black">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-black text-base sm:text-xl text-[#121212]">
                  1-on-1 Session & Expressing Space
                </h3>
                <span className="neo-badge bg-[#FFE600] text-black text-[9px] px-2 py-0.5">
                  Trauma-Informed
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-700 font-bold">
                Speak directly with a researcher or unburden freely in private.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
              onClose();
            }}
            className="neo-btn bg-white p-1.5 text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="px-4 sm:px-6 pt-3 border-b-2 border-black flex gap-2 bg-[#FAF7F2]">
          <button
            onClick={() => {
              setActiveTab('appointment');
              setBookedAppointment(null);
            }}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-black border-b-[3px] transition-all flex items-center gap-1.5 ${
              activeTab === 'appointment'
                ? 'border-[#FF5A36] text-[#FF5A36]'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Book 1-on-1 Interview</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('expressing');
              setExpressingFeedback(null);
            }}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-black border-b-[3px] transition-all flex items-center gap-1.5 ${
              activeTab === 'expressing'
                ? 'border-[#FF5A36] text-[#FF5A36]'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Private Expressing Room</span>
          </button>
        </div>

        {/* Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto irb-scroll flex-1 space-y-4">
          
          {/* TAB 1: 1-ON-1 INTERVIEW APPOINTMENT */}
          {activeTab === 'appointment' && (
            <>
              {!bookedAppointment ? (
                <form onSubmit={handleBookAppointment} className="space-y-4">
                  <div className="p-3.5 rounded-2xl neo-card-sm bg-[#D4EDDA] border-2 border-black text-xs font-bold text-[#1E7E52] flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-[#1E7E52] mt-0.5" />
                    <div>
                      <span>Strict Confidentiality & Pseudonyms Welcome:</span> You do not need to share legal names. Face-blurring or camera-off is 100% supported during live academic interviews.
                    </div>
                  </div>

                  {/* Date Selector */}
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-800 mb-1.5">
                      1. Select Interview Date
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {AVAILABLE_DATES.map((d) => (
                        <button
                          key={d.full}
                          type="button"
                          onClick={() => setSelectedDate(d.full)}
                          className={`py-2 px-1 text-center rounded-xl border-2 transition-all cursor-pointer ${
                            selectedDate === d.full 
                              ? 'bg-[#FF5A36] text-white border-black font-black shadow-[2px_2px_0px_0px_#000]' 
                              : 'bg-white border-black text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="block text-[10px] font-bold">{d.day}</span>
                          <span className="block text-xs font-black">{d.date}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-800 mb-1.5">
                      2. Choose 45-Minute Window
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 px-3 text-left rounded-xl border-2 text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                            selectedTime === slot 
                              ? 'bg-[#FFE600] text-black border-black shadow-[2px_2px_0px_0px_#000]' 
                              : 'bg-white border-black text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{slot}</span>
                          {selectedTime === slot && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interviewer & Medium */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-800 mb-1.5">
                        3. Interviewer
                      </label>
                      <select
                        value={researcher}
                        onChange={(e: any) => setResearcher(e.target.value)}
                        className="w-full p-2.5 rounded-xl border-2 border-black bg-white text-xs font-bold focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                      >
                        <option value="Maya Lin, M.S. (Doctoral Candidate)">Maya Lin, M.S. (PhD Candidate)</option>
                        <option value="Dr. Evelyn Reed, Ph.D. (Faculty Advisor)">Dr. Evelyn Reed, Ph.D. (Faculty Advisor)</option>
                        <option value="First Available">First Available Researcher</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-gray-800 mb-1.5">
                        4. Preferred Format
                      </label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFormat('video_face_blurred')}
                          className={`flex-1 py-2 px-1 text-center rounded-xl border-2 text-[10px] sm:text-xs font-bold ${
                            format === 'video_face_blurred' ? 'bg-[#FF5A36] text-white border-black' : 'bg-white border-black'
                          }`}
                        >
                          Face-Blurred
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormat('audio_only')}
                          className={`flex-1 py-2 px-1 text-center rounded-xl border-2 text-[10px] sm:text-xs font-bold ${
                            format === 'audio_only' ? 'bg-[#3B82F6] text-white border-black' : 'bg-white border-black'
                          }`}
                        >
                          Audio Only
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormat('phone_call')}
                          className={`flex-1 py-2 px-1 text-center rounded-xl border-2 text-[10px] sm:text-xs font-bold ${
                            format === 'phone_call' ? 'bg-[#121212] text-white border-black' : 'bg-white border-black'
                          }`}
                        >
                          Phone / VoIP
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pseudonym & Optional Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-black uppercase text-gray-800">
                          5. Your Alias / Preferred Pseudonym
                        </label>
                        <button
                          type="button"
                          onClick={() => setParticipantAlias(`Participant #${Math.floor(1000 + Math.random() * 9000)}`)}
                          className="text-[10px] text-[#FF5A36] font-bold hover:underline cursor-pointer"
                        >
                          Auto-generate
                        </button>
                      </div>
                      <input
                        type="text"
                        value={participantAlias}
                        onChange={(e) => setParticipantAlias(e.target.value)}
                        placeholder="e.g. Jordan T. or Participant #74"
                        className="w-full p-2.5 rounded-xl border-2 border-black bg-white text-xs font-bold focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-black uppercase text-gray-800">
                          6. Verified Gmail Address (@gmail.com) *
                        </label>
                        {isEmailVerified && (
                          <span className="text-[10px] text-[#1E7E52] font-black flex items-center gap-1 bg-[#D4EDDA] px-1.5 py-0.5 rounded border border-[#1E7E52]">
                            <CheckCircle2 className="w-3 h-3 text-[#1E7E52]" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="email"
                          value={participantEmail}
                          disabled={isEmailVerified || isSendingOtp}
                          onChange={(e) => {
                            setParticipantEmail(e.target.value);
                            setIsEmailVerified(false);
                            setOtpStep('idle');
                            setOtpError(null);
                            setBookingError(null);
                          }}
                          placeholder="your.email@gmail.com"
                          required
                          className={`flex-1 p-2.5 rounded-xl border-2 border-black bg-white text-xs font-bold focus:outline-none shadow-[2px_2px_0px_0px_#000] ${
                            isEmailVerified ? 'bg-[#D4EDDA]/40 text-[#1E7E52] border-[#1E7E52]' : ''
                          }`}
                        />
                        {!isEmailVerified && (
                          <button
                            type="button"
                            onClick={handleSendAppointmentOtp}
                            disabled={isSendingOtp || !participantEmail.trim() || resendTimer > 0}
                            className="neo-btn bg-[#FFE600] text-black px-3 py-2 text-xs font-black shrink-0 disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                          >
                            {isSendingOtp ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : resendTimer > 0 ? (
                              `Wait ${resendTimer}s`
                            ) : (
                              'Send OTP'
                            )}
                          </button>
                        )}
                        {isEmailVerified && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEmailVerified(false);
                              setOtpStep('idle');
                            }}
                            className="text-[10px] text-gray-500 hover:text-black underline self-center px-1 font-bold cursor-pointer"
                          >
                            Change
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium mt-1">
                        Only @gmail.com is supported for secure Google Meet room access and OTP.
                      </p>

                      {/* Inline OTP verification card when OTP is sent */}
                      {otpStep === 'otp_sent' && !isEmailVerified && (
                        <div className="mt-2 p-3 rounded-xl bg-[#FFF8F0] border-2 border-black space-y-2 animate-fade-in shadow-[2px_2px_0px_0px_#000]">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                            <span>Enter 6-Digit Passcode:</span>
                            <span className="font-mono text-[#FF5A36] text-[10px]">Valid 10 mins</span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="123456"
                              className="w-28 tracking-widest text-center text-sm font-black font-mono p-2 rounded-lg border-2 border-black bg-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyAppointmentOtp}
                              disabled={otpCode.length !== 6 || isVerifyingOtp}
                              className="neo-btn bg-[#1E7E52] text-white px-3 py-2 text-xs font-black disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                            >
                              {isVerifyingOtp ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Verify Passcode</span>
                                </>
                              )}
                            </button>
                          </div>
                          {otpError && (
                            <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{otpError}</span>
                            </p>
                          )}
                          {otpSuccess && (
                            <p className="text-[11px] font-bold text-green-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span>{otpSuccess}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-gray-800 mb-1">
                      Brief Note or Specific Topic You Wish to Touch Upon (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Differences in financial vs parental expectations after 8 years of marriage."
                      className="w-full p-2.5 rounded-xl border-2 border-black bg-white text-xs font-medium focus:outline-none"
                    />
                  </div>

                  {bookingError && (
                    <div className="p-3.5 rounded-2xl neo-card-sm bg-[#FFEFEA] border-2 border-red-500 text-xs font-bold text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isBooking}
                    className="w-full py-3.5 neo-btn bg-[#FF5A36] text-white text-sm font-black flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000] disabled:opacity-50 cursor-pointer"
                  >
                    {isBooking ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Securing Academic Slot...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        <span>Confirm Confidential 1-on-1 Appointment</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* APPOINTMENT CONFIRMATION CARD */
                <div className="neo-card p-6 bg-white space-y-4 text-center border-2 border-black animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl neo-card bg-[#D4EDDA] text-[#1E7E52] flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7 stroke-[3]" />
                  </div>

                  <div>
                    <span className="neo-badge bg-[#FFE600] text-black text-xs px-3 py-1">
                      Appointment Confirmed
                    </span>
                    <h3 className="text-xl font-serif font-black text-gray-900 mt-2">
                      Live 1-on-1 Academic Session Reserved
                    </h3>
                  </div>

                  <div className="p-4 rounded-2xl neo-card-sm bg-[#FFEFEA] text-left space-y-2 border-2 border-black">
                    <div className="flex items-center justify-between border-b border-black pb-1.5">
                      <span className="font-mono text-base font-black text-[#FF5A36]">
                        #{bookedAppointment.appointmentCode}
                      </span>
                      <span className="neo-badge bg-white text-gray-800 text-[10px] px-2 py-0.5">
                        {bookedAppointment.format.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-gray-800 font-bold">
                      <span className="text-gray-500">Date & Time:</span> {bookedAppointment.date} at {bookedAppointment.timeSlot}
                    </p>
                    <p className="text-xs text-gray-800 font-bold">
                      <span className="text-gray-500">Researcher:</span> {bookedAppointment.researcher}
                    </p>
                    <p className="text-xs text-gray-800 font-bold">
                      <span className="text-gray-500">Participant Alias:</span> {bookedAppointment.participantAlias}
                    </p>
                    <p className="text-xs text-gray-800 font-bold truncate">
                      <span className="text-gray-500">Meeting Room:</span> <a href={bookedAppointment.meetingLink} target="_blank" rel="noopener noreferrer" className="text-[#FF5A36] underline">{bookedAppointment.meetingLink}</a>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                    <button
                      onClick={handleDownloadICS}
                      className="neo-btn bg-[#3B82F6] text-white px-4 py-2.5 text-xs flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Calendar Invite (.ics)</span>
                    </button>
                    <button
                      onClick={() => setBookedAppointment(null)}
                      className="neo-btn bg-white text-gray-900 px-4 py-2.5 text-xs"
                    >
                      Book Another Slot
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: PRIVATE EXPRESSING & CATHARSIS SPACE */}
          {activeTab === 'expressing' && (
            <div className="space-y-4">
              <div className="neo-card-sm bg-[#FFF8F0] p-4 border-2 border-black flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-serif font-black text-sm text-gray-900">
                    The Catharsis & Venting Room
                  </h4>
                  <p className="text-xs text-gray-600 font-medium mt-0.5">
                    An open, unprompted safe haven. Write or unburden your unedited raw thoughts. You can choose to burn it into the void or submit it as an anonymous excerpt.
                  </p>
                </div>
                
                {/* Ambient Sound Toggle */}
                <button
                  type="button"
                  onClick={toggleAmbientSound}
                  className={`neo-btn p-2 text-xs flex items-center gap-1.5 shrink-0 ${
                    isAmbientPlaying ? 'bg-[#34D399] text-black' : 'bg-white text-gray-800'
                  }`}
                  title="Toggle Soft Ambient Rain/Noise"
                >
                  {isAmbientPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isAmbientPlaying ? 'Noise On' : 'Ambience'}</span>
                </button>
              </div>

              {expressingFeedback ? (
                <div className="neo-card p-6 bg-white border-2 border-black text-center space-y-3 animate-fade-in">
                  <div className="w-12 h-12 rounded-2xl neo-card bg-[#FFE600] text-black flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 text-[#FF5A36]" />
                  </div>
                  <h4 className="font-serif font-black text-base text-gray-900">Space Cleared</h4>
                  <p className="text-xs text-gray-700 font-medium max-w-md mx-auto leading-relaxed">
                    {expressingFeedback}
                  </p>
                  <button
                    onClick={() => setExpressingFeedback(null)}
                    className="neo-btn bg-[#121212] text-white px-5 py-2 text-xs"
                  >
                    Express More Thoughts
                  </button>
                </div>
              ) : (
                <div className={`space-y-3 transition-all duration-700 ${burnEffect ? 'opacity-0 scale-95 blur-sm' : 'opacity-100'}`}>
                  <textarea
                    rows={7}
                    value={expressingText}
                    onChange={(e) => setExpressingText(e.target.value)}
                    placeholder="Write freely without judgment or filter... Everything you felt you could not say aloud. (Remember: avoid real legal names)."
                    className="w-full p-4 rounded-2xl border-2 border-black bg-white text-xs sm:text-sm font-medium leading-relaxed focus:outline-none shadow-[3px_3px_0px_0px_#000]"
                  />

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    {/* Burn into the void */}
                    <button
                      type="button"
                      onClick={handleBurnAndRelease}
                      disabled={!expressingText.trim() || burnEffect}
                      className="neo-btn bg-[#121212] hover:bg-black text-white px-5 py-3 text-xs flex items-center justify-center gap-2"
                    >
                      <Flame className="w-4 h-4 text-[#FF5A36]" />
                      <span>Release & Burn (Zero Stored)</span>
                    </button>

                    {/* Contribute to Study */}
                    <button
                      type="button"
                      onClick={handleSaveExpressing}
                      disabled={!expressingText.trim() || burnEffect}
                      className="neo-btn bg-[#FF5A36] text-white px-5 py-3 text-xs flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000]"
                    >
                      <Send className="w-4 h-4" />
                      <span>Encrypt & Keep for Study Excerpts</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#FAF7F2] border-t-2 border-black px-4 sm:px-6 py-3 flex items-center justify-between text-xs font-bold text-gray-700">
          <button
            onClick={onOpenCrisis}
            className="text-[#FF5A36] hover:underline flex items-center gap-1"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Crisis Helpline 24/7 (988)</span>
          </button>
          
          <button
            onClick={() => {
              if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
              onClose();
            }}
            className="underline"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
