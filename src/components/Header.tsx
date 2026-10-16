import React, { useState } from 'react';
import { HeartHandshake, Trash2, Home, Menu, X, Calendar } from 'lucide-react';
import { StudyStep } from '../types';
import { Logo } from './Logo';

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
        
        {/* Academic Brand Identity & Official Emblem */}
        <Logo 
          variant="full" 
          onClick={() => {
            setMobileMenuOpen(false);
            onNavigate('landing');
          }} 
        />

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

          {/* Show Exit Admin button only when already in admin mode */}
          {isInvestigatorMode && (
            <button
              onClick={onOpenInvestigator}
              className="neo-btn bg-[#121212] text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
            >
              <span>Exit Admin</span>
            </button>
          )}

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
