import React, { useState } from 'react';
import { Trash2, X, Search, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { getSubmissionByCodeAsync, withdrawSubmissionAsync } from '../lib/storage';
import { Submission } from '../types';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('');
  const [searchedSub, setSearchedSub] = useState<Submission | null | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsDeleted(false);

    if (!code.trim()) {
      setError('Please provide your #SUB-XXXX code.');
      return;
    }

    setIsSearching(true);
    try {
      const found = await getSubmissionByCodeAsync(code);
      setIsSearching(false);
      if (!found) {
        setSearchedSub(null);
        setError('No submission found matching this reference code in the database.');
      } else {
        setSearchedSub(found);
      }
    } catch (err: any) {
      setIsSearching(false);
      setError('Failed to query database. Please try again.');
    }
  };

  const handleExecuteWithdrawal = async () => {
    if (!searchedSub) return;
    setIsDeleting(true);
    try {
      const success = await withdrawSubmissionAsync(searchedSub.submissionCode);
      setIsDeleting(false);
      if (success) {
        setIsDeleted(true);
        setSearchedSub(undefined);
      } else {
        setError('Failed to purge data from database. Please try again.');
      }
    } catch {
      setIsDeleting(false);
      setError('Failed to purge data from database. Please try again.');
    }
  };

  const handleReset = () => {
    setCode('');
    setSearchedSub(undefined);
    setIsDeleted(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FFFDF7] rounded-t-3xl sm:rounded-3xl neo-card p-0 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#FFEFEA] border-b-2 border-black px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-2xl neo-card bg-[#121212] text-white flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-[#FF5A36]" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black font-serif text-[#121212]">Withdraw Submission</h3>
              <p className="text-[10px] sm:text-xs text-gray-700 font-bold">
                IRB Protocol #2026-SP84 Voluntary Exit
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="neo-btn bg-white p-1.5 text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
            You hold the right to unconditionally purge your qualitative recording and metadata from the research repository.
          </p>

          {!isDeleted ? (
            <>
              {/* Lookup form */}
              <form onSubmit={handleSearch} className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-800">
                  Enter Your Submission Code
                </label>
                <div className="flex flex-col xs:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SUB-8924"
                      className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-black font-mono text-sm uppercase font-black bg-white focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="neo-btn bg-[#121212] text-white px-4 py-3 text-xs flex items-center justify-center gap-1.5"
                  >
                    {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>{isSearching ? 'Searching...' : 'Find Code'}</span>
                  </button>
                </div>
              </form>

              {error && (
                <div className="p-3 rounded-xl neo-card-sm bg-[#FFEFEA] text-xs font-bold text-red-700 flex items-center gap-2 border-2 border-black">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Found Submission Details */}
              {searchedSub && (
                <div className="p-4 rounded-2xl neo-card-sm bg-white space-y-3 animate-fade-in border-2 border-black">
                  <div className="flex items-center justify-between border-b-2 border-gray-100 pb-2">
                    <span className="font-mono font-black text-sm sm:text-base text-[#FF5A36]">
                      {searchedSub.submissionCode}
                    </span>
                    <span className="neo-badge bg-[#D4EDDA] text-[#1E7E52] text-[10px] px-2 py-0.5">
                      Located in Database
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-gray-700 font-semibold">
                    <p><span className="text-black font-black">Media Type:</span> {searchedSub.mediaType === 'video_blurred' ? 'Blurred Video' : 'Audio-Only'}</p>
                    <p><span className="text-black font-black">Duration:</span> {searchedSub.durationSeconds}s</p>
                    <p><span className="text-black font-black">Submitted:</span> {new Date(searchedSub.submittedAt).toLocaleDateString()}</p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleExecuteWithdrawal}
                      disabled={isDeleting}
                      className="w-full py-3 neo-btn bg-[#EF4444] text-white text-xs flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000]"
                    >
                      {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      <span>{isDeleting ? 'Erasing from Cloudflare D1...' : 'Permanently Erase from Study'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-6 text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl neo-card bg-[#D4EDDA] text-[#1E7E52] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-black text-gray-900 text-base">Submission Permanently Erased</h4>
              <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed font-medium">
                Your qualitative recording has been deleted from repository storage.
              </p>
              <button
                onClick={handleReset}
                className="mt-2 neo-btn bg-[#121212] text-white px-5 py-2 text-xs"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FAF7F2] border-t-2 border-black px-4 sm:px-6 py-3 flex items-center justify-between text-xs font-bold text-gray-700">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-[#1E7E52]" />
            Unconditional Withdrawal
          </span>
          <button onClick={handleReset} className="underline">Close</button>
        </div>

      </div>
    </div>
  );
};
