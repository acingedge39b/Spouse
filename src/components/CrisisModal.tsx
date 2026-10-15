import React, { useState, useEffect } from 'react';
import { Phone, ExternalLink, X, ShieldAlert, Sparkles, Wind } from 'lucide-react';
import { CrisisHelpline } from '../types';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HELPLINES: CrisisHelpline[] = [
  {
    name: '988 Suicide & Crisis Lifeline',
    number: '988',
    text: '988',
    description: 'Free, confidential support available 24/7 across the United States and Canada.',
    hours: '24/7 / 365 Days',
    country: 'United States & Canada',
    badge: 'Immediate Call or Text',
    url: 'https://988lifeline.org'
  },
  {
    name: 'Crisis Text Line',
    number: '741741',
    text: 'HOME to 741741',
    description: 'Connect with a crisis counselor over confidential SMS text message.',
    hours: '24/7 Free',
    country: 'US, UK, & Canada',
    badge: 'Text-Only Support',
    url: 'https://www.crisistextline.org'
  },
  {
    name: 'National Domestic Violence Hotline',
    number: '1-800-799-7233',
    text: 'Text "START" to 88788',
    description: 'Highly confidential advocacy, safety planning, and emotional support for relationship distress.',
    hours: '24/7 Confidential',
    country: 'United States',
    badge: 'Relationship Safety',
    url: 'https://www.thehotline.org'
  },
  {
    name: 'Samaritans UK & Ireland',
    number: '116 123',
    description: 'Round-the-clock non-judgmental listening service for anyone struggling to cope.',
    hours: '24/7 Free',
    country: 'United Kingdom',
    badge: 'Emotional Listening',
    url: 'https://www.samaritans.org'
  },
  {
    name: 'Lifeline Australia',
    number: '13 11 14',
    text: 'Text 0477 13 11 14',
    description: 'National charity providing all Australians experiencing emotional distress with 24-hour crisis support.',
    hours: '24/7 Free',
    country: 'Australia',
    badge: 'Crisis Support',
    url: 'https://www.lifeline.org.au'
  },
  {
    name: 'International Helpline Directory',
    number: 'Online Directory',
    description: 'Search free, confidential crisis lines in over 130 countries worldwide.',
    hours: 'Free Global Access',
    country: 'International',
    badge: 'Global Directory',
    url: 'https://findahelpline.com'
  }
];

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'hotlines' | 'breathing'>('hotlines');
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [timer, setTimer] = useState(4);

  useEffect(() => {
    if (!isOpen || activeTab !== 'breathing') return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev > 1) return prev - 1;

        setBreathPhase((current) => {
          if (current === 'Inhale') return 'Hold';
          if (current === 'Hold') return 'Exhale';
          if (current === 'Exhale') return 'Rest';
          return 'Inhale';
        });
        return 4;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FFFDF7] rounded-t-3xl sm:rounded-3xl neo-card p-0 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#FFEFEA] border-b-2 border-black px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl neo-card bg-[#FF5A36] text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-xl font-black font-serif text-[#121212] truncate">
                Crisis Support & Care
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-700 font-bold truncate">
                Free, confidential support available 24/7.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="neo-btn bg-white p-1.5 text-gray-800"
            aria-label="Close crisis support"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="px-4 sm:px-6 pt-3 border-b-2 border-black flex gap-2 bg-[#FAF7F2]">
          <button
            onClick={() => setActiveTab('hotlines')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-black border-b-[3px] transition-all flex items-center gap-1.5 ${
              activeTab === 'hotlines'
                ? 'border-[#FF5A36] text-[#FF5A36]'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>24/7 Helplines</span>
          </button>
          <button
            onClick={() => setActiveTab('breathing')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-black border-b-[3px] transition-all flex items-center gap-1.5 ${
              activeTab === 'breathing'
                ? 'border-[#FF5A36] text-[#FF5A36]'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>Grounding Pacer</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto irb-scroll flex-1 space-y-3 sm:space-y-4">
          {activeTab === 'hotlines' ? (
            <>
              <div className="neo-card-sm bg-[#FFE600] p-3 sm:p-4 text-xs font-bold text-gray-900 flex items-start gap-2.5 border-2 border-black">
                <Sparkles className="w-4 h-4 shrink-0 text-[#FF5A36] mt-0.5" />
                <p>
                  Participation is completely voluntary. If reflections feel overwhelming, please pause or step away. These helplines are free, external, and confidential.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {HELPLINES.map((item, idx) => (
                  <div
                    key={idx}
                    className="neo-card-sm bg-white p-3.5 sm:p-4 border-2 border-black flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="neo-badge bg-[#FFEFEA] text-[#9A3412] text-[9px] px-2 py-0.5">
                          {item.badge}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold">{item.country}</span>
                      </div>
                      <h4 className="font-black text-xs sm:text-sm text-gray-900">{item.name}</h4>
                      <p className="text-[11px] text-gray-600 font-medium mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-200 flex items-center justify-between">
                      <a
                        href={item.number.startsWith('http') || item.number.includes('Online') ? item.url : `tel:${item.number.replace(/[^0-9]/g, '')}`}
                        className="font-mono font-black text-xs sm:text-sm text-[#FF5A36] hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{item.number}</span>
                      </a>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-gray-600 hover:text-black font-bold"
                        >
                          <span>Visit</span> <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 sm:py-6 text-center space-y-4">
              <div className="max-w-md">
                <h4 className="text-lg font-black font-serif text-gray-900">Box Breathing (4-4-4-4)</h4>
                <p className="text-xs text-gray-600 font-medium mt-0.5">
                  A calming vagal rhythm to reduce nervous system tension and ground your breath.
                </p>
              </div>

              {/* Animated Pacer Circle with Neobrutalist border */}
              <div className="relative flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48 my-2">
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-1000 neo-card ${
                    breathPhase === 'Inhale'
                      ? 'scale-110 bg-[#D4EDDA]'
                      : breathPhase === 'Hold'
                      ? 'scale-110 bg-[#FFE600]'
                      : breathPhase === 'Exhale'
                      ? 'scale-90 bg-[#E8EEFF]'
                      : 'scale-95 bg-gray-100'
                  }`}
                />
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-xl sm:text-2xl font-black font-serif text-gray-900">{breathPhase}</span>
                  <span className="text-3xl sm:text-4xl font-black text-[#FF5A36] font-mono mt-0.5">{timer}</span>
                  <span className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">seconds</span>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 text-xs text-gray-800 font-bold">
                <span className={breathPhase === 'Inhale' ? 'text-[#1E7E52] underline' : ''}>Inhale 4s</span>
                <span>•</span>
                <span className={breathPhase === 'Hold' ? 'text-[#CA8A04] underline' : ''}>Hold 4s</span>
                <span>•</span>
                <span className={breathPhase === 'Exhale' ? 'text-[#3B82F6] underline' : ''}>Exhale 4s</span>
                <span>•</span>
                <span className={breathPhase === 'Rest' ? 'text-gray-900 underline' : ''}>Rest 4s</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FAF7F2] border-t-2 border-black px-4 sm:px-6 py-3 flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-gray-600 font-bold">
            IRB Protocol #2026-SP84 Safety Protocol
          </span>
          <button
            onClick={onClose}
            className="neo-btn bg-[#121212] text-white px-4 py-2 text-xs"
          >
            I'm Ready
          </button>
        </div>

      </div>
    </div>
  );
};
