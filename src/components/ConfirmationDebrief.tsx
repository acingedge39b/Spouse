import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Download, 
  HeartHandshake, 
  ShieldCheck, 
  Phone, 
  Home
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Submission } from '../types';

interface ConfirmationProps {
  submission: Submission;
  onHome: () => void;
  onOpenCrisis: () => void;
}

export const ConfirmationDebrief: React.FC<ConfirmationProps> = ({
  submission,
  onHome,
  onOpenCrisis
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FF5A36', '#FFE600', '#34D399', '#3B82F6']
      });
    } catch {}
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(submission.submissionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadReceipt = () => {
    const text = `===================================================
ACADEMIC QUALITATIVE RESEARCH STUDY
PhD Study: Marital Pressures & Coping Mechanisms
IRB Protocol Approval: #IRB-2026-SP84
===================================================

PARTICIPANT CONFIDENTIALITY RECEIPT
---------------------------------------------------
Anonymous Submission Code: ${submission.submissionCode}
Date & Time Recorded:     ${new Date(submission.submittedAt).toLocaleString()}
Media Type:               ${submission.mediaType === 'video_blurred' ? 'Video Diary (Client-Side Blurred)' : 'Audio-Only Diary'}
Duration:                 ${submission.durationSeconds} seconds
Anonymization Filter:     ${submission.blurAlgorithm}
Decoupled Status:         Cryptographically isolated from email verification
Data Retention Period:    90 days from submission date

RIGHT TO RETRACT / WITHDRAW:
Under institutional ethics rules, you hold the unconditional 
right to delete your qualitative submission at any point.
Simply visit the portal and enter your code: ${submission.submissionCode}

ETHICS & INVESTIGATOR CONTACTS:
Principal Investigator: Maya Lin, M.S. (PhD Candidate)
Faculty Advisor: Dr. Evelyn Reed, Ph.D.
Email: family.resilience.study@university.edu
Crisis Support: Call or Text 988 (24/7)
===================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IRB-Receipt-${submission.submissionCode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      
      {/* Success Card */}
      <div className="neo-card bg-[#FFFDF7] p-6 sm:p-10 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl neo-card bg-[#D4EDDA] text-[#1E7E52] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="neo-badge bg-[#D4EDDA] text-[#1E7E52] text-xs px-3 py-1">
            Secure Academic Deposit Confirmed
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-gray-900 mt-2 leading-tight">
            Your Narrative Has Been Encrypted & Uploaded
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-2 max-w-xl mx-auto leading-relaxed">
            Thank you for contributing your lived experience to this inquiry. Your reflections provide vital qualitative depth to our understanding of spousal expectations and relational coping.
          </p>
        </div>

        {/* Participant Reference Code Card */}
        <div className="p-5 rounded-2xl neo-card bg-[#FFEFEA] max-w-md mx-auto space-y-2 border-2 border-black">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-600 block">
            Anonymous Reference Code
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-black text-[#FF5A36] tracking-wider select-all">
            {submission.submissionCode}
          </div>
          <p className="text-[11px] text-gray-600 font-medium">
            Save this code! Use it to withdraw or permanently delete your submission at any time.
          </p>

          <div className="pt-2 flex flex-col xs:flex-row gap-2 justify-center">
            <button
              onClick={handleCopyCode}
              className="neo-btn bg-white text-gray-900 px-4 py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-[#FF5A36]" />
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownloadReceipt}
              className="neo-btn bg-white text-gray-900 px-4 py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Download Receipt</span>
            </button>
          </div>
        </div>

        {/* Technical Privacy Metadata pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left pt-2">
          <div className="p-3 rounded-xl neo-card-sm bg-white">
            <span className="text-[10px] font-black uppercase text-gray-500 block">Redaction</span>
            <span className="text-xs font-bold text-gray-900 mt-0.5 block">
              {submission.mediaType === 'video_blurred' ? 'Canvas Auto-Blur' : 'Encrypted Audio'}
            </span>
          </div>
          <div className="p-3 rounded-xl neo-card-sm bg-white">
            <span className="text-[10px] font-black uppercase text-gray-500 block">Architecture</span>
            <span className="text-xs font-bold text-gray-900 mt-0.5 block">
              Decoupled from Email
            </span>
          </div>
          <div className="p-3 rounded-xl neo-card-sm bg-white">
            <span className="text-[10px] font-black uppercase text-gray-500 block">Retention</span>
            <span className="text-xs font-bold text-gray-900 mt-0.5 block">
              90-Day Full Erasure
            </span>
          </div>
        </div>

      </div>

      {/* Post-Participation Wellbeing */}
      <div className="neo-card bg-[#FFFDF7] p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl neo-card bg-[#FF5A36] text-white flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-black text-lg text-gray-900">
              Post-Participation Wellbeing Protocol
            </h3>
            <p className="text-xs text-gray-600 font-medium mt-0.5 leading-relaxed">
              Sharing relational stress can stir emotions. Free, confidential resources are available 24/7.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <button
            onClick={onOpenCrisis}
            className="neo-btn bg-[#FF5A36] text-white px-5 py-3 text-xs flex items-center justify-center gap-1.5"
          >
            <Phone className="w-4 h-4" />
            <span>Open Crisis Directory & Pacer</span>
          </button>

          <button
            onClick={onHome}
            className="neo-btn bg-white text-gray-900 px-5 py-3 text-xs flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>
        </div>
      </div>

    </div>
  );
};
