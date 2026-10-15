import React, { useState } from 'react';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { ScreeningAnswers } from '../types';

interface ScreeningProps {
  onPass: () => void;
  onFail: () => void;
  onBack: () => void;
}

export const ScreeningQuestionnaire: React.FC<ScreeningProps> = ({
  onPass,
  onFail,
  onBack
}) => {
  const [answers, setAnswers] = useState<ScreeningAnswers>({
    age18Plus: null,
    formalMarriage: null,
    willingToRecord: null,
  });

  const handleSelect = (key: keyof ScreeningAnswers, value: boolean) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const isComplete = answers.age18Plus !== null && answers.formalMarriage !== null && answers.willingToRecord !== null;
  const isEligible = answers.age18Plus === true && answers.formalMarriage === true && answers.willingToRecord === true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;

    if (isEligible) {
      onPass();
    } else {
      onFail();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="neo-btn bg-white px-3 py-1.5 text-xs flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </button>
        <span className="neo-badge bg-[#FFE600] text-[#121212] text-[10px] sm:text-xs px-2.5 py-1">
          Step 1 of 4 • Screening
        </span>
      </div>

      <div className="neo-card bg-[#FFFDF7] p-6 sm:p-8 space-y-6">
        <div>
          <span className="neo-badge bg-[#E8EEFF] text-[#3B82F6] text-[10px] px-2 py-0.5">
            IRB Criteria
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] mt-2">
            Eligibility Screening
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1 leading-relaxed">
            Please answer the 3 criteria mandated by our university Institutional Review Board protocol (#2026-SP84):
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question 1 */}
          <div className="p-4 rounded-2xl neo-card-sm bg-white space-y-2.5">
            <span className="neo-badge bg-[#FF5A36] text-white text-[10px] px-2 py-0.5 font-mono">
              CRITERION 01
            </span>
            <p className="text-xs sm:text-sm font-black text-gray-900 leading-snug">
              Are you 18 years of age or older?
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => handleSelect('age18Plus', true)}
                className={`flex-1 py-3 px-3 neo-btn text-xs sm:text-sm flex items-center justify-center gap-1.5 ${
                  answers.age18Plus === true
                    ? 'bg-[#121212] text-white'
                    : 'bg-[#FAF7F2] text-gray-800'
                }`}
              >
                {answers.age18Plus === true && <Check className="w-4 h-4 text-[#34D399]" />}
                <span>Yes</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('age18Plus', false)}
                className={`flex-1 py-3 px-3 neo-btn text-xs sm:text-sm ${
                  answers.age18Plus === false
                    ? 'bg-[#121212] text-white'
                    : 'bg-[#FAF7F2] text-gray-800'
                }`}
              >
                <span>No</span>
              </button>
            </div>
          </div>

          {/* Question 2 */}
          <div className="p-4 rounded-2xl neo-card-sm bg-white space-y-2.5">
            <span className="neo-badge bg-[#FF5A36] text-white text-[10px] px-2 py-0.5 font-mono">
              CRITERION 02
            </span>
            <p className="text-xs sm:text-sm font-black text-gray-900 leading-snug">
              Are you currently or have you previously been in a formal marriage?
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => handleSelect('formalMarriage', true)}
                className={`flex-1 py-3 px-3 neo-btn text-xs sm:text-sm flex items-center justify-center gap-1.5 ${
                  answers.formalMarriage === true
                    ? 'bg-[#121212] text-white'
                    : 'bg-[#FAF7F2] text-gray-800'
                }`}
              >
                {answers.formalMarriage === true && <Check className="w-4 h-4 text-[#34D399]" />}
                <span>Yes</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('formalMarriage', false)}
                className={`flex-1 py-3 px-3 neo-btn text-xs sm:text-sm ${
                  answers.formalMarriage === false
                    ? 'bg-[#121212] text-white'
                    : 'bg-[#FAF7F2] text-gray-800'
                }`}
              >
                <span>No</span>
              </button>
            </div>
          </div>

          {/* Question 3 */}
          <div className="p-4 rounded-2xl neo-card-sm bg-white space-y-2.5">
            <span className="neo-badge bg-[#FF5A36] text-white text-[10px] px-2 py-0.5 font-mono">
              CRITERION 03
            </span>
            <p className="text-xs sm:text-sm font-black text-gray-900 leading-snug">
              Are you willing to record your reflection via asynchronous audio or face-blurred video?
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => handleSelect('willingToRecord', true)}
                className={`flex-1 py-3 px-3 neo-btn text-xs sm:text-sm flex items-center justify-center gap-1.5 ${
                  answers.willingToRecord === true
                    ? 'bg-[#121212] text-white'
                    : 'bg-[#FAF7F2] text-gray-800'
                }`}
              >
                {answers.willingToRecord === true && <Check className="w-4 h-4 text-[#34D399]" />}
                <span>Yes</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('willingToRecord', false)}
                className={`flex-1 py-3 px-3 neo-btn text-xs sm:text-sm ${
                  answers.willingToRecord === false
                    ? 'bg-[#121212] text-white'
                    : 'bg-[#FAF7F2] text-gray-800'
                }`}
              >
                <span>No</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!isComplete}
              className={`w-full py-4 neo-btn text-white text-sm sm:text-base flex items-center justify-center gap-2 ${
                isComplete
                  ? 'bg-[#FF5A36] shadow-[4px_4px_0px_0px_#000]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400 shadow-none'
              }`}
            >
              <span>Continue to Consent</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
