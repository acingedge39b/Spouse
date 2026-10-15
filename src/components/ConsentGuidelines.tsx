import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { ConsentAgreements } from '../types';

interface ConsentProps {
  onAgree: () => void;
  onBack: () => void;
}

export const ConsentGuidelines: React.FC<ConsentProps> = ({ onAgree, onBack }) => {
  const [agreements, setAgreements] = useState<ConsentAgreements>({
    academicUse: false,
    voluntaryExit: false,
    noLegalNames: false,
  });

  const toggleAgreement = (key: keyof ConsentAgreements) => {
    setAgreements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allAgreed = agreements.academicUse && agreements.voluntaryExit && agreements.noLegalNames;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Progress header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="neo-btn bg-white px-3 py-1.5 text-xs flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <span className="neo-badge bg-[#FFE600] text-[#121212] text-[10px] sm:text-xs px-2.5 py-1">
          Step 2 of 4 • Consent
        </span>
      </div>

      <div className="neo-card bg-[#FFFDF7] p-6 sm:p-8 space-y-6">
        <div>
          <span className="neo-badge bg-[#D4EDDA] text-[#1E7E52] text-[10px] px-2 py-0.5">
            IRB Approved Protocol #2026-SP84
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] mt-2">
            Digital Informed Consent
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1 leading-relaxed">
            Please review the academic ethical principles before proceeding to recording:
          </p>
        </div>

        {/* Scrollable Container */}
        <div className="max-h-52 overflow-y-auto irb-scroll neo-card-sm bg-white p-4 text-xs text-gray-700 space-y-3 leading-relaxed border-2 border-black">
          <div>
            <h3 className="font-black text-gray-900 uppercase text-[11px]">
              1. Research Objective
            </h3>
            <p className="mt-0.5">
              Doctoral study examining spousal expectations, perceived emotional pressure, somatic strain, and coping mechanisms.
            </p>
          </div>

          <div>
            <h3 className="font-black text-gray-900 uppercase text-[11px]">
              2. Voluntary Participation & Right to Purge
            </h3>
            <p className="mt-0.5">
              Participation is 100% voluntary. You receive an anonymous #SUB token allowing unconditional data retraction anytime.
            </p>
          </div>

          <div>
            <h3 className="font-black text-gray-900 uppercase text-[11px]">
              3. Client-Side Video Anonymization
            </h3>
            <p className="mt-0.5">
              Face blurring happens strictly client-side via HTML5 Canvas before recording. Unblurred footage never reaches servers.
            </p>
          </div>

          <div>
            <h3 className="font-black text-gray-900 uppercase text-[11px]">
              4. Psychological Care
            </h3>
            <p className="mt-0.5">
              Free 24/7 crisis hotlines and grounding pacer are accessible across all pages.
            </p>
          </div>
        </div>

        {/* Critical Notice */}
        <div className="neo-card-sm bg-[#FFEFEA] p-4 flex items-start gap-3 border-2 border-black">
          <AlertTriangle className="w-5 h-5 text-[#FF5A36] shrink-0 mt-0.5" />
          <div className="text-xs text-[#9A3412] leading-relaxed">
            <span className="font-black">CRITICAL ETHICAL MANDATE:</span> For third-party protection, <span className="font-bold underline">do NOT speak real legal names</span> of your spouse, children, family members, or employer.
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 pt-1">
          <label className="flex items-start gap-3 p-3.5 rounded-xl neo-card-sm bg-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreements.academicUse}
              onChange={() => toggleAgreement('academicUse')}
              className="mt-0.5 w-4 h-4 rounded border-2 border-black accent-[#FF5A36] cursor-pointer shrink-0"
            />
            <span className="text-xs text-gray-900 font-bold leading-snug">
              I consent to the voluntary use of my recorded narrative for academic PhD research and publication of anonymized excerpts.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl neo-card-sm bg-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreements.voluntaryExit}
              onChange={() => toggleAgreement('voluntaryExit')}
              className="mt-0.5 w-4 h-4 rounded border-2 border-black accent-[#FF5A36] cursor-pointer shrink-0"
            />
            <span className="text-xs text-gray-900 font-bold leading-snug">
              I understand that participation is completely voluntary and I can exit or retract at any point.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl neo-card-sm bg-[#FFEFEA] cursor-pointer select-none border-2 border-black">
            <input
              type="checkbox"
              checked={agreements.noLegalNames}
              onChange={() => toggleAgreement('noLegalNames')}
              className="mt-0.5 w-4 h-4 rounded border-2 border-black accent-[#FF5A36] cursor-pointer shrink-0"
            />
            <span className="text-xs text-[#9A3412] font-black leading-snug">
              CRITICAL NOTICE: I agree NOT to mention real legal names of my spouse, children, family members, or specific employer.
            </span>
          </label>
        </div>

        {/* Action button */}
        <div className="pt-2">
          <button
            onClick={onAgree}
            disabled={!allAgreed}
            className={`w-full py-4 neo-btn text-white text-sm sm:text-base flex items-center justify-center gap-2 ${
              allAgreed
                ? 'bg-[#FF5A36] shadow-[4px_4px_0px_0px_#000]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400 shadow-none'
            }`}
          >
            <span>Agree & Continue to Verification</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
