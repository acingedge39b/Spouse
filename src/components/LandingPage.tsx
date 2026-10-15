import React from 'react';
import { 
  ArrowRight, 
  EyeOff, 
  Mic, 
  Video, 
  Lock, 
  Sparkles, 
  FileCheck, 
  Heart, 
  Clock, 
  CheckCircle2, 
  Search,
  BookOpen,
  Award,
  Maximize2
} from 'lucide-react';
import { isUserAlreadyVerified, getPersistentVerifiedUser } from '../lib/storage';

interface LandingPageProps {
  onBegin: () => void;
  onJumpToRecording?: () => void;
  onOpenWithdrawal: () => void;
  onOpenCrisis: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onBegin,
  onJumpToRecording,
  onOpenWithdrawal,
  onOpenCrisis
}) => {
  const isVerified = isUserAlreadyVerified();
  const verifiedUser = getPersistentVerifiedUser();

  return (
    <div className="relative overflow-hidden w-full">
      <section className="pt-6 sm:pt-10 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6 sm:space-y-10">
        
        {/* FAST-TRACK RETURNING PARTICIPANT BANNER (Permanent Cookies / No Relogin) */}
        {isVerified && onJumpToRecording && (
          <div className="neo-card bg-[#D4EDDA] border-2 border-black p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl neo-card bg-white text-[#1E7E52] flex items-center justify-center font-black">
                ✓
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-black text-sm sm:text-base text-gray-900">
                    Welcome Back! Persistent Session Active
                  </h3>
                  <span className="neo-badge bg-white text-[#1E7E52] text-[10px] px-2 py-0.5">
                    Cookies Saved
                  </span>
                </div>
                <p className="text-xs text-gray-700 font-semibold">
                  Verified as <span className="font-mono underline">{verifiedUser?.email}</span>. No need to re-verify or re-login!
                </p>
              </div>
            </div>

            <button
              onClick={onJumpToRecording}
              className="w-full sm:w-auto neo-btn bg-[#FF5A36] text-white px-5 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Open Fullscreen Studio</span>
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-6">
          
          {/* Neobrutalist Tag pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 neo-badge bg-[#FFE600] text-[#121212] text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5A36] shrink-0" />
            <span>PhD Qualitative Dissertation • IRB #2026-SP84</span>
          </div>

          {/* Main Title with Neobrutalist bold flair */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black text-[#121212] tracking-tight leading-[1.15]">
            Lived Experiences of <br />
            <span className="relative inline-block bg-[#FF5A36] text-white px-3 py-1 rounded-2xl neo-badge -rotate-1 mt-1">
              Spousal Pressure
            </span>{' '}
            & Coping
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-gray-700 font-medium leading-relaxed max-w-2xl mx-auto">
            A secure, trauma-informed academic study collecting asynchronous video & audio reflections. 
            Real-time automatic face blurring keeps unblurred footage strictly on your device.
          </p>

          {/* Neobrutalist Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs font-bold">
            <span className="neo-badge bg-white text-gray-900 px-3 py-1 flex items-center gap-1.5">
              <EyeOff className="w-3.5 h-3.5 text-[#1E7E52]" />
              <span>Full-Screen Auto-Blur</span>
            </span>
            <span className="neo-badge bg-white text-gray-900 px-3 py-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Decoupled Storage</span>
            </span>
            <span className="neo-badge bg-white text-gray-900 px-3 py-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FF5A36]" />
              <span>Self-Paced (8-12 min)</span>
            </span>
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
            {isVerified && onJumpToRecording ? (
              <button
                onClick={onJumpToRecording}
                className="neo-btn bg-[#FF5A36] text-white px-8 py-4 text-sm sm:text-base flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000]"
              >
                <span>Continue to Recording Studio</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onBegin}
                className="neo-btn bg-[#FF5A36] text-white px-8 py-4 text-sm sm:text-base flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000]"
              >
                <span>Begin Participation</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={onOpenCrisis}
              className="neo-btn bg-[#FFFDF7] text-[#9A3412] px-6 py-4 text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 text-[#FF5A36]" />
              <span>24/7 Crisis & Support</span>
            </button>
          </div>

          <div>
            <button
              onClick={onOpenWithdrawal}
              className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-black font-bold underline underline-offset-4"
            >
              <Search className="w-3 h-3 text-[#FF5A36]" />
              <span>Lookup or withdraw a previous #SUB-XXXX submission</span>
            </button>
          </div>
        </div>

        {/* Feature Cards Grid (Neobrutalist Rounded Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-4">
          
          <div className="neo-card p-5 sm:p-6 space-y-3 bg-[#FFFDF7]">
            <div className="w-10 h-10 rounded-xl neo-card bg-[#D4EDDA] text-[#1E7E52] flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-black text-base text-gray-900">
              Full-Screen Video Studio
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Real-time computer vision automatically locks onto your face and blurs it continuously. Live feedback gives you 100% clarity on what is being recorded.
            </p>
            <div className="neo-badge bg-[#D4EDDA] text-[#1E7E52] text-[10px] px-2.5 py-1 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Zero raw footage uploaded
            </div>
          </div>

          <div className="neo-card p-5 sm:p-6 space-y-3 bg-[#FFEFEA]">
            <div className="w-10 h-10 rounded-xl neo-card bg-[#FF5A36] text-white flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-black text-base text-gray-900">
              Decoupled Privacy
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Your email is kept solely for bot prevention. It is isolated from video narratives with zero foreign keys. Anonymous #SUB codes guarantee pseudonymity.
            </p>
            <div className="neo-badge bg-white text-[#9A3412] text-[10px] px-2.5 py-1 inline-flex items-center gap-1 font-mono">
              #SUB-XXXX Token Protected
            </div>
          </div>

          <div className="neo-card p-5 sm:p-6 space-y-3 bg-[#FFFDF7]">
            <div className="w-10 h-10 rounded-xl neo-card bg-[#E8EEFF] text-[#3B82F6] flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-black text-base text-gray-900">
              Audio-Only Alternative
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Prefer not to be on camera? Switch to encrypted audio reflection mode with live waveform feedback with zero webcam activation.
            </p>
            <div className="neo-badge bg-[#E8EEFF] text-[#3B82F6] text-[10px] px-2.5 py-1 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Camera remains disabled
            </div>
          </div>

        </div>

        {/* Guided Prompts */}
        <div className="neo-card p-6 sm:p-8 bg-[#FFFDF7] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="neo-badge bg-[#FFE600] text-[#121212] text-[10px] px-2.5 py-0.5">
                Guided Inquiry
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-900 mt-1">
                Dissertation Reflection Prompts
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl neo-card-sm bg-white space-y-2">
              <span className="neo-badge bg-[#FF5A36] text-white text-[10px] px-2 py-0.5 font-mono">
                PROMPT 01
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                "Describe a situation where expectations or pressure placed on you felt overwhelming."
              </h4>
              <p className="text-[11px] text-gray-500 italic">Lived relational dynamics</p>
            </div>

            <div className="p-4 rounded-xl neo-card-sm bg-white space-y-2">
              <span className="neo-badge bg-[#FF5A36] text-white text-[10px] px-2 py-0.5 font-mono">
                PROMPT 02
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                "How did this situation affect your physical health, mental focus, or daily routine?"
              </h4>
              <p className="text-[11px] text-gray-500 italic">Somatic strain and wellbeing</p>
            </div>

            <div className="p-4 rounded-xl neo-card-sm bg-white space-y-2">
              <span className="neo-badge bg-[#FF5A36] text-white text-[10px] px-2 py-0.5 font-mono">
                PROMPT 03
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                "What coping strategies did you try, and how did they work in practice?"
              </h4>
              <p className="text-[11px] text-gray-500 italic">Boundaries and resilience</p>
            </div>
          </div>
        </div>

        {/* Academic Affiliations */}
        <div className="pt-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-bold text-gray-700">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FF5A36]" />
              <span>Dept. of Behavioral Sciences</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#1E7E52]" />
              <span>IRB Protocol #2026-SP84</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#3B82F6]" />
              <span>Family Resilience Qualitative Consortium</span>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
};
