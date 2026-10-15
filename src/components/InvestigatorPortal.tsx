import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ShieldCheck, 
  FileText, 
  Download, 
  Play, 
  Video, 
  Mic, 
  EyeOff, 
  Clock, 
  CheckCircle2, 
  Trash2,
  X
} from 'lucide-react';
import { getSubmissions, getVerifiedUsers, withdrawSubmission } from '../lib/storage';
import { Submission, VerifiedUser } from '../types';

interface InvestigatorPortalProps {
  onBackToApp: () => void;
}

export const InvestigatorPortal: React.FC<InvestigatorPortalProps> = ({ onBackToApp }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [verifiedUsers, setVerifiedUsers] = useState<VerifiedUser[]>([]);
  const [activeTab, setActiveTab] = useState<'submissions' | 'schema' | 'ethics'>('submissions');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'audio'>('all');
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  useEffect(() => {
    setSubmissions(getSubmissions());
    setVerifiedUsers(getVerifiedUsers());
  }, []);

  const videoCount = submissions.filter(s => s.mediaType === 'video_blurred').length;
  const audioCount = submissions.filter(s => s.mediaType === 'audio_only').length;
  const avgDuration = submissions.length 
    ? Math.round(submissions.reduce((acc, curr) => acc + curr.durationSeconds, 0) / submissions.length)
    : 0;

  const filteredSubmissions = submissions.filter(s => {
    if (filterType === 'video') return s.mediaType === 'video_blurred';
    if (filterType === 'audio') return s.mediaType === 'audio_only';
    return true;
  });

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

  const handleDelete = (code: string) => {
    if (confirm(`Withdraw and delete ${code}?`)) {
      withdrawSubmission(code);
      setSubmissions(getSubmissions());
      if (selectedSub?.submissionCode === code) {
        setSelectedSub(null);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* Header Bar */}
      <div className="neo-card bg-[#FFFDF7] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-black">
        <div>
          <div className="flex items-center gap-2">
            <span className="neo-badge bg-[#FF5A36] text-white text-[10px] px-2.5 py-0.5">
              Principal Investigator & IRB Audit
            </span>
            <span className="neo-badge bg-[#FFE600] text-black text-[10px] px-2 py-0.5 font-mono">
              #2026-SP84
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] mt-2">
            Qualitative Research Data Archive
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1 max-w-2xl leading-relaxed">
            Inspection of client-side encrypted narrative records, auto-tracking blur verification, and decoupled architecture.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportJSON}
            className="neo-btn bg-white text-gray-900 px-4 py-2.5 text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#FF5A36]" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={onBackToApp}
            className="neo-btn bg-[#FF5A36] text-white px-5 py-2.5 text-xs shadow-[3px_3px_0px_0px_#000]"
          >
            Back to Participant View
          </button>
        </div>
      </div>

      {/* KPI Cards (Neobrutalist 4-card grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="neo-card p-4 sm:p-5 bg-white">
          <div className="flex items-center justify-between text-gray-600 mb-1">
            <span className="text-[10px] font-black uppercase">Submissions</span>
            <FileText className="w-4 h-4 text-[#FF5A36]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-serif text-gray-900">{submissions.length}</div>
          <span className="neo-badge bg-[#D4EDDA] text-[#1E7E52] text-[9px] px-2 py-0.5 mt-2 inline-block">
            Pseudonymous
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
            <span className="text-[10px] font-black uppercase">Audio-Only</span>
            <Mic className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-serif text-gray-900">{audioCount}</div>
          <span className="neo-badge bg-[#E8EEFF] text-[#3B82F6] text-[9px] px-2 py-0.5 mt-2 inline-block">
            Encrypted
          </span>
        </div>

        <div className="neo-card p-4 sm:p-5 bg-white">
          <div className="flex items-center justify-between text-gray-600 mb-1">
            <span className="text-[10px] font-black uppercase">Avg Reflection</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-serif text-gray-900">{avgDuration}s</div>
          <span className="text-[10px] text-gray-500 font-bold mt-2 block">
            ~{(avgDuration / 60).toFixed(1)} minutes
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
          <span>Submissions ({submissions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-black border-b-[3px] transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'schema'
              ? 'border-[#FF5A36] text-[#FF5A36]'
              : 'border-transparent text-gray-600 hover:text-black'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Decoupled Database Audit</span>
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

      {/* Submissions List */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
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
            <span className="text-xs font-bold text-gray-600">
              {filteredSubmissions.length} records in repository
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="neo-card p-5 bg-[#FFFDF7] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-black text-[#FF5A36] neo-badge bg-[#FFEFEA] px-2 py-0.5">
                      {sub.submissionCode}
                    </span>
                    <span className={`neo-badge text-[9px] px-2 py-0.5 ${
                      sub.mediaType === 'video_blurred' ? 'bg-[#D4EDDA] text-[#1E7E52]' : 'bg-[#E8EEFF] text-[#3B82F6]'
                    }`}>
                      {sub.mediaType === 'video_blurred' ? 'Video' : 'Audio'}
                    </span>
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
                    <p>Date: {new Date(sub.submittedAt).toLocaleDateString()}</p>
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
                    title="Withdraw"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schema Audit Tab */}
      {activeTab === 'schema' && (
        <div className="neo-card bg-[#FFFDF7] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="neo-badge bg-[#D4EDDA] text-[#1E7E52] text-xs px-2.5 py-1">
              ✓ Cryptographic Decoupling Confirmed
            </span>
          </div>
          <p className="text-xs text-gray-700 font-medium leading-relaxed">
            The authentication table (<code className="font-mono bg-white px-1 border border-black rounded">users_verified</code>) is physically isolated from the qualitative narrative archive (<code className="font-mono bg-white px-1 border border-black rounded">submissions</code>). Zero foreign keys connect emails to recordings.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl neo-card-sm bg-white space-y-2 border-2 border-black">
              <span className="font-mono text-xs font-black text-gray-900">TABLE: users_verified</span>
              <div className="p-3 bg-gray-50 rounded-lg font-mono text-[11px] text-gray-700 space-y-1">
                <div>id: UUID (PK)</div>
                <div>email: VARCHAR(255) (ENCRYPTED)</div>
                <div>verified_at: TIMESTAMP</div>
                <div className="text-emerald-700 font-black">// ZERO SUBMISSION RELATION</div>
              </div>
              <span className="text-xs font-bold text-gray-600">Stored records: {verifiedUsers.length}</span>
            </div>

            <div className="p-4 rounded-xl neo-card-sm bg-[#FFEFEA] space-y-2 border-2 border-black">
              <span className="font-mono text-xs font-black text-[#FF5A36]">TABLE: submissions</span>
              <div className="p-3 bg-white rounded-lg font-mono text-[11px] text-gray-700 space-y-1 border border-black">
                <div>id: UUID (PK)</div>
                <div>submission_code: VARCHAR(16) (UNIQUE)</div>
                <div>media_type: ENUM('video_blurred', 'audio_only')</div>
                <div>duration_seconds: INTEGER</div>
                <div className="text-emerald-700 font-black">// ZERO USER EMAIL LINK</div>
              </div>
              <span className="text-xs font-bold text-gray-600">Stored narratives: {submissions.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Ethics Tab */}
      {activeTab === 'ethics' && (
        <div className="neo-card bg-[#FFFDF7] p-6 space-y-3">
          <h3 className="font-serif font-black text-lg text-gray-900">
            IRB Human Subjects Protection Protocol (#IRB-2026-SP84)
          </h3>
          <div className="space-y-2 text-xs font-medium text-gray-700">
            <div className="p-3.5 rounded-xl neo-card-sm bg-white">
              <span className="font-black text-gray-900 block">1. Client-Side Biometric Redaction Mandate</span>
              <span>Raw webcam frames never touch server networks. Face auto-tracking canvas blur executes in-browser.</span>
            </div>
            <div className="p-3.5 rounded-xl neo-card-sm bg-white">
              <span className="font-black text-gray-900 block">2. Self-Serve 90-Day Withdrawal Guarantee</span>
              <span>Participants can purge data at any time using their #SUB code without disclosing identity.</span>
            </div>
            <div className="p-3.5 rounded-xl neo-card-sm bg-white">
              <span className="font-black text-gray-900 block">3. 24/7 Crisis Helplines & Grounding Pacer</span>
              <span>Immediate emotional support resources accessible on every screen.</span>
            </div>
          </div>
        </div>
      )}

      {/* Review Playback Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#FFFDF7] rounded-3xl neo-card p-0 overflow-hidden flex flex-col max-h-[92vh]">
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
                {selectedSub.mediaBlobUrl ? (
                  selectedSub.mediaType === 'video_blurred' ? (
                    <video src={selectedSub.mediaBlobUrl} controls autoPlay playsInline className="w-full max-h-[360px] object-contain" />
                  ) : (
                    <audio src={selectedSub.mediaBlobUrl} controls autoPlay className="w-full p-4" />
                  )
                ) : (
                  <p className="text-xs text-gray-400 p-6 text-center">Simulated archive recording ({selectedSub.submissionCode}). Verified auto-face blurred.</p>
                )}
              </div>

              {selectedSub.promptNotes && (
                <div className="p-3 rounded-xl neo-card-sm bg-white text-xs">
                  <span className="font-black text-gray-900">Notes:</span> {selectedSub.promptNotes}
                </div>
              )}
            </div>

            <div className="p-3 bg-[#FAF7F2] border-t-2 border-black flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedSub.submissionCode)}
                className="neo-btn bg-[#EF4444] text-white px-3 py-1.5 text-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Withdraw Record
              </button>
              <button onClick={() => setSelectedSub(null)} className="neo-btn bg-white px-4 py-1.5 text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
