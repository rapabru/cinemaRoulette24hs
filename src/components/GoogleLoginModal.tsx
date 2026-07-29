import React, { useState, useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';
import { createGoogleSession, getStoredGoogleUser } from '../lib/auth';
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
  const existingUser = getStoredGoogleUser();
  const [emailInput, setEmailInput] = useState(existingUser?.email || '');
  const [nameInput, setNameInput] = useState(existingUser?.displayName || '');

  useEffect(() => {
    if (isOpen) {
      const current = getStoredGoogleUser();
      if (current) {
        setEmailInput(current.email);
        setNameInput(current.displayName);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = emailInput.trim() ? (emailInput.includes('@') ? emailInput : `${emailInput}@gmail.com`) : 'usuario.cine@gmail.com';
    const finalName = nameInput.trim() || undefined;
    const user = createGoogleSession(finalEmail, finalName);
    onLoginSuccess(user);
    onClose();
  };

  const displayName = nameInput.trim() || (emailInput.trim() ? emailInput.split('@')[0] : 'tu cuenta');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-[#1e1f22] text-gray-100 rounded-2xl border border-gray-700/80 shadow-2xl overflow-hidden p-6 space-y-5">
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
              Sign in with Google
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Account Dynamic Card Preview */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#2b2d31] border border-gray-700/50">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-blue-500 bg-gray-950 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(emailInput || 'default')}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-sans font-semibold text-sm text-white truncate">
                {displayName}
              </h3>
              <p className="font-sans text-xs text-gray-400 truncate">
                {emailInput || 'Ingresa tu correo abajo'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans font-medium text-gray-300 mb-1">
              Tu Correo de Gmail:
            </label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="tu.cuenta@gmail.com"
              className="w-full bg-[#1e1f22] border border-gray-700 focus:border-blue-500 text-white font-sans text-xs px-3.5 py-2.5 rounded-lg outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-sans font-medium text-gray-300 mb-1">
              Tu Nombre de Usuario (Opcional):
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="ej. Juan Pérez"
              className="w-full bg-[#1e1f22] border border-gray-700 focus:border-blue-500 text-white font-sans text-xs px-3.5 py-2.5 rounded-lg outline-none transition-all"
            />
          </div>

          {/* Classic Google Blue Action Button */}
          <button
            type="submit"
            className="w-full bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#104a99] text-white font-sans font-semibold text-sm py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Continuar como {displayName}</span>
          </button>
        </form>

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
