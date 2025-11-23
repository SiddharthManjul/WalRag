'use client';

import React from 'react';
import { Lock, Unlock, Info } from 'lucide-react';

export type UploadMode = 'public' | 'private';

interface UploadModeSelectorProps {
  mode: UploadMode;
  onChange: (mode: UploadMode) => void;
  disabled?: boolean;
}

export function UploadModeSelector({ mode, onChange, disabled }: UploadModeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[#3d3436]">
        Privacy Mode
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Public Upload Option */}
        <button
          type="button"
          onClick={() => onChange('public')}
          disabled={disabled}
          className={`
            relative flex items-start p-4 rounded-lg border-2 transition-all
            ${mode === 'public'
              ? 'border-[#ff7e5f] bg-[#ff7e5f]/20 shadow-lg'
              : 'border-[#3d3436]/20 bg-[#ffedea] hover:border-[#3d3436]/40'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center h-6">
            <input
              type="radio"
              checked={mode === 'public'}
              onChange={() => onChange('public')}
              disabled={disabled}
              className="h-4 w-4 text-[#ff7e5f] border-[#3d3436] focus:ring-[#ff7e5f]"
            />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Unlock className={`w-4 h-4 ${mode === 'public' ? 'text-[#ff7e5f]' : 'text-[#3d3436]/60'}`} />
              <span className={`text-sm font-medium ${mode === 'public' ? 'text-[#3d3436]' : 'text-[#3d3436]/80'}`}>
                Public Upload
              </span>
            </div>
            <ul className="text-xs text-[#3d3436]/70 space-y-1 mt-2">
              <li>• Anyone with link can access</li>
              <li>• Stored unencrypted</li>
              <li>• Faster processing</li>
              <li>• Lower gas costs</li>
            </ul>
          </div>
        </button>

        {/* Private Upload Option */}
        <button
          type="button"
          onClick={() => onChange('private')}
          disabled={disabled}
          className={`
            relative flex items-start p-4 rounded-lg border-2 transition-all
            ${mode === 'private'
              ? 'border-[#ff7e5f] bg-[#ff7e5f]/20 shadow-lg'
              : 'border-[#3d3436]/20 bg-[#ffedea] hover:border-[#3d3436]/40'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center h-6">
            <input
              type="radio"
              checked={mode === 'private'}
              onChange={() => onChange('private')}
              disabled={disabled}
              className="h-4 w-4 text-[#ff7e5f] border-[#3d3436] focus:ring-[#ff7e5f]"
            />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Lock className={`w-4 h-4 ${mode === 'private' ? 'text-[#ff7e5f]' : 'text-[#3d3436]/60'}`} />
              <span className={`text-sm font-medium ${mode === 'private' ? 'text-[#3d3436]' : 'text-[#3d3436]/80'}`}>
                Private Upload
              </span>
              <span className="px-2 py-0.5 text-xs bg-[#ff7e5f]/20 text-[#3d3436] rounded-full">
                Encrypted
              </span>
            </div>
            <ul className="text-xs text-[#3d3436]/70 space-y-1 mt-2">
              <li>• Only you and approved users</li>
              <li>• End-to-end encrypted (SEAL)</li>
              <li>• Requires wallet approval</li>
              <li>• Enterprise-level security</li>
            </ul>
          </div>
        </button>
      </div>

      {/* Info Banner for Private Mode */}
      {mode === 'private' && (
        <div className="flex items-start gap-2 p-3 bg-[#ff7e5f]/10 border border-[#ff7e5f]/30 rounded-lg">
          <Info className="w-4 h-4 text-[#ff7e5f] mt-0.5 shrink-0" />
          <div className="text-xs text-[#3d3436]">
            <p className="font-medium text-[#ff7e5f] mb-1">How Private Upload Works:</p>
            <p>
              Your document will be encrypted using SEAL (Simple Encrypted Application Library)
              before uploading to Walrus. Only you and users you explicitly grant access to will
              be able to decrypt and view the content. Access control is managed on the Sui blockchain.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
