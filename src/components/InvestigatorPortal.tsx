import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ShieldCheck, 
  FileText, 
  Download, 
  Play, 
  Video, 
  Mic, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  X, 
  RefreshCw, 
  Lock, 
  Unlock, 
  UserCheck, 
  Calendar, 
  AlertTriangle, 
  Search, 
  Eye, 
  EyeOff, 
  LogOut, 
  Sparkles, 
  Check, 
  FileSpreadsheet,
  KeyRound
} from 'lucide-react';
import { 
  getSubmissionsApi, 
  getVerifiedUsersApi, 
  withdrawSubmissionApi, 
  getAppointmentsApi, 
  adminLoginApi, 
  adminCheckSessionApi, 
  adminLogoutApi, 
  getAdminRateLimitsApi, 
  clearAdminRateLimitsApi, 
  updateSubmissionStatusApi, 
  updateAppointmentStatusApi, 
  downloadCsvDatasetApi 
} from '../lib/api';
import { Logo } from './Logo';
import { Submission, VerifiedUser, Appointment } from '../types';

interface InvestigatorPortalProps {
  onBackToApp: () => void;
}

export const InvestigatorPortal: React.FC<InvestigatorPortalProps> = ({ onBackToApp }) => {
  // Auth state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<{ id: string; email: string; name: string; role: string } | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [lockoutCountdown, setLockoutCountdown] = useState<number>(0);

  // Portal data
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [verifiedUsers, setVerifiedUsers] = useState<VerifiedUser[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [rateLimits, setRateLimits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'submissions' | 'appointments' | 'users' | 'security' | 'ethics'>('submissions');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'audio'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  // Check existing admin session on mount
  useEffect(() => {
    adminCheckSessionApi().then(res => {
      if (res.authenticated && res.admin) {
        setIsAdminAuthenticated(true);
        setAdminUser(res.admin);
      }
      setIsCheckingAuth(false);
    });
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (lockoutCountdown > 0) {
      timer = setInterval(() => {
        setLockoutCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutCountdown]);

  // Load data when authenticated
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subs, users, apts, limits] = await Promise.all([
        getSubmissionsApi(),
        getVerifiedUsersApi(),
        getAppointmentsApi(),
        getAdminRateLimitsApi()
      ]);
      setSubmissions(subs);
      setVerifiedUsers(users);
      setAppointments(apts);
      setRateLimits(limits);
    } catch (e) {
      console.error('Error loading investigator data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadData();
    }
  }, [isAdminAuthenticated]);

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setIsLoggingIn(true);
    setLoginError(null);

    const res = await adminLoginApi(loginEmail, loginPassword);
    setIsLoggingIn(false);

    if (!res.success) {
      setLoginError(res.error || 'Authentication failed.');
      if (res.retryAfterSeconds && res.retryAfterSeconds > 0) {
        setLockoutCountdown(res.retryAfterSeconds);
      }
      return;
    }

    setIsAdminAuthenticated(true);
    setAdminUser(res.admin || null);
    setLoginPassword('');
  };

  // Handle Logout
  const handleLogout = async () => {
    await adminLogoutApi();
    setIsAdminAuthenticated(false);
    setAdminUser(null);
  };

  // Export JSON
  const handleExportJSON = () => {
    const exportData = {
      study: 'PhD Dissertation: Lived Experiences of Spousal Pressure & Coping Mechanisms',
      irbProtocol: 'IRB-2026-SP84',
      exportedAt: new Date().toISOString(),
      decoupledSchemaAudit: 'CONFIRMED_ZERO_FOREIGN_KEYS_TO_USERS',
      totalRecords: submissions.length,
      submissions: submissions.map(s => ({
        submissionCode: s.submissionCode,
        mediaType: s.mediaType,
        durationSeconds: s.durationSeconds,
        blurAlgorithm: s.blurAlgorithm,
        primaryPromptReflected: s.primaryPromptReflected,
        promptNotes: s.promptNotes,
        submittedAt: s.submittedAt,
        status: s.status,
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `irb-qualitative-dataset-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const handleExportCSV = async () => {
    await downloadCsvDatasetApi();
  };

  // Purge submission
  const handleDelete = async (code: string) => {
    if (confirm(`Withdraw and delete submission ${code} from the Cloudflare D1 database? This action is permanent and complies with IRB participant right to withdraw.`)) {
      await withdrawSubmissionApi(code);
      await loadData();
      if (selectedSub?.submissionCode === code) {
        setSelectedSub(null);
      }
    }
  };

  // Update status
  const handleStatusChange = async (code: string, newStatus: string) => {
    const ok = await updateSubmissionStatusApi(code, newStatus);
    if (ok) {
      setSubmissions(prev => prev.map(s => s.submissionCode === code ? { ...s, status: newStatus as any } : s));
    }
  };

  // Appointment status change
  const handleAppointmentStatus = async (code: string, status: string) => {
    const ok = await updateAppointmentStatusApi(code, status);
    if (ok) {
      setAppointments(prev => prev.map(a => a.appointmentCode === code ? { ...a, status: status as any } : a));
    }
  };

  // Clear rate limits
  const handleClearRateLimits = async () => {
    if (confirm('Clear all rate-limiting IP security locks?')) {
      await clearAdminRateLimitsApi();
      await loadData();
      setLockoutCountdown(0);
      setLoginError(null);
    }
  };

  // Filtered submissions
  const filteredSubmissions = submissions.filter(s => {
    const matchesFilter = filterType === 'all' || 
      (filterType === 'video' && s.mediaType === 'video_blurred') || 
      (filterType === 'audio' && s.mediaType === 'audio_only');
    const matchesSearch = !searchQuery.trim() || 
      s.submissionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.promptNotes && s.promptNotes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.primaryPromptReflected && s.primaryPromptReflected.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const videoCount = submissions.filter(s => s.mediaType === 'video_blurred').length;
  const audioCount = submissions.filter(s => s.mediaType === 'audio_only').length;
  const avgDuration = submissions.length 
    ? Math.round(submissions.reduce((acc, curr) => acc + curr.durationSeconds, 0) / submissions.length)
    : 0;

  // ----------------- RENDER: AUTHENTICATION LOADING -----------------
  if (isCheckingAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="neo-card bg-[#FFFDF7] p-8 text-center space-y-3 max-w-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-[#FF5A36] mx-auto" />
          <h3 className="font-serif font-black text-lg text-gray-900">Verifying Institutional Credentials</h3>
          <p className="text-xs text-gray-600">Connecting to Cloudflare D1 secure admin session...</p>
        </div>
      </div>
    );
  }

  // ----------------- RENDER: LOGIN GATEWAY -----------------
  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 animate-fade-in">
        <div className="mb-4">
          <button
            onClick={onBackToApp}
            className="neo-btn bg-white px-3 py-1.5 text-xs text-gray-800 font-bold"
          >
            ← Return to Public Study
          </button>
        </div>

        <div className="neo-card bg-[#FFFDF7] p-6 sm:p-8 space-y-6 border-2 border-black">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <Logo variant="mark" />
            </div>
            <div className="inline-flex items-center gap-1.5 neo-badge bg-[#FFE600] text-black text-[10px] px-2.5 py-0.5 font-mono">
              IRB-2026-SP84 Protected
            </div>
            <h1 className="text-2xl font-serif font-black text-[#121212]">
              Investigator & Admin Login
            </h1>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Restricted portal for Principal Investigators, Faculty Advisors, and IRB audit monitors.
            </p>
          </div>

          {/* Rate limiting lockout warning */}
          {lockoutCountdown > 0 && (
            <div className="p-3.5 rounded-xl neo-card-sm bg-[#FFEFEA] border-2 border-black text-xs text-red-700 flex items-start gap-2.5 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black block uppercase text-[10px]">Brute-Force Rate Limit Active</span>
                <span>Too many failed attempts. Access locked for <strong>{lockoutCountdown}s</strong>.</span>
              </div>
            </div>
          )}

          {loginError && lockoutCountdown === 0 && (
            <div className="p-3 rounded-xl neo-card-sm bg-[#FFEFEA] border-2 border-black text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-800 mb-1">
                Username or Email
              </label>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                disabled={lockoutCountdown > 0}
                className="w-full px-4 py-3 rounded-xl border-2 border-black font-semibold text-sm bg-white focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                placeholder="e.g. BakingLaw"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-800 mb-1">
                Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={lockoutCountdown > 0}
                  className="w-full pl-4 pr-11 py-3 rounded-xl border-2 border-black font-semibold text-sm bg-white focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || lockoutCountdown > 0}
              className={`w-full py-3.5 neo-btn text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000] ${
                lockoutCountdown > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FF5A36]'
              }`}
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------- RENDER: AUTHENTICATED ADMIN DASHBOARD -----------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* Header Bar */}
      <div className="neo-card bg-[#FFFDF7] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-black">
        <div className="flex items-start gap-4">
          <Logo variant="mark" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="neo-badge bg-[#FF5A36] text-white text-[10px] px-2.5 py-0.5">
                Principal Investigator & IRB Audit
              </span>
              <span className="neo-badge bg-[#0051C3] text-white text-[10px] px-2 py-0.5 font-mono">
                Cloudflare D1 Active
              </span>
              <span className="neo-badge bg-[#FFE600] text-black text-[10px] px-2 py-0.5 font-mono">
                #2026-SP84
              </span>
              <span className="neo-badge bg-[#D4EDDA] text-[#1E7E52] text-[10px] px-2 py-0.5 flex items-center gap-1 font-mono">
                <Check className="w-3 h-3" /> Rate Limiter Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] mt-2">
              Doctoral Qualitative Research Data Archive
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1 max-w-2xl leading-relaxed">
              Welcome, <strong>{adminUser?.name || 'Lead Investigator'}</strong> ({adminUser?.email}). Inspection of client-side encrypted narrative records, scheduled interviews, and decoupled participant tables.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="neo-btn bg-white text-gray-900 px-3.5 py-2.5 text-xs flex items-center gap-1.5"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#3B82F6] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="neo-btn bg-white text-gray-900 px-3.5 py-2.5 text-xs flex items-center gap-1.5"
            title="Export CSV Dataset"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#1E7E52]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="neo-btn bg-white text-gray-900 px-3.5 py-2.5 text-xs flex items-center gap-1.5"
            title="Export JSON"
          >
            <Download className="w-3.5 h-3.5 text-[#FF5A36]" />
            <span>JSON</span>
          </button>

          <button
            onClick={handleLogout}
            className="neo-btn bg-[#FAF7F2] text-red-600 hover:bg-red-50 px-3.5 py-2.5 text-xs flex items-center gap-1.5"
            title="Log Out of Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={onBackToApp}
            className="neo-btn bg-[#FF5A36] text-white px-4 py-2.5 text-xs shadow-[3px_3px_0px_0px_#000]"
          >
            Participant View
          </button>
        </div>
      </div>

      {/* KPI Cards (Neobrutalist 5-card grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="neo-card p-4 sm:p-5 bg-white">
          <div className="flex items-center justify-between text-gray-600 mb-1">
            <span className="text-[10px] font-black uppercase">Submissions</span>
            <FileText className="w-4 h-4 text-[#FF5A36]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-serif text-gray-900">{submissions.length}</div>
          <span className="neo-badge bg-[#D4EDDA] text-[#1E7E52] text-[9px] px-2 py-0.5 mt-2 inline-block">
            In D1 Database
          </span>
        </div>

        <div className="neo-card p-4 sm:p-5 bg-white">
          <div className="flex items-center justify-between text-gray-600 mb-1">
            <span className="text-[10px] font-black uppercase">Video Diaries</span>
            <Video className="w-4 h-4 text-[#1E7E52]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-serif text-gray-900">{videoCount}</div>
          <span className="neo-badge bg-gray-100 text-gray-700 text-[9px] px-2 py-0.5 mt-2 inline-block">
            Auto-Blurred
          </span>
        </div>

        <div className="neo-card p-4 sm:p-5 bg-white">
          <div className="flex items-center justify-between text-gray-600 mb-1">
            <span className="text-[10px] font-black uppercase">Audio Only</span>
            <Mic className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-serif text-gray-900">{audioCount}</div>
          <span className="neo-badge bg-[#E8EEFF] text-[#3B82F6] text-[9px] px-2 py-0.5 mt-2 inline-block">
            Encrypted
          </span>
        </div>

        <div className="neo-card p-4 sm:p-5 bg-white">
          <div className="flex items-center justify-between text-gray-600 mb-1">
            <span className="text-[10px] font-black uppercase">Interviews</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-serif text-gray-900">{appointments.length}</div>
          <span className="text-[10px] text-gray-500 font-bold mt-2 block">
            1-on-1 Scheduled
          </span>
        </div>

        <div className="neo-card p-4 sm:p-5 bg-white">
          <div className="flex items-center justify-between text-gray-600 mb-1">
            <span className="text-[10px] font-black uppercase">Decoupled Users</span>
            <UserCheck className="w-4 h-4 text-[#FF5A36]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-serif text-gray-900">{verifiedUsers.length}</div>
          <span className="neo-badge bg-[#FFE600] text-black text-[9px] px-2 py-0.5 mt-2 inline-block font-mono">
            0 Foreign Keys
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-black pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-black border-b-[3px] transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'submissions'
              ? 'border-[#FF5A36] text-[#FF5A36]'
              : 'border-transparent text-gray-600 hover:text-black'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Qualitative Submissions ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-black border-b-[3px] transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'appointments'
              ? 'border-[#FF5A36] text-[#FF5A36]'
              : 'border-transparent text-gray-600 hover:text-black'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>1-on-1 Appointments ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-black border-b-[3px] transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-[#FF5A36] text-[#FF5A36]'
              : 'border-transparent text-gray-600 hover:text-black'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Verified Participants ({verifiedUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-black border-b-[3px] transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-[#FF5A36] text-[#FF5A36]'
              : 'border-transparent text-gray-600 hover:text-black'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Rate Limiting & Security ({rateLimits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ethics')}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-black border-b-[3px] transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ethics'
              ? 'border-[#FF5A36] text-[#FF5A36]'
              : 'border-transparent text-gray-600 hover:text-black'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>IRB Compliance Protocol</span>
        </button>
      </div>

      {/* ----------------- TAB 1: SUBMISSIONS ----------------- */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setFilterType('all')}
                  className={`neo-badge px-3 py-1 text-xs ${
                    filterType === 'all' ? 'bg-[#121212] text-white' : 'bg-white text-gray-800'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('video')}
                  className={`neo-badge px-3 py-1 text-xs ${
                    filterType === 'video' ? 'bg-[#121212] text-white' : 'bg-white text-gray-800'
                  }`}
                >
                  Video
                </button>
                <button
                  onClick={() => setFilterType('audio')}
                  className={`neo-badge px-3 py-1 text-xs ${
                    filterType === 'audio' ? 'bg-[#121212] text-white' : 'bg-white text-gray-800'
                  }`}
                >
                  Audio
                </button>
              </div>

              <span className="text-xs font-bold text-gray-600 hidden sm:inline">
                {filteredSubmissions.length} of {submissions.length} records
              </span>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by SUB-XXXX or prompt..."
                className="w-full sm:w-64 pl-9 pr-3 py-1.5 rounded-xl border-2 border-black text-xs font-semibold bg-white focus:outline-none"
              />
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="neo-card p-12 bg-white text-center space-y-3 border-2 border-black">
              <FileText className="w-8 h-8 text-gray-400 mx-auto" />
              <h3 className="font-serif font-black text-lg text-gray-800">No Submissions Found</h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                {submissions.length === 0 
                  ? 'No qualitative recordings have been submitted to the Cloudflare D1 database yet.'
                  : 'No records matched your current search filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="neo-card p-5 bg-[#FFFDF7] flex flex-col justify-between space-y-3 border-2 border-black"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-black text-[#FF5A36] neo-badge bg-[#FFEFEA] px-2 py-0.5">
                        {sub.submissionCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={sub.status}
                          onChange={(e) => handleStatusChange(sub.submissionCode, e.target.value)}
                          className="neo-badge text-[9px] px-1.5 py-0.5 bg-white border border-black font-semibold cursor-pointer"
                        >
                          <option value="submitted">Submitted</option>
                          <option value="transcribed">Transcribed</option>
                          <option value="archived">Archived</option>
                        </select>
                        <span className={`neo-badge text-[9px] px-2 py-0.5 ${
                          sub.mediaType === 'video_blurred' ? 'bg-[#D4EDDA] text-[#1E7E52]' : 'bg-[#E8EEFF] text-[#3B82F6]'
                        }`}>
                          {sub.mediaType === 'video_blurred' ? 'Video' : 'Audio'}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-black text-sm text-gray-900 line-clamp-1">
                      {sub.primaryPromptReflected || 'Lived Experience Narrative'}
                    </h3>

                    {sub.promptNotes && (
                      <p className="text-[11px] text-gray-700 mt-1 line-clamp-2 italic bg-white p-2 rounded-xl border border-black font-medium">
                        "{sub.promptNotes}"
                      </p>
                    )}

                    <div className="mt-2 space-y-0.5 text-[10px] text-gray-600 font-bold">
                      <p>Length: {sub.durationSeconds}s • {sub.blurAlgorithm}</p>
                      <p>Recorded: {new Date(sub.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedSub(sub)}
                      className="neo-btn bg-white hover:bg-[#FF5A36] hover:text-white text-gray-900 px-3 py-1.5 text-xs flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Review Playback</span>
                    </button>

                    <button
                      onClick={() => handleDelete(sub.submissionCode)}
                      className="p-1.5 text-gray-500 hover:text-red-600 font-bold"
                      title="Purge (IRB Participant Right)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 2: APPOINTMENTS ----------------- */}
      {activeTab === 'appointments' && (
        <div className="neo-card bg-[#FFFDF7] p-6 space-y-4 border-2 border-black">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-black text-lg text-gray-900">
              Scheduled 1-on-1 Qualitative Interviews & Consultations
            </h3>
            <span className="neo-badge bg-[#E8EEFF] text-[#3B82F6] text-xs px-2.5 py-0.5">
              {appointments.length} Total Booked
            </span>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              No participant appointments currently scheduled in database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-black text-gray-600 font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Participant Alias</th>
                    <th className="py-2.5 px-3">Assigned Researcher</th>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Format</th>
                    <th className="py-2.5 px-3">Meeting Link</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium text-gray-800">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-white/60">
                      <td className="py-3 px-3 font-mono font-bold text-[#FF5A36]">{apt.appointmentCode}</td>
                      <td className="py-3 px-3 font-bold">{apt.participantAlias}</td>
                      <td className="py-3 px-3">{apt.researcher}</td>
                      <td className="py-3 px-3">{apt.date} • {apt.timeSlot}</td>
                      <td className="py-3 px-3">
                        <span className="neo-badge text-[9px] px-2 py-0.5 bg-gray-100">
                          {apt.format.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <a href={apt.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          Join Link
                        </a>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`neo-badge text-[9px] px-2 py-0.5 ${
                          apt.status === 'confirmed' ? 'bg-[#D4EDDA] text-[#1E7E52]' :
                          apt.status === 'completed' ? 'bg-[#E8EEFF] text-[#3B82F6]' : 'bg-red-100 text-red-700'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
                        {apt.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleAppointmentStatus(apt.appointmentCode, 'completed')}
                              className="neo-btn bg-white px-2 py-1 text-[10px] text-green-700"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleAppointmentStatus(apt.appointmentCode, 'cancelled')}
                              className="neo-btn bg-white px-2 py-1 text-[10px] text-red-600"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 3: VERIFIED PARTICIPANTS ----------------- */}
      {activeTab === 'users' && (
        <div className="neo-card bg-[#FFFDF7] p-6 space-y-4 border-2 border-black">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-black text-lg text-gray-900">
                Verified Participants Table (Decoupled Auth)
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Emails are stored strictly in this bot-screening table and cryptographically isolated from submissions with zero foreign keys.
              </p>
            </div>
            <span className="neo-badge bg-[#D4EDDA] text-[#1E7E52] text-xs px-2.5 py-0.5 font-mono">
              {verifiedUsers.length} Verified
            </span>
          </div>

          {verifiedUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              No participants verified in database yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-black text-gray-600 font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-3">User ID</th>
                    <th className="py-2.5 px-3">Participant Email</th>
                    <th className="py-2.5 px-3">Verified At</th>
                    <th className="py-2.5 px-3">Session Token (Masked)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium text-gray-800">
                  {verifiedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/60">
                      <td className="py-3 px-3 font-mono text-[11px] text-gray-600">{u.id}</td>
                      <td className="py-3 px-3 font-bold">{u.email}</td>
                      <td className="py-3 px-3 text-gray-600">{new Date(u.verifiedAt).toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono text-[10px] text-gray-500">
                        {u.sessionToken.slice(0, 8)}••••••••••
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 4: RATE LIMITING & SECURITY ----------------- */}
      {activeTab === 'security' && (
        <div className="neo-card bg-[#FFFDF7] p-6 space-y-4 border-2 border-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-black text-lg text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#FF5A36]" />
                Rate Limiting & Security Monitoring (Cloudflare D1)
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Brute-force protection rules: <strong>Max 5 login attempts / 15 mins</strong>; <strong>Max 3 OTP requests / 5 mins</strong>.
              </p>
            </div>

            <button
              onClick={handleClearRateLimits}
              className="neo-btn bg-[#FF5A36] text-white px-3.5 py-1.5 text-xs font-bold self-start sm:self-auto"
            >
              Clear All Security Locks
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-black text-gray-600 font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3">Rate Limit Key</th>
                  <th className="py-2.5 px-3">Attempt Count</th>
                  <th className="py-2.5 px-3">First Seen</th>
                  <th className="py-2.5 px-3">Last Attempt</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium text-gray-800">
                {rateLimits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500 text-xs">
                      No security locks or rate limits currently triggered. System normal.
                    </td>
                  </tr>
                ) : (
                  rateLimits.map((l: any) => {
                    const isBlocked = l.blocked_until && l.blocked_until > Date.now();
                    return (
                      <tr key={l.key} className="hover:bg-white/60">
                        <td className="py-3 px-3 font-mono text-[11px] font-bold">{l.key}</td>
                        <td className="py-3 px-3 font-bold">{l.count} attempts</td>
                        <td className="py-3 px-3 text-gray-600">{new Date(l.first_attempt_at).toLocaleTimeString()}</td>
                        <td className="py-3 px-3 text-gray-600">{new Date(l.last_attempt_at).toLocaleTimeString()}</td>
                        <td className="py-3 px-3">
                          <span className={`neo-badge text-[9px] px-2 py-0.5 ${
                            isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {isBlocked ? `LOCKED (Until ${new Date(l.blocked_until).toLocaleTimeString()})` : 'Active Window'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TAB 5: IRB ETHICS ----------------- */}
      {activeTab === 'ethics' && (
        <div className="neo-card bg-[#FFFDF7] p-6 space-y-4 border-2 border-black">
          <div className="flex items-center gap-2">
            <span className="neo-badge bg-[#FFE600] text-black text-xs px-2.5 py-1 font-mono">
              IRB-2026-SP84 Approved
            </span>
          </div>
          <h3 className="font-serif font-black text-xl text-gray-900">
            Institutional Review Board Human Subjects Protocol
          </h3>
          <p className="text-xs text-gray-700 leading-relaxed font-medium">
            This research portal is governed under university IRB regulations regarding human behavioral qualitative research.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl neo-card-sm bg-white space-y-1.5 border-2 border-black">
              <span className="font-black text-xs text-gray-900 block">1. Client-Side Anonymization</span>
              <p className="text-[11px] text-gray-600">Video frames undergo TensorFlow BlazeFace detection & Canvas Gaussian blur in the client browser before packet transfer.</p>
            </div>
            <div className="p-4 rounded-xl neo-card-sm bg-white space-y-1.5 border-2 border-black">
              <span className="font-black text-xs text-gray-900 block">2. Self-Serve Right to Withdraw</span>
              <p className="text-[11px] text-gray-600">Participants can purge data unconditionally using their #SUB-XXXX code within 90 days of contribution without human intervention.</p>
            </div>
            <div className="p-4 rounded-xl neo-card-sm bg-white space-y-1.5 border-2 border-black">
              <span className="font-black text-xs text-gray-900 block">3. Decoupled Email Storage</span>
              <p className="text-[11px] text-gray-600">Emails are validated for bot mitigation and stored in an isolated table with zero foreign keys or relational joins to recordings.</p>
            </div>
          </div>
        </div>
      )}

      {/* Review Playback Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#FFFDF7] rounded-3xl neo-card p-0 overflow-hidden flex flex-col max-h-[92vh] border-2 border-black">
            <div className="p-4 bg-[#FFEFEA] border-b-2 border-black flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-black text-[#FF5A36] neo-badge bg-white px-2 py-0.5">
                  {selectedSub.submissionCode}
                </span>
                <h3 className="font-black text-sm mt-1">{selectedSub.primaryPromptReflected || 'Narrative'}</h3>
              </div>
              <button onClick={() => setSelectedSub(null)} className="neo-btn bg-white p-1.5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto">
              <div className="bg-black rounded-2xl overflow-hidden min-h-[240px] flex items-center justify-center neo-card p-0">
                {(() => {
                  const mediaSource = selectedSub.mediaBlobUrl || `/api/submissions/${selectedSub.submissionCode}/media`;
                  return selectedSub.mediaType === 'video_blurred' ? (
                    <video 
                      src={mediaSource} 
                      controls 
                      autoPlay 
                      playsInline 
                      className="w-full max-h-[360px] object-contain" 
                    />
                  ) : (
                    <audio 
                      src={mediaSource} 
                      controls 
                      autoPlay 
                      className="w-full p-4" 
                    />
                  );
                })()}
              </div>

              {selectedSub.promptNotes && (
                <div className="p-3 rounded-xl neo-card-sm bg-white text-xs border border-black">
                  <span className="font-black block text-gray-900 mb-1">Participant Reflection Notes:</span>
                  <p className="text-gray-700 italic">"{selectedSub.promptNotes}"</p>
                </div>
              )}

              <div className="text-[11px] text-gray-600 font-semibold space-y-1">
                <p>Duration: {selectedSub.durationSeconds} seconds</p>
                <p>Anonymization: {selectedSub.blurAlgorithm}</p>
                <p>Recorded At: {new Date(selectedSub.submittedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
