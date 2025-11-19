"use client";

import { useState, useEffect } from "react";
import { Copy, CheckCircle, ExternalLink, Wallet } from "lucide-react";
import { zkLoginService } from "@/services/zklogin-service";

export function WalletDisplay() {
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const account = zkLoginService.getCurrentAccount();

  useEffect(() => {
    if (account) {
      loadBalance();
    }
  }, [account]);

  const loadBalance = async () => {
    try {
      setLoading(true);
      const balanceInfo = await zkLoginService.checkBalance();
      // Convert from MIST to SUI (1 SUI = 1,000,000,000 MIST)
      const suiBalance = (parseInt(balanceInfo.balance) / 1_000_000_000).toFixed(4);
      setBalance(suiBalance);
    } catch (error) {
      console.error('Failed to load balance:', error);
      // Show placeholder instead of 0 when fetch fails
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  if (!account) return null;

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(account.userAddr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent/50 border border-border">
      {/* Wallet Icon */}
      <Wallet className="w-4 h-4 text-blue-500" />

      {/* Balance */}
      <div className="flex flex-col items-start">
        <span className="text-xs text-muted-foreground">Balance</span>
        <span className="text-sm font-semibold text-foreground">
          {loading ? '...' : balance !== null ? `${balance} SUI` : 'Check on Explorer'}
        </span>
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-border" />

      {/* Address */}
      <div className="flex flex-col items-start">
        <span className="text-xs text-muted-foreground">Address</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-foreground">
            {shortenAddress(account.userAddr)}
          </span>
          <button
            onClick={copyAddress}
            className="p-1 hover:bg-accent rounded transition-colors"
            title="Copy address"
          >
            {copied ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Links */}
      <div className="flex items-center gap-2">
        <a
          href={`https://suiscan.xyz/testnet/account/${account.userAddr}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-500/10 text-purple-500 rounded hover:bg-purple-500/20 transition-colors"
          title="View on Sui Explorer"
        >
          Explorer
          <ExternalLink className="w-3 h-3" />
        </a>
        <a
          href={`https://faucet.sui.io/`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20 transition-colors"
          title="Get testnet SUI"
        >
          Faucet
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
