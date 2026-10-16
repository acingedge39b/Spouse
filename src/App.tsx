import React, { useState } from 'react';
import { StudyStep, Submission } from './types';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { ScreeningQuestionnaire } from './components/ScreeningQuestionnaire';
import { IneligibleNotice } from './components/IneligibleNotice';
import { ConsentGuidelines } from './components/ConsentGuidelines';
import { EmailVerification } from './components/EmailVerification';
import { RecordingRoom } from './components/RecordingRoom';
import { ConfirmationDebrief } from './components/ConfirmationDebrief';
import { CrisisModal } from './components/CrisisModal';
import { WithdrawalModal } from './components/WithdrawalModal';
import { InvestigatorPortal } from './components/InvestigatorPortal';
import { OneOnOneAppointmentModal } from './components/OneOnOneAppointmentModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { ShieldCheck } from 'lucide-react';

export function App() {
  const [currentStep, setCurrentStep] = useState<StudyStep>('landing');
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isInvestigatorMode, setIsInvestigatorMode] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<Submission | null>(null);

  // Hidden admin access: URL ?admin=true or #admin, or Ctrl+Shift+A
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || window.location.hash === '#admin') {
      setIsInvestigatorMode(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsInvestigatorMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStepNavigation = (step: StudyStep) => {
    setIsInvestigatorMode(false);
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmissionComplete = (submission: Submission) => {
    setLastSubmission(submission);
    setCurrentStep('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#121212] flex flex-col font-sans selection:bg-[#FF5A36]/25 selection:text-[#FF5A36]">
      {/* Top Header */}
      <Header
        currentStep={currentStep}
        onNavigate={handleStepNavigation}
        onOpenCrisis={() => setIsCrisisOpen(true)}
        onOpenWithdrawal={() => setIsWithdrawalOpen(true)}
        onOpenAppointment={() => setIsAppointmentOpen(true)}
        onOpenInvestigator={() => setIsInvestigatorMode(!isInvestigatorMode)}
        isInvestigatorMode={isInvestigatorMode}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isInvestigatorMode ? (
          <InvestigatorPortal onBackToApp={() => setIsInvestigatorMode(false)} />
        ) : (
          <>
            {currentStep === 'landing' && (
              <LandingPage
                onBegin={() => handleStepNavigation('screening')}
                onOpenWithdrawal={() => setIsWithdrawalOpen(true)}
                onOpenCrisis={() => setIsCrisisOpen(true)}
                onOpenAppointment={() => setIsAppointmentOpen(true)}
                onOpenPrivacy={() => setIsPrivacyOpen(true)}
              />
            )}

            {currentStep === 'screening' && (
              <ScreeningQuestionnaire
                onPass={() => handleStepNavigation('consent')}
                onFail={() => handleStepNavigation('ineligible')}
                onBack={() => handleStepNavigation('landing')}
              />
            )}

            {currentStep === 'ineligible' && (
              <IneligibleNotice
                onBackToStart={() => handleStepNavigation('landing')}
                onOpenCrisis={() => setIsCrisisOpen(true)}
              />
            )}

            {currentStep === 'consent' && (
              <ConsentGuidelines
                onAgree={() => handleStepNavigation('otp')}
                onBack={() => handleStepNavigation('screening')}
              />
            )}

            {currentStep === 'otp' && (
              <EmailVerification
                onVerified={() => handleStepNavigation('recording')}
                onBack={() => handleStepNavigation('consent')}
              />
            )}

            {currentStep === 'recording' && (
              <RecordingRoom
                onSubmitted={handleSubmissionComplete}
                onOpenCrisis={() => setIsCrisisOpen(true)}
                onExit={() => handleStepNavigation('landing')}
              />
            )}

            {currentStep === 'confirmation' && lastSubmission && (
              <ConfirmationDebrief
                submission={lastSubmission}
                onHome={() => handleStepNavigation('landing')}
                onOpenCrisis={() => setIsCrisisOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      {currentStep !== 'recording' && (
        <footer className="mt-auto border-t-2 border-black bg-white py-6 px-4 text-xs font-semibold text-gray-700">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Discreet click trigger for academic faculty & investigator access */}
              <div
                onClick={() => setIsInvestigatorMode(!isInvestigatorMode)}
                className="w-6 h-6 rounded-lg neo-card bg-[#FF5A36] text-white flex items-center justify-center font-black text-xs cursor-pointer select-none hover:opacity-90"
                title="Institutional Review Board Protocol #2026-SP84"
              >
                Ψ
              </div>
              <span>
                Doctoral Qualitative Research Project • Institutional Review Board Protocol #2026-SP84
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button
                onClick={() => setIsAppointmentOpen(true)}
                className="text-[#FF5A36] font-extrabold hover:underline flex items-center gap-1"
              >
                1-on-1 & Expressing Room
              </button>
              <span>•</span>
              <button
                onClick={() => setIsCrisisOpen(true)}
                className="text-gray-800 font-extrabold hover:underline"
              >
                24/7 Crisis Support
              </button>
              <span>•</span>
              <button
                onClick={() => setIsWithdrawalOpen(true)}
                className="hover:text-black underline"
              >
                Withdraw #SUB Code
              </button>
              <span>•</span>
              <button
                onClick={() => setIsPrivacyOpen(true)}
                className="text-gray-800 font-extrabold hover:text-[#0051C3] hover:underline flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E7E52]" />
                <span>Academic Privacy & Data Governance</span>
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Modals */}
      <CrisisModal
        isOpen={isCrisisOpen}
        onClose={() => setIsCrisisOpen(false)}
      />

      <WithdrawalModal
        isOpen={isWithdrawalOpen}
        onClose={() => setIsWithdrawalOpen(false)}
      />

      <OneOnOneAppointmentModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        onOpenCrisis={() => setIsCrisisOpen(true)}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        onOpenCrisis={() => setIsCrisisOpen(true)}
        onOpenWithdrawal={() => setIsWithdrawalOpen(true)}
      />
    </div>
  );
}

export default App;
