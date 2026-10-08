import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen || !type) return null;

  const isTerms = type === 'terms';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-greesal-dark/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-greesal-beige/80 max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-greesal-lightgreen flex items-center justify-center text-greesal-emerald">
              {isTerms ? <FileText className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            </div>
            <h3 className="text-xl font-bold text-greesal-dark font-sans">
              {isTerms ? 'Terms of Service' : 'Privacy Policy'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="my-4 overflow-y-auto pr-2 space-y-4 text-xs sm:text-sm text-greesal-muted leading-relaxed font-sans">
          {isTerms ? (
            <>
              <p className="font-semibold text-greesal-dark">
                Welcome to Greesal - Slice of Green.
              </p>
              <p>
                By accessing or ordering from our clean healthy food platform, you agree to abide by our terms. We prepare every salad bowl with 100% organic, locally-sourced ingredients.
              </p>
              <h4 className="font-bold text-greesal-forest text-sm pt-2">1. Account Authentication</h4>
              <p>
                Sign-in is securely handled via Google OAuth. You are responsible for protecting access to your account and providing accurate delivery details.
              </p>
              <h4 className="font-bold text-greesal-forest text-sm pt-2">2. Freshness & Quality Assurance</h4>
              <p>
                All Greesal salad bowls are prepared fresh upon order. Cancellations are valid within 5 minutes of placing your order to avoid food wastage.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-greesal-dark">
                Your Privacy is our Core Commitment.
              </p>
              <p>
                Greesal respects your personal data. When you log in with Google, we only request your basic profile (name, email, profile photo) to deliver your healthy food orders seamlessly.
              </p>
              <h4 className="font-bold text-greesal-forest text-sm pt-2">1. Data Encryption & Security</h4>
              <p>
                We never store passwords or sensitive financial details on our servers. All transactions use high-grade SSL encryption.
              </p>
              <h4 className="font-bold text-greesal-forest text-sm pt-2">2. Communication Preferences</h4>
              <p>
                We send order tracking notifications and optional daily nutrition tips. You may opt out of promotional messages anytime.
              </p>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-greesal-forest text-white font-semibold text-sm hover:bg-greesal-dark transition-colors shadow-sm"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
