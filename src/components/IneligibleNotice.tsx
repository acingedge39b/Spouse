import React from 'react';
import { HeartHandshake, Phone, ArrowLeft, Shield } from 'lucide-react';

interface IneligibleNoticeProps {
  onBackToStart: () => void;
  onOpenCrisis: () => void;
}

export const IneligibleNotice: React.FC<IneligibleNoticeProps> = ({
  onBackToStart,
  onOpenCrisis
}) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="neo-card bg-[#FFFDF7] p-6 sm:p-10 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl neo-card bg-[#FFEFEA] text-[#FF5A36] flex items-center justify-center mx-auto">
          <HeartHandshake className="w-8 h-8" />
        </div>

        <div>
          <span className="neo-badge bg-[#FFE600] text-[#121212] text-xs px-3 py-1">
            Eligibility Notice
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mt-2">
            Thank You for Your Interest
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-3 leading-relaxed">
            Based on the inclusion criteria mandated by university IRB protocol #2026-SP84, you do not currently qualify for this specific qualitative study sample (requires age 18+, experience of formal marriage, and willingness to record an asynchronous reflection).
          </p>
        </div>

        <div className="p-5 rounded-2xl neo-card-sm bg-white text-left space-y-3">
          <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#FF5A36]" />
            Support Resources Are Always Available
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            If you or someone you know is navigating relationship stress, emotional tension, or personal difficulties, free and confidential support is available 24/7.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenCrisis}
              className="w-full py-3 neo-btn bg-[#FF5A36] text-white text-xs flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Open 24/7 Support Directory</span>
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onBackToStart}
            className="neo-btn bg-white text-gray-800 px-5 py-2.5 text-xs inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Study Homepage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
