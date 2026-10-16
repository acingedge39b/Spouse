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
  Maximize2,
  Calendar,
  HeartHandshake,
  ShieldCheck,
  Building,
  GraduationCap,
  Users,
  HelpCircle,
  PhoneCall
} from 'lucide-react';
import { Logo } from './Logo';
import FlexCarousel, { FlexCarouselItem } from './FlexCarousel';

const CAROUSEL_ITEMS: FlexCarouselItem[] = [
  { 
    src: '/images/participant-1.jpg', 
    alt: 'Qualitative video interview recording with client-side mosaic privacy blur', 
    title: 'Participant #34 • Qualitative Reflection',
    subtitle: 'IRB Protocol #2026-SP84 • Semi-Structured Interview' 
  },
  { 
    src: '/images/chat-1.png', 
    alt: 'Encrypted marital conflict chat transcript regarding emotional withdrawal and work fatigue', 
    title: 'Discourse Archive #842 (WhatsApp)',
    subtitle: 'Silent Withdrawal & Cognitive Exhaustion Dyad' 
  },
  { 
    src: '/images/participant-2.jpg', 
    alt: 'Qualitative video interview recording of male participant with webcam privacy blur', 
    title: 'Participant #52 • Qualitative Reflection',
    subtitle: 'Husband (Dual-Earner Dyad) • Real-Time Face Redaction' 
  },
  { 
    src: '/images/chat-2.png', 
    alt: 'Encrypted marital communication log regarding in-law family friction and loyalty strain', 
    title: 'Discourse Archive #612 (WhatsApp)',
    subtitle: 'In-Law Boundary Tension & Dual-Earner Pressure' 
  },
  { 
    src: '/images/participant-3.jpg', 
    alt: 'Semi-structured interview session of male participant with frosted anonymity blur', 
    title: 'Participant #78 • In-Depth Reflection',
    subtitle: 'Husband (8-Yr Marriage) • Frosted Anonymity Protocol' 
  },
  { 
    src: '/images/chat-3.png', 
    alt: 'Encrypted marital text log regarding unshared parental mental load and exhaustion', 
    title: 'Discourse Archive #189 (WhatsApp)',
    subtitle: 'Unshared Parental Mental Load & Resentment' 
  }
];

interface LandingPageProps {
  onBegin: () => void;
  onOpenWithdrawal: () => void;
  onOpenCrisis: () => void;
  onOpenAppointment?: () => void;
  onOpenPrivacy?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onBegin,
  onOpenWithdrawal,
  onOpenCrisis,
  onOpenAppointment,
  onOpenPrivacy
}) => {
  return (
    <div className="relative overflow-hidden w-full">
      
      {/* ----------------- INSTITUTIONAL AFFILIATION MASTHEAD ----------------- */}
      <div className="bg-[#121212] text-white border-b-2 border-black py-2.5 px-4 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 font-mono text-[11px] text-gray-300">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></span>
            <span>UNIVERSITY CONSORTIUM FOR FAMILY RESILIENCE & RELATIONAL SCIENCE</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400">
            <span>IRB Protocol: <strong className="text-[#FFE600]">#IRB-2026-SP84</strong></span>
            <span>•</span>
            <span className="text-gray-300">Cloudflare D1 Verified</span>
          </div>
        </div>
      </div>

      <section className="pt-6 sm:pt-10 pb-14 sm:pb-20 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 sm:space-y-12">
        
        {/* ----------------- HERO SECTION ----------------- */}
        <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-6">
          
          {/* Institutional Crest & Research Badges */}
          <div className="flex justify-center mb-1">
            <Logo variant="mark" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 neo-badge bg-[#FFE600] text-[#121212] text-xs font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <GraduationCap className="w-4 h-4 text-[#FF5A36] shrink-0" />
            <span>Doctoral Qualitative Dissertation Research • IRB #2026-SP84</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black text-[#121212] tracking-tight leading-[1.12]">
            Lived Experiences of <br />
            <span className="relative inline-block bg-[#FF5A36] text-white px-3.5 py-1 rounded-2xl neo-badge -rotate-1 mt-1 border-2 border-black shadow-[3px_3px_0px_0px_#000]">
              Spousal Pressure
            </span>{' '}
            & Relational Coping
          </h1>

          {/* Scientific Abstract / Mission Statement */}
          <p className="text-xs sm:text-base md:text-lg text-gray-700 font-medium leading-relaxed max-w-2xl mx-auto px-2">
            An Institutional Review Board approved qualitative inquiry investigating how married individuals navigate marital expectations, unspoken strain, and coping mechanisms. 
            Contribute an asynchronous, self-paced reflection diary with <strong>real-time client-side face blurring</strong>.
          </p>

          {/* Core Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs font-bold">
            <span className="neo-badge bg-white text-gray-900 px-3 py-1 flex items-center gap-1.5 border-2 border-black">
              <EyeOff className="w-3.5 h-3.5 text-[#1E7E52]" />
              <span>Real-Time Face Blurring</span>
            </span>
            <span className="neo-badge bg-white text-gray-900 px-3 py-1 flex items-center gap-1.5 border-2 border-black">
              <Lock className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Decoupled Storage (D1)</span>
            </span>
            <span className="neo-badge bg-white text-gray-900 px-3 py-1 flex items-center gap-1.5 border-2 border-black">
              <Clock className="w-3.5 h-3.5 text-[#FF5A36]" />
              <span>15–20 Min Self-Paced</span>
            </span>
            <span className="neo-badge bg-white text-gray-900 px-3 py-1 flex items-center gap-1.5 border-2 border-black">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E7E52]" />
              <span>Unconditional Right to Purge</span>
            </span>
            {onOpenPrivacy && (
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="neo-badge bg-[#FFEFEA] text-[#9A3412] px-3 py-1 flex items-center gap-1.5 border-2 border-black hover:bg-[#FFD9CC] transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF5A36]" />
                <span className="underline font-black">Academic Privacy Policy (#IRB-2026-SP84)</span>
              </button>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-lg mx-auto sm:max-w-none">
            <button
              onClick={onBegin}
              className="w-full sm:w-auto neo-btn bg-[#FF5A36] text-white px-8 py-4 text-xs sm:text-base font-black flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000] hover:scale-[1.02] transition-transform"
            >
              <span>Begin Confidential Participation</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {onOpenAppointment && (
              <button
                onClick={onOpenAppointment}
                className="w-full sm:w-auto neo-btn bg-[#FFE600] text-black px-5 py-4 text-xs sm:text-sm flex items-center justify-center gap-2 font-black shadow-[3px_3px_0px_0px_#000]"
              >
                <Calendar className="w-4 h-4 text-black" />
                <span>1-on-1 Interview / Expressing</span>
              </button>
            )}

            <button
              onClick={onOpenCrisis}
              className="w-full sm:w-auto neo-btn bg-[#FFFDF7] text-[#9A3412] px-5 py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-2 border-black shadow-[2px_2px_0px_0px_#000]"
            >
              <Heart className="w-4 h-4 text-[#FF5A36]" />
              <span>24/7 Crisis Support (988)</span>
            </button>
          </div>

          {/* Lookup prior submission */}
          <div>
            <button
              onClick={onOpenWithdrawal}
              className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-black font-bold underline underline-offset-4"
            >
              <Search className="w-3.5 h-3.5 text-[#FF5A36]" />
              <span>Already participated? Lookup or permanently purge your #SUB-XXXX receipt</span>
            </button>
          </div>
        </div>

        {/* ----------------- EMPIRICAL QUALITATIVE ARCHIVE & PARTICIPANT CAROUSEL ----------------- */}
        <div className="neo-card p-4 sm:p-7 bg-[#FFFDF7] border-2 border-black space-y-4 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b-2 border-gray-100 pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="neo-badge bg-[#FFE600] text-black text-[10px] px-2.5 py-0.5 font-mono">
                  Empirical Qualitative Telemetry
                </span>
                <span className="neo-badge bg-[#D4EDDA] text-[#1E7E52] text-[10px] px-2 py-0.5 font-bold">
                  IRB Protocol #2026-SP84
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-900">
                Lived Experience Archive: Field Transcripts & Blurred Video Feeds
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-2xl font-medium">
                Drag, swipe or scroll horizontally to inspect authentic participant interview recordings (with real-time facial privacy blurring) alongside anonymized marital conflict chat transcripts submitted to the doctoral research corpus.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#FF5A36] animate-pulse"></span>
              <span>DRAG / SCROLL TO EXPLORE</span>
            </div>
          </div>

          {/* Liquid FlexCarousel Container */}
          <div className="w-full rounded-2xl overflow-hidden border-2 border-black bg-[#0d1317] shadow-[inset_0_2px_12px_rgba(0,0,0,0.5)]">
            <div style={{ width: '100%', height: '560px', position: 'relative' }}>
              <FlexCarousel
                items={CAROUSEL_ITEMS}
                preset="liquid"
                intro="rise"
                cardHeight={0.5}
                gap={12}
                squeeze={0.2}
                focusOnClick
                captions
                fit="natural"
                radius={0}
                lensWidth={0.74}
                lensHeight={1.18}
                tilt={62}
                roundness={1}
                bend={0.34}
                reach={0.38}
                curl="twist"
                dispersion={0.45}
                liquid={0}
                followCursor={false}
                autoplay={false}
                interval={4}
                captureWheel
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 pt-1 font-mono">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#1E7E52]"></span>
              <span>Client-Side WebGL Liquid Dispersion Pass • 60 FPS GPU Accelerated</span>
            </div>
            <span>Click any card to center and enlarge • Arrow keys & mouse wheel supported</span>
          </div>
        </div>

        {/* ----------------- 3 CORE INSTITUTIONAL GUARANTEES ----------------- */}
        <div className="space-y-4 pt-2">
          <div className="text-center space-y-1">
            <span className="neo-badge bg-[#E8EEFF] text-[#3B82F6] text-[10px] px-2.5 py-0.5 font-mono">
              Participant Protection Standards
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900">
              Three Guarantees of Human Subjects Privacy
            </h2>
            <p className="text-xs text-gray-600 max-w-xl mx-auto">
              Our university ethics protocol requires cryptographic separation between your identity and your qualitative reflections.
            </p>
            {onOpenPrivacy && (
              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="neo-btn bg-white hover:bg-gray-50 text-[#0051C3] px-3.5 py-1.5 text-xs font-black inline-flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                >
                  <FileCheck className="w-3.5 h-3.5 text-[#0051C3]" />
                  <span>Review Academic Privacy Policy & Research Governance Protocol</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
            
            <div className="neo-card p-6 space-y-3 bg-[#FFFDF7] border-2 border-black flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl neo-card bg-[#D4EDDA] text-[#1E7E52] flex items-center justify-center border-2 border-black">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-black text-lg text-gray-900">
                  1. Real-Time Face Blurring
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Using TensorFlow BlazeFace neural computer vision, your webcam stream is continuously tracked and redacted directly inside your web browser. <strong>Raw, unblurred video frames never leave your local device.</strong>
                </p>
              </div>
              <div className="pt-2">
                <span className="neo-badge bg-[#D4EDDA] text-[#1E7E52] text-[10px] px-2.5 py-1 inline-flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 0 raw frames uploaded
                </span>
              </div>
            </div>

            <div className="neo-card p-6 space-y-3 bg-[#FFEFEA] border-2 border-black flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl neo-card bg-[#FF5A36] text-white flex items-center justify-center border-2 border-black">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-black text-lg text-gray-900">
                  2. Decoupled Storage Architecture
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Your email is collected exclusively to prevent automated bots and spam. In Cloudflare D1, verified emails are stored in an isolated authentication table with <strong>zero relational foreign keys</strong> to your narrative video diaries.
                </p>
              </div>
              <div className="pt-2">
                <span className="neo-badge bg-white text-[#9A3412] text-[10px] px-2.5 py-1 inline-flex items-center gap-1 font-mono font-bold">
                  #SUB-XXXX Token Isolation
                </span>
              </div>
            </div>

            <div className="neo-card p-6 space-y-3 bg-[#FFFDF7] border-2 border-black flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl neo-card bg-[#E8EEFF] text-[#3B82F6] flex items-center justify-center border-2 border-black">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-black text-lg text-gray-900">
                  3. Self-Serve Right to Purge
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Under university research ethics guidelines, participation is 100% voluntary. You receive a confidential receipt code to permanently erase your recording and notes from the university repository at any point within 90 days.
                </p>
              </div>
              <div className="pt-2">
                <span className="neo-badge bg-[#E8EEFF] text-[#3B82F6] text-[10px] px-2.5 py-1 inline-flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 24/7 Instant Withdrawal
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ----------------- 4-STAGE PARTICIPATION ROADMAP ----------------- */}
        <div className="neo-card p-6 sm:p-8 bg-[#FFFDF7] border-2 border-black space-y-6">
          <div className="text-center space-y-1">
            <span className="neo-badge bg-[#FFE600] text-black text-[10px] px-2.5 py-0.5 font-mono">
              Participant Journey
            </span>
            <h2 className="text-2xl font-serif font-black text-gray-900">
              How Participation Works (4 Simple Steps)
            </h2>
            <p className="text-xs text-gray-600">The entire asynchronous reflection requires approximately 15–20 minutes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl neo-card-sm bg-white border-2 border-black space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-[#121212] text-white flex items-center justify-center font-mono font-black text-xs">
                  01
                </span>
                <span className="text-[10px] font-bold text-gray-500 font-mono">30 SECONDS</span>
              </div>
              <h4 className="font-serif font-black text-sm text-gray-900">Eligibility Screening</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Answer 3 quick criteria mandated by IRB (18+ years old, formal marriage experience, willingness to reflect).
              </p>
            </div>

            <div className="p-4 rounded-2xl neo-card-sm bg-white border-2 border-black space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-[#FF5A36] text-white flex items-center justify-center font-mono font-black text-xs">
                  02
                </span>
                <span className="text-[10px] font-bold text-gray-500 font-mono">1 MINUTE</span>
              </div>
              <h4 className="font-serif font-black text-sm text-gray-900">Informed Consent</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Review study scope, confidentiality boundaries, voluntary exit rights, and psychological support contacts.
              </p>
            </div>

            <div className="p-4 rounded-2xl neo-card-sm bg-white border-2 border-black space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-[#FFE600] text-black flex items-center justify-center font-mono font-black text-xs">
                  03
                </span>
                <span className="text-[10px] font-bold text-gray-500 font-mono">30 SECONDS</span>
              </div>
              <h4 className="font-serif font-black text-sm text-gray-900">Email Passcode</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Receive a single-use 6-digit OTP via Gmail to authenticate your device against bot submissions.
              </p>
            </div>

            <div className="p-4 rounded-2xl neo-card-sm bg-[#FFEFEA] border-2 border-black space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-[#1E7E52] text-white flex items-center justify-center font-mono font-black text-xs">
                  04
                </span>
                <span className="text-[10px] font-bold text-[#1E7E52] font-mono">10-15 MIN</span>
              </div>
              <h4 className="font-serif font-black text-sm text-gray-900">Private Reflection</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Enter the fullscreen studio to record your auto-blurred video or audio reflection with guided prompts.
              </p>
            </div>
          </div>
        </div>

        {/* ----------------- GUIDED DISSERTATION PROMPTS ----------------- */}
        <div className="neo-card p-6 sm:p-8 bg-[#FFFDF7] border-2 border-black space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-gray-100 pb-3">
            <div>
              <span className="neo-badge bg-[#FFE600] text-[#121212] text-[10px] px-2.5 py-0.5 font-mono">
                Qualitative Core Inquiries
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-900 mt-1">
                Dissertation Reflection Prompts Preview
              </h2>
            </div>
            <span className="text-xs text-gray-600 font-bold">
              Choose the prompt that resonates most with your lived experience
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl neo-card-sm bg-white border-2 border-black space-y-2 flex flex-col justify-between">
              <div>
                <span className="neo-badge bg-[#FF5A36] text-white text-[10px] px-2 py-0.5 font-mono">
                  PROMPT 01
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 mt-2">
                  "Describe a situation where expectations or pressure placed on you felt overwhelming."
                </h4>
              </div>
              <p className="text-[11px] text-gray-500 italic border-t border-gray-100 pt-2">
                Focus: Domestic duties, career priorities, family obligations, unspoken tensions.
              </p>
            </div>

            <div className="p-4 rounded-2xl neo-card-sm bg-white border-2 border-black space-y-2 flex flex-col justify-between">
              <div>
                <span className="neo-badge bg-[#FF5A36] text-white text-[10px] px-2 py-0.5 font-mono">
                  PROMPT 02
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 mt-2">
                  "How did this situation affect your physical health, mental focus, or daily routine?"
                </h4>
              </div>
              <p className="text-[11px] text-gray-500 italic border-t border-gray-100 pt-2">
                Focus: Somatic strain, sleep disruption, emotional fatigue, cognitive load.
              </p>
            </div>

            <div className="p-4 rounded-2xl neo-card-sm bg-white border-2 border-black space-y-2 flex flex-col justify-between">
              <div>
                <span className="neo-badge bg-[#FF5A36] text-white text-[10px] px-2 py-0.5 font-mono">
                  PROMPT 03
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 mt-2">
                  "What coping strategies did you try, and how did they work in practice?"
                </h4>
              </div>
              <p className="text-[11px] text-gray-500 italic border-t border-gray-100 pt-2">
                Focus: Boundary renegotiation, counseling, internal resilience, personal hobbies.
              </p>
            </div>
          </div>
        </div>

        {/* ----------------- 1-ON-1 INTERVIEW & CATHARSIS ROOM ----------------- */}
        {onOpenAppointment && (
          <div className="neo-card p-6 sm:p-8 bg-[#FFF8F0] border-2 border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-fade-in shadow-[4px_4px_0px_0px_#000]">
            <div className="space-y-2.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="neo-badge bg-[#FFE600] text-black text-[10px] px-2.5 py-0.5 font-mono">
                  Alternative Modality
                </span>
                <span className="neo-badge bg-[#D4EDDA] text-[#1E7E52] text-[10px] px-2 py-0.5 font-bold">
                  100% Confidential
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-gray-900">
                Prefer a Live 1-on-1 Academic Interview or Private Expressing?
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                Rather than asynchronous recording, you can schedule a 45-minute confidential live interview with doctoral researchers (with camera-off or face-blur options), or visit our free-form <strong className="text-black">Catharsis & Expressing Suite</strong> with ambient rain sounds and permanent Burn-and-Release.
              </p>
            </div>

            <button
              onClick={onOpenAppointment}
              className="w-full md:w-auto neo-btn bg-[#FF5A36] text-white px-7 py-4 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shrink-0 shadow-[4px_4px_0px_0px_#000]"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Session or Express</span>
            </button>
          </div>
        )}

        {/* ----------------- INVESTIGATOR & FACULTY OVERSIGHT ----------------- */}
        <div className="neo-card p-6 sm:p-8 bg-white border-2 border-black space-y-5">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#FF5A36]" />
            <h3 className="text-base sm:text-lg font-serif font-black text-gray-900">
              Institutional Supervision & Faculty Contacts
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-black space-y-1">
              <span className="font-black text-gray-900 block text-sm">Principal Investigator</span>
              <p className="font-bold text-gray-800">Maya Lin, M.S.</p>
              <p className="text-gray-600">Doctoral Candidate, Department of Behavioral Sciences</p>
              <p className="text-gray-500 font-mono text-[11px] pt-1">family.resilience.study@university.edu</p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-black space-y-1">
              <span className="font-black text-gray-900 block text-sm">Faculty Dissertation Advisor</span>
              <p className="font-bold text-gray-800">Dr. Evelyn Reed, Ph.D.</p>
              <p className="text-gray-600">Professor of Marital & Relational Systems</p>
              <p className="text-gray-500 font-mono text-[11px] pt-1">evelyn.reed.irb@university.edu</p>
            </div>
          </div>

          {/* Crisis Hotline Banner */}
          <div className="p-4 rounded-xl bg-[#FFEFEA] border-2 border-[#FF5A36] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF5A36] text-white flex items-center justify-center font-black shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-[#9A3412] block">Participant Emotional Safety & 24/7 Crisis Support</span>
                <span className="text-gray-700 font-medium">Reflecting on marital pressure can elicit difficult feelings. Immediate support is available 24/7.</span>
              </div>
            </div>
            <button
              onClick={onOpenCrisis}
              className="neo-btn bg-white text-[#9A3412] border-2 border-black px-4 py-2 text-xs font-black shrink-0 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#FF5A36]" />
              <span>Call / Text 988</span>
            </button>
          </div>
        </div>

      </section>
    </div>
  );
};
