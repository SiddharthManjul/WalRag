"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { UploadModeSelector, UploadMode } from "@/components/UploadModeSelector";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Upload,
  FileText,
  AlertCircle,
  Loader2,
  Wallet
} from "lucide-react";
import {
  SUPPORTED_FORMATS,
  getFormatName
} from "@/lib/supported-formats";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { uploadDocumentWithWallet } from "@/lib/wallet-upload-helper";

export default function UploadPage() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const [uploadMode, setUploadMode] = useState<UploadMode>('public');
  const [, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; blobId: string; txDigest?: string; isPrivate?: boolean } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const handleFileUpload = async (uploadedFiles: File[]) => {
    setError(null);
    setUploadSuccess(false);
    setUploadProgress('');
    setFiles(uploadedFiles);

    if (uploadedFiles.length === 0) return;

    if (!currentAccount) {
      setError('Please connect your wallet first');
      return;
    }

    const file = uploadedFiles[0];
    setUploading(true);

    try {
      const result = await uploadDocumentWithWallet(
        file,
        currentAccount.address,
        signAndExecuteTransaction,
        suiClient,
        {
          uploadMode, // Pass the selected upload mode
          onProgress: (progress) => {
            setUploadProgress(`${progress.stage}: ${progress.message}`);
          },
          onNeedsRegistry: async () => {
            return confirm(
              'You need to create a document registry first (one-time setup). ' +
              'This will cost a small gas fee (~0.002 SUI). Create now?'
            );
          },
        }
      );

      if (result.success) {
        setUploadSuccess(true);
        setUploadedFile({
          name: file.name,
          blobId: result.documentId || 'unknown',
          txDigest: result.transactionDigest,
          isPrivate: uploadMode === 'private',
        });
      } else {
        throw new Error(result.error || 'Upload failed');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadSuccess(false);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setUploadSuccess(false);
  };

  const resetUpload = () => {
    setFiles([]);
    setError(null);
    setUploadSuccess(false);
    setUploadedFile(null);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#3d3436] mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-[#3d3436] bg-clip-text text-transparent">
              Upload Your Documents
            </span>
          </h1>
          <p className="text-xl text-[#b35340] max-w-2xl mx-auto">
            Upload your documents to Storarc&apos;s decentralized storage. Your files will be securely stored on Walrus and indexed for AI-powered search.
          </p>
        </motion.div>

        {/* Wallet Connection Check */}
        {!currentAccount && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 flex items-center gap-4">
              <Wallet className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Wallet Connection Required</h3>
                <p className="text-sm text-muted-foreground">
                  Please connect your Sui wallet using the button in the top right corner to upload documents.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Supported Formats Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="border-2 border-[#b35340] rounded-xl p-6 shadow-lg bg-[#feb47b]">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#3d3436]" />
              Supported File Formats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Text Documents</h4>
                <div className="flex flex-wrap gap-2">
                  {SUPPORTED_FORMATS.TEXT.map((ext) => (
                    <span key={ext} className="px-2 py-1 bg-blue-500/10 text-[#3d3436] rounded text-sm">
                      {getFormatName(ext)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Office Documents</h4>
                <div className="flex flex-wrap gap-2">
                  {SUPPORTED_FORMATS.OFFICE.map((ext) => (
                    <span key={ext} className="px-2 py-1 bg-purple-500/10 text-[#3d3436] rounded text-sm">
                      {getFormatName(ext)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Data Formats</h4>
                <div className="flex flex-wrap gap-2">
                  {SUPPORTED_FORMATS.DATA.map((ext) => (
                    <span key={ext} className="px-2 py-1 bg-green-500/10 text-[#3d3436] rounded text-sm">
                      {getFormatName(ext)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Web Formats</h4>
                <div className="flex flex-wrap gap-2">
                  {SUPPORTED_FORMATS.WEB.map((ext) => (
                    <span key={ext} className="px-2 py-1 bg-orange-500/10 text-[#3d3436] rounded text-sm">
                      {getFormatName(ext)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Privacy Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-[#feb47b] border-2 border-[#b35340] rounded-xl p-6 shadow-lg">
            <UploadModeSelector
              mode={uploadMode}
              onChange={setUploadMode}
              disabled={uploading || !currentAccount}
            />
          </div>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-[#feb47b] border-2 border-[#b35340] rounded-xl shadow-lg overflow-hidden">
            <FileUpload
              onChange={handleFileUpload}
              onError={handleError}
              disabled={!currentAccount}
            />
          </div>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8"
            >
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 flex items-center gap-4">
                <Loader2 className="w-6 h-6 text-[#3d3436] animate-spin" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Uploading...</h3>
                  <p className="text-sm text-muted-foreground">
                    {uploadProgress || 'Processing your document and uploading to Walrus storage'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success State */}
        <AnimatePresence>
          {uploadSuccess && uploadedFile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8"
            >
              <div className="bg-[#feb47b] border-2 border-[#b35340] rounded-xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#ff7e5f]/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-[#ff7e5f]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#3d3436] mb-2 flex items-center gap-2">
                      Upload Successful!
                      {uploadedFile.isPrivate && (
                        <span className="px-3 py-1 text-xs bg-[#ff7e5f]/20 text-[#3d3436] rounded-full font-medium">
                          🔒 Encrypted
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-[#3d3436]/80 mb-4">
                      Your document has been {uploadedFile.isPrivate ? 'encrypted and ' : ''}uploaded to Walrus and registered on Sui blockchain.
                      {uploadedFile.isPrivate && ' Only you and users you grant access to can decrypt and view this document.'}
                    </p>
                    <div className="bg-[#ffedea] rounded-lg p-5 space-y-3 border border-[#b35340]/20">
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-sm font-semibold text-[#3d3436]">Filename:</span>
                        <span className="text-sm font-mono text-[#3d3436]/90 break-all text-right">{uploadedFile.name}</span>
                      </div>
                      <div className="border-t border-[#b35340]/10 pt-3">
                        <div className="flex justify-between items-start gap-4">
                          <span className="text-sm font-semibold text-[#3d3436]">Blob ID:</span>
                          <a
                            href={`https://walruscan.com/testnet/blob/${uploadedFile.blobId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono text-[#ff7e5f] hover:text-[#ff9a76] underline break-all text-right transition-colors"
                            title="View on Walrus Scan"
                          >
                            {uploadedFile.blobId}
                          </a>
                        </div>
                      </div>
                      {uploadedFile.txDigest && (
                        <div className="border-t border-[#b35340]/10 pt-3">
                          <div className="flex justify-between items-start gap-4">
                            <span className="text-sm font-semibold text-[#3d3436]">Transaction:</span>
                            <a
                              href={`https://suiscan.xyz/testnet/tx/${uploadedFile.txDigest}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-mono text-[#ff7e5f] hover:text-[#ff9a76] underline break-all text-right transition-colors"
                              title="View on Sui Scan"
                            >
                              {uploadedFile.txDigest}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={resetUpload}
                      className="mt-6 px-6 py-3 bg-[#ff7e5f] text-[#ffedea] rounded-lg hover:bg-[#ff9a76] transition-colors font-semibold shadow-md hover:shadow-lg"
                    >
                      Upload Another File
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8"
            >
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Upload Failed</h3>
                    <p className="text-sm text-red-600 dark:text-red-400 whitespace-pre-line">
                      {error}
                    </p>
                    <button
                      onClick={() => setError(null)}
                      className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-[#feb47b] rounded-xl p-6 shadow-lg border-2 border-[#b35340]">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#3d3436]" />
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-[#3d3436] font-bold mb-3">
                  1
                </div>
                <h4 className="font-semibold text-foreground mb-2">Upload</h4>
                <p className="text-sm text-muted-foreground">
                  Select or drag your document. Supported formats include PDF, Word, Text, and more.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-[#3d3436] font-bold mb-3">
                  2
                </div>
                <h4 className="font-semibold text-foreground mb-2">Sign Transaction</h4>
                <p className="text-sm text-muted-foreground">
                  Your wallet will prompt you to sign the transaction and pay a small gas fee.
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-[#3d3436] font-bold mb-3">
                  3
                </div>
                <h4 className="font-semibold text-foreground mb-2">Query</h4>
                <p className="text-sm text-muted-foreground">
                  Ask questions about your documents using natural language in the Chat page.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
