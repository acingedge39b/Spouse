import React, { useState } from 'react';
import { HeartHandshake, Database, Trash2, GraduationCap, Home, Menu, X, Calendar, MessageSquare } from 'lucide-react';
import { StudyStep } from '../types';
import { isUserAlreadyVerified, getPersistentVerifiedUser, clearActiveSessionToken } from '../lib/storage';

interface HeaderProps {
  currentStep: StudyStep;
  onNavigate: (step: StudyStep) => void;
  onOpenCrisis: () => void;
  onOpenWithdrawal: () => void;
  onOpenAppointment?: () => void;
  onOpenInvestigator: () => void;
  isInvestigatorMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onNavigate,
  onOpenCrisis,
  onOpenWithdrawal,
  onOpenAppointment,
  onOpenInvestigator,
  isInvestigatorMode = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const alreadyVerified = isUserAlreadyVerified();
  const verifiedUser = getPersistentVerifiedUser();

  const handleClearSession = () => {
    if (confirm('Clear saved login cookie on this device?')) {
      clearActiveSessionToken();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2] border-b-[2.5px] border-[#121212]">
      {/* Top Academic Notice Bar */}
      <div className="bg-[#121212] text-white px-3 sm:px-4 py-1 text-[10px] sm:text-[11px] font-bold">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></span>
            <span className="truncate">IRB Protocol #2026-SP84 • University Behavioral Research Approved</span>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {alreadyVerified && verifiedUser && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                ✓ Saved Session: {verifiedUser.email.slice(0, 14)}...
              </span>
            )}
            <button
              onClick={onOpenWithdrawal}
              className="text-gray-300 hover:text-white underline text-[10px] sm:text-[11px] flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3 text-[#FF5A36]" />
              <span>Withdraw Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        
        {/* Brand identity */}
        <div
          onClick={() => {
            setMobileMenuOpen(false);
            onNavigate('landing');
          }}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl neo-card bg-[#FF5A36] text-white flex items-center justify-center font-black text-base sm:text-lg group-hover:scale-105 transition-transform shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-serif font-black text-sm sm:text-lg md:text-xl text-[#121212] tracking-tight truncate">
                Marital Pressures Study
              </span>
              <span className="neo-badge bg-[#FFE600] text-[#121212] text-[9px] px-1.5 sm:px-2 py-0.2 shrink-0">
                PhD
              </span>
            </div>
            <p className="text-[9px] sm:text-[11px] text-gray-600 font-bold truncate">
              Qualitative Portal • Client-Side Auto-Blurred
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* 1-on-1 & Expressing Button */}
          {onOpenAppointment && (
            <button
              onClick={onOpenAppointment}
              className="neo-btn bg-[#FFE600] text-black px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs flex items-center gap-1.5 font-black hidden sm:flex"
              title="Book 1-on-1 Interview or Open Expressing Space"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>1-on-1 & Expressing</span>
            </button>
          )}

          {/* Prominent Crisis Support Button */}
          <button
            onClick={onOpenCrisis}
            className="neo-btn bg-[#FFEFEA] text-[#9A3412] px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs flex items-center gap-1.5"
            aria-label="Open Crisis Support"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5A36] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5A36]"></span>
            </span>
            <HeartHandshake className="w-3.5 h-3.5 text-[#FF5A36]" />
            <span className="hidden xs:inline">Crisis (24/7)</span>
            <span className="xs:hidden">Help</span>
          </button>

          {/* Investigator Toggle */}
          <button
            onClick={onOpenInvestigator}
            className={`neo-btn hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs ${
              isInvestigatorMode ? 'bg-[#121212] text-white' : 'bg-white text-gray-800'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-[#FF5A36]" />
            <span>Investigator Portal</span>
          </button>

          {currentStep !== 'landing' && !isInvestigatorMode && (
            <button
              onClick={() => onNavigate('landing')}
              className="neo-btn bg-white p-2 text-gray-800"
              title="Return to Overview"
            >
              <Home className="w-4 h-4" />
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden neo-btn bg-white p-2 text-gray-800"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFDF7] border-b-2 border-black px-4 py-3 space-y-2 animate-fade-in text-xs font-bold">
          {alreadyVerified && (
            <div className="p-2.5 rounded-xl neo-card-sm bg-[#D4EDDA] text-[#1E7E52] flex items-center justify-between">
              <span>✓ Cookie Session Remembered</span>
              <button 
                onClick={handleClearSession}
                className="text-[10px] underline text-gray-600 font-normal"
              >
                Clear
              </button>
            </div>
          )}

          {onOpenAppointment && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAppointment();
              }}
              className="w-full py-2.5 px-3 rounded-xl neo-btn bg-[#FFE600] text-black text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-black" />
                Book 1-on-1 Interview / Expressing Room
              </span>
              <span className="neo-badge bg-black text-white text-[9px] px-1.5 py-0.2">
                New
              </span>
            </button>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenInvestigator();
            }}
            className="w-full py-2.5 px-3 rounded-xl neo-btn bg-white text-left flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#FF5A36]" />
              Investigator & Audit Portal
            </span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenWithdrawal();
            }}
            className="w-full py-2.5 px-3 rounded-xl neo-btn bg-white text-left flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              Withdraw Submission by Code
            </span>
          </button>
        </div>
      )}
    </header>
  );
};
