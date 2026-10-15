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
import { isUserAlreadyVerified } from './lib/storage';

export function App() {
  const [currentStep, setCurrentStep] = useState<StudyStep>('landing');
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [isInvestigatorMode, setIsInvestigatorMode] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<Submission | null>(null);

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

  const isVerified = isUserAlreadyVerified();

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#121212] flex flex-col font-sans selection:bg-[#FF5A36]/25 selection:text-[#FF5A36]">
      {/* Top Header */}
      <Header
        currentStep={currentStep}
        onNavigate={handleStepNavigation}
        onOpenCrisis={() => setIsCrisisOpen(true)}
        onOpenWithdrawal={() => setIsWithdrawalOpen(true)}
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
                onBegin={() => handleStepNavigation(isVerified ? 'recording' : 'screening')}
                onJumpToRecording={() => handleStepNavigation('recording')}
                onOpenWithdrawal={() => setIsWithdrawalOpen(true)}
                onOpenCrisis={() => setIsCrisisOpen(true)}
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
                onAgree={() => handleStepNavigation(isVerified ? 'recording' : 'otp')}
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
              <div className="w-6 h-6 rounded-lg neo-card bg-[#FF5A36] text-white flex items-center justify-center font-black text-xs">
                Ψ
              </div>
              <span>
                Doctoral Qualitative Research Project • Institutional Review Board Protocol #2026-SP84
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button
                onClick={() => setIsCrisisOpen(true)}
                className="text-[#FF5A36] font-extrabold hover:underline"
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
                onClick={() => setIsInvestigatorMode(!isInvestigatorMode)}
                className="hover:text-black underline"
              >
                Investigator Login
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
    </div>
  );
}

export default App;
