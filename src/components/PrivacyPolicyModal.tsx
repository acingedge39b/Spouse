import React from 'react';
import { ShieldCheck, X, FileText, Lock, EyeOff, Award, Heart, PhoneCall, Trash2 } from 'lucide-react';
import { Logo } from './Logo';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCrisis: () => void;
  onOpenWithdrawal?: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  onOpenCrisis,
  onOpenWithdrawal
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FFFDF7] rounded-3xl neo-card p-0 overflow-hidden flex flex-col max-h-[90vh] border-2 border-black">
        
        {/* Header */}
        <div className="bg-[#FFEFEA] border-b-2 border-black px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="mark" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black font-serif text-[#121212]">
                  Academic Privacy Policy & Data Governance
                </h3>
                <span className="neo-badge bg-[#FFE600] text-black text-[9px] px-2 py-0.5 font-mono">
                  #IRB-2026-SP84
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-700 font-bold">
                Institutional Review Board Human Behavioral Research Compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="neo-btn bg-white p-1.5 text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs text-gray-700 leading-relaxed font-medium">
          
          {/* Section 1: Non-Commercial Academic Use */}
          <div className="p-4 rounded-2xl bg-white border-2 border-black space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FF5A36]" />
              <h4 className="font-serif font-black text-sm text-gray-900">
                1. Purely Academic & Non-Commercial Research Mandate
              </h4>
            </div>
            <p>
              This qualitative research portal is operated exclusively for non-commercial, scholarly research as part of a doctoral dissertation in the Department of Behavioral Sciences and Family Resilience Consortium.
            </p>
            <p className="font-bold text-[#9A3412] bg-[#FFEFEA] p-2.5 rounded-xl border border-[#FF5A36]/30">
              Your narrative reflections and data will NEVER be sold, licensed, monetized, shared with third-party commercial data brokers, or used for advertising.
            </p>
          </div>

          {/* Section 2: Biometric Privacy & In-Browser Face Blurring */}
          <div className="p-4 rounded-2xl bg-white border-2 border-black space-y-2">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-[#1E7E52]" />
              <h4 className="font-serif font-black text-sm text-gray-900">
                2. Client-Side Face Anonymization Guarantee
              </h4>
            </div>
            <p>
              To protect your visual identity, real-time facial feature tracking (using in-browser TensorFlow BlazeFace machine learning) executes on your client device’s HTML5 Canvas. The blur algorithm redacts your facial features <strong>before</strong> the video stream is encoded.
            </p>
            <p className="text-gray-600 italic">
              Unblurred webcam footage never leaves your personal browser memory and is never transmitted over any server or cloud network.
            </p>
          </div>

          {/* Section 3: Decoupled Email Storage */}
          <div className="p-4 rounded-2xl bg-white border-2 border-black space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#3B82F6]" />
              <h4 className="font-serif font-black text-sm text-gray-900">
                3. Decoupled Email Bot-Prevention Architecture
              </h4>
            </div>
            <p>
              Your email address is collected solely for automated bot prevention and single-use passcode (OTP) verification. In our Cloudflare D1 serverless database, verified email records are maintained in an isolated authentication table with <strong>zero relational foreign keys or joins</strong> to your qualitative narrative diaries.
            </p>
            <p>
              Your reflections are indexed exclusively by an anonymous, pseudonymous identifier code (e.g. <span className="font-mono font-bold text-black">#SUB-XXXX</span>).
            </p>
          </div>

          {/* Section 4: Participant Right to Withdraw */}
          <div className="p-4 rounded-2xl bg-[#FFF8F0] border-2 border-black space-y-2">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#EF4444]" />
              <h4 className="font-serif font-black text-sm text-gray-900">
                4. Self-Serve Right to Unconditionally Withdraw
              </h4>
            </div>
            <p>
              Under university human subjects protections, your participation is 100% voluntary. You hold the unconditional right to erase your qualitative video or audio submission and all associated prompt notes at any time within 90 days.
            </p>
            {onOpenWithdrawal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenWithdrawal();
                }}
                className="neo-btn bg-white text-black px-3 py-1.5 text-xs font-bold border border-black"
              >
                Access Self-Serve Withdrawal Tool ➔
              </button>
            )}
          </div>

          {/* Section 5: Data Retention & Encryption */}
          <div className="p-4 rounded-2xl bg-white border-2 border-black space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-700" />
              <h4 className="font-serif font-black text-sm text-gray-900">
                5. Serverless Cloudflare D1 Encryption & Retention Period
              </h4>
            </div>
            <p>
              Data is stored in Cloudflare D1 with AES-256 encryption at rest and TLS 1.3 transit encryption. The research retention period is 90 days post-collection, after which data is archived in compliance with academic open-science anonymization benchmarks.
            </p>
          </div>

          {/* Section 6: Contacts & Crisis Support */}
          <div className="p-4 rounded-2xl bg-[#FFEFEA] border-2 border-black space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#FF5A36]" />
              <h4 className="font-serif font-black text-sm text-gray-900">
                6. Ethics Oversight & 24/7 Crisis Assistance
              </h4>
            </div>
            <p>
              If participating in this reflection brings up distress, please access free, confidential 24/7 support by calling or texting <strong className="text-black">988</strong> (Suicide & Crisis Lifeline).
            </p>
            <div className="pt-1 text-[11px] text-gray-600">
              <p>Principal Investigator: Maya Lin, M.S. (family.resilience.study@university.edu)</p>
              <p>Faculty Dissertation Advisor: Dr. Evelyn Reed, Ph.D. (evelyn.reed.irb@university.edu)</p>
              <p>University IRB Protocol Number: #IRB-2026-SP84</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#FAF7F2] border-t-2 border-black p-4 flex items-center justify-between">
          <button
            onClick={onOpenCrisis}
            className="neo-btn bg-white text-[#9A3412] px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#FF5A36]" />
            <span>Crisis Support (988)</span>
          </button>

          <button
            onClick={onClose}
            className="neo-btn bg-[#FF5A36] text-white px-5 py-2 text-xs font-bold"
          >
            I Understand & Close
          </button>
        </div>

      </div>
    </div>
  );
};
