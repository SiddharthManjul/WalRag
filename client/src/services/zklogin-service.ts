/**
 * zkLogin Service for Sui Authentication
 * Implements zkLogin flow for user authentication
 */

import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness } from '@mysten/sui/zklogin';
import { SuiClient } from '@mysten/sui/client';
import { ZKLOGIN_CONFIG } from '@/config/zklogin';

export interface ZkLoginSession {
  ephemeralPrivateKey: string;
  ephemeralPublicKey: string;
  nonce: string;
  randomness: string;
  maxEpoch: number;
  provider: string;
}

export interface ZkLoginAccount {
  userAddr: string;
  provider: string;
  email?: string;
  name?: string;
  picture?: string;
}

export class ZkLoginService {
  private suiClient: SuiClient;

  constructor() {
    this.suiClient = new SuiClient({
      url: 'https://fullnode.testnet.sui.io:443',
    });
  }

  /**
   * Start zkLogin flow - generates ephemeral keypair and redirects to OAuth
   */
  async startLoginFlow(provider: 'google'): Promise<void> {
    try {
      // Generate ephemeral keypair
      const ephemeralKeyPair = new Ed25519Keypair();
      const ephemeralPrivateKey = ephemeralKeyPair.getSecretKey();
      const ephemeralPublicKey = ephemeralKeyPair.getPublicKey();

      // Get current epoch for maxEpoch calculation
      const { epoch } = await this.suiClient.getLatestSuiSystemState();
      const maxEpoch = Number(epoch) + ZKLOGIN_CONFIG.maxEpoch;

      // Generate randomness and nonce
      const randomness = generateRandomness();
      const nonce = generateNonce(
        ephemeralPublicKey,
        maxEpoch,
        randomness
      );

      // Store session data in sessionStorage (temporary, for OAuth callback)
      const session: ZkLoginSession = {
        ephemeralPrivateKey: ephemeralPrivateKey,
        ephemeralPublicKey: ephemeralPublicKey.toSuiPublicKey(),
        nonce,
        randomness,
        maxEpoch,
        provider,
      };

      sessionStorage.setItem('zklogin_session', JSON.stringify(session));

      // Build OAuth URL
      const providerConfig = ZKLOGIN_CONFIG.providers[provider];
      const params = new URLSearchParams({
        client_id: providerConfig.clientId,
        redirect_uri: ZKLOGIN_CONFIG.redirectUrl,
        response_type: providerConfig.responseType,
        scope: providerConfig.scope,
        nonce: nonce,
      });

      // Redirect to OAuth provider
      const authUrl = `${providerConfig.authUrl}?${params.toString()}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to start zkLogin flow:', error);
      throw error;
    }
  }

  /**
   * Complete zkLogin flow - handles OAuth callback
   */
  async completeLoginFlow(jwt: string): Promise<ZkLoginAccount> {
    try {
      // Retrieve session data
      const sessionData = sessionStorage.getItem('zklogin_session');
      if (!sessionData) {
        throw new Error('No active zkLogin session found');
      }

      const session: ZkLoginSession = JSON.parse(sessionData);

      // Decode JWT to get user info (basic parsing, no verification needed for display)
      const jwtPayload = this.decodeJWT(jwt);

      // Generate user salt (for development, using a simple approach)
      // In production, this should be managed securely on the backend
      const salt = await this.getUserSalt(jwtPayload.sub);

      // Get zkLogin address
      const userAddr = await this.getZkLoginAddress(jwt, salt);

      // Store authentication data
      const account: ZkLoginAccount = {
        userAddr,
        provider: session.provider,
        email: jwtPayload.email,
        name: jwtPayload.name,
        picture: jwtPayload.picture,
      };

      // Store in localStorage for persistence
      localStorage.setItem('zklogin_account', JSON.stringify(account));
      localStorage.setItem('zklogin_jwt', jwt);
      localStorage.setItem('zklogin_salt', salt);

      // Clear session storage
      sessionStorage.removeItem('zklogin_session');

      return account;
    } catch (error) {
      console.error('Failed to complete zkLogin flow:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated account
   */
  getCurrentAccount(): ZkLoginAccount | null {
    const accountData = localStorage.getItem('zklogin_account');
    if (!accountData) {
      return null;
    }

    try {
      return JSON.parse(accountData);
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentAccount() !== null;
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('zklogin_account');
    localStorage.removeItem('zklogin_jwt');
    localStorage.removeItem('zklogin_salt');
    sessionStorage.removeItem('zklogin_session');
  }

  /**
   * Decode JWT (client-side only for display purposes)
   */
  private decodeJWT(jwt: string): any {
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = parts[1];
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf-8')
    );

    return decoded;
  }

  /**
   * Get user salt
   * In production, this should be fetched from a secure backend
   */
  private async getUserSalt(sub: string): Promise<string> {
    // For development: generate deterministic salt from subject
    // In production: fetch from secure backend or use user input
    const encoder = new TextEncoder();
    const data = encoder.encode(sub);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.slice(0, 32); // Use first 32 chars as salt
  }

  /**
   * Get zkLogin Sui address
   * This is a placeholder - in production, you would derive this properly
   */
  private async getZkLoginAddress(jwt: string, salt: string): Promise<string> {
    // For development: create a deterministic address
    // In production: use proper zkLogin address derivation
    const jwtPayload = this.decodeJWT(jwt);
    const combined = `${jwtPayload.sub}_${salt}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const addressHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Format as Sui address (0x + 64 hex chars)
    return '0x' + addressHex;
  }
}

// Export singleton instance
export const zkLoginService = new ZkLoginService();
