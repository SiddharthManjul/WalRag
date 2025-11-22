'use client';

import React, { useState } from 'react';
import { Lock, UserPlus, X, Copy, Check, ExternalLink } from 'lucide-react';

interface AccessControlPanelProps {
  documentId: string;
  documentName: string;
  owner: string;
  allowedUsers: string[];
  isPublic: boolean;
  policyId?: string;
  onGrantAccess?: (userAddress: string) => Promise<void>;
  onRevokeAccess?: (userAddress: string) => Promise<void>;
}

export function AccessControlPanel({
  documentId,
  documentName,
  owner,
  allowedUsers,
  isPublic,
  policyId,
  onGrantAccess,
  onRevokeAccess,
}: AccessControlPanelProps) {
  const [newUserAddress, setNewUserAddress] = useState('');
  const [isGranting, setIsGranting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleGrantAccess = async () => {
    if (!newUserAddress.trim() || !onGrantAccess) return;

    setIsGranting(true);
    try {
      await onGrantAccess(newUserAddress.trim());
      setNewUserAddress('');
    } catch (error) {
      console.error('Failed to grant access:', error);
    } finally {
      setIsGranting(false);
    }
  };

  const handleRevokeAccess = async (userAddress: string) => {
    if (!onRevokeAccess) return;

    if (confirm(`Are you sure you want to revoke access from ${userAddress}?`)) {
      try {
        await onRevokeAccess(userAddress);
      } catch (error) {
        console.error('Failed to revoke access:', error);
      }
    }
  };

  const copyShareableLink = () => {
    const link = `${window.location.origin}/document/${documentId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatAddress = (address: string) => {
    if (address.length < 16) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Lock className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">
              {documentName}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Owner: {formatAddress(owner)}
            </p>
            {policyId && (
              <p className="text-xs text-gray-500 mt-1">
                Policy ID: {formatAddress(policyId)}
              </p>
            )}
          </div>
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            isPublic
              ? 'bg-blue-500/10 text-blue-400'
              : 'bg-green-500/10 text-green-400'
          }`}
        >
          {isPublic ? 'Public' : 'Private'}
        </span>
      </div>

      {/* Access Control Section */}
      {!isPublic && (
        <>
          <div className="border-t border-gray-700 pt-6">
            <h4 className="text-sm font-medium text-gray-200 mb-4">
              Granted Access ({allowedUsers.length})
            </h4>

            {allowedUsers.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No users have been granted access yet
              </p>
            ) : (
              <div className="space-y-2">
                {allowedUsers.map((userAddress) => (
                  <div
                    key={userAddress}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-sm font-mono text-gray-300">
                        {formatAddress(userAddress)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRevokeAccess(userAddress)}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      title="Revoke access"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grant Access Form */}
          <div className="border-t border-gray-700 pt-6">
            <h4 className="text-sm font-medium text-gray-200 mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Grant New Access
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                value={newUserAddress}
                onChange={(e) => setNewUserAddress(e.target.value)}
                placeholder="Enter Sui address (0x...)"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                disabled={isGranting}
              />
              <button
                onClick={handleGrantAccess}
                disabled={!newUserAddress.trim() || isGranting}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGranting ? 'Granting...' : 'Grant'}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              This will require a wallet signature to update the access policy on-chain
            </p>
          </div>
        </>
      )}

      {/* Shareable Link */}
      <div className="border-t border-gray-700 pt-6">
        <button
          onClick={copyShareableLink}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-750 transition-colors"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              Link Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Shareable Link
            </>
          )}
        </button>

        {!isPublic && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Only users with granted access can view this document
          </p>
        )}
      </div>

      {/* View on Explorer */}
      {policyId && (
        <div className="border-t border-gray-700 pt-4">
          <a
            href={`https://suiscan.xyz/testnet/object/${policyId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Policy on Sui Explorer
          </a>
        </div>
      )}
    </div>
  );
}
