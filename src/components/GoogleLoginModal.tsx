import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import { createGoogleSession } from '../lib/auth';
import type { GoogleUser } from '../lib/auth';

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: GoogleUser) => void;
}

export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [emailInput, setEmailInput] = useState('rapacinibruno@gmail.com');
  const [nameInput, setNameInput] = useState('Rapa !');
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const handleContinue = () => {
    const finalEmail = emailInput.trim() || 'rapacinibruno@gmail.com';
    const finalName = nameInput.trim() || 'Rapa !';
    const user = createGoogleSession(finalEmail, finalName);
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-[#1e1f22] text-gray-100 rounded-2xl border border-gray-700/80 shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            {/* Authentic Google G Logo */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-sm font-sans font-medium text-gray-200 truncate">
              Sign in to cinemaroulette with google.com
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Card */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-[#2b2d31] border border-gray-700/50">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 bg-gray-950 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(emailInput)}`}
              alt={nameInput}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback icon
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Nombre de usuario"
                  className="w-full bg-[#1e1f22] border border-blue-500 text-white font-sans text-xs px-2.5 py-1 rounded outline-none"
                />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="ejemplo@gmail.com"
                  className="w-full bg-[#1e1f22] border border-gray-600 text-gray-300 font-sans text-xs px-2.5 py-1 rounded outline-none"
                />
              </div>
            ) : (
              <div>
                <h3 className="font-sans font-semibold text-sm text-white truncate">
                  {nameInput}
                </h3>
                <p className="font-sans text-xs text-gray-400 truncate">
                  {emailInput}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-blue-400 hover:underline shrink-0 font-sans px-2 py-1"
          >
            {isEditing ? 'Guardar' : 'Cambiar'}
          </button>
        </div>

        {/* Classic Google Blue Action Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#104a99] text-white font-sans font-semibold text-sm py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          <span>Continue as {nameInput}</span>
        </button>

        {/* Authentic Google Privacy Disclaimer */}
        <p className="text-[11px] font-sans text-gray-400 leading-relaxed text-left border-t border-gray-800 pt-4">
          To continue, google.com will share your name, email address, and profile picture with this site. See this site's{' '}
          <span className="text-blue-400 hover:underline cursor-pointer">privacy policy</span> and{' '}
          <span className="text-blue-400 hover:underline cursor-pointer">terms of service</span>.
        </p>
      </div>
    </div>
  );
};
