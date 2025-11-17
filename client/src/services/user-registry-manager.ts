/**
 * User Registry Manager
 * Maps zkLogin user addresses to their chat registry objects
 * Stores mapping in localStorage for client-side access
 */

import { ChatRegistryClient } from './chat-registry-client';

interface UserRegistryMapping {
  userAddress: string;
  registryId: string;
  createdAt: number;
}

const STORAGE_KEY = 'user_registry_mappings';

export class UserRegistryManager {
  private chatClient: ChatRegistryClient;
  private static instance: UserRegistryManager;

  constructor() {
    this.chatClient = new ChatRegistryClient();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): UserRegistryManager {
    if (!UserRegistryManager.instance) {
      UserRegistryManager.instance = new UserRegistryManager();
    }
    return UserRegistryManager.instance;
  }

  /**
   * Get or create registry for a user
   */
  async getOrCreateUserRegistry(userAddress: string): Promise<string> {
    // Check if registry exists in localStorage
    const existingRegistry = this.getUserRegistry(userAddress);

    if (existingRegistry) {
      console.log(`Found existing registry for user ${userAddress}: ${existingRegistry}`);
      return existingRegistry;
    }

    // Create new registry for user
    console.log(`Creating new registry for user ${userAddress}...`);
    const registryId = await this.chatClient.createRegistry();

    // Store mapping
    this.storeUserRegistry(userAddress, registryId);

    console.log(`Created registry ${registryId} for user ${userAddress}`);
    return registryId;
  }

  /**
   * Get user's registry ID from localStorage
   */
  getUserRegistry(userAddress: string): string | null {
    try {
      const mappings = this.getAllMappings();
      const mapping = mappings.find(m => m.userAddress === userAddress);
      return mapping?.registryId || null;
    } catch (error) {
      console.error('Error getting user registry:', error);
      return null;
    }
  }

  /**
   * Store user registry mapping
   */
  private storeUserRegistry(userAddress: string, registryId: string): void {
    try {
      const mappings = this.getAllMappings();

      // Remove existing mapping for this user
      const filtered = mappings.filter(m => m.userAddress !== userAddress);

      // Add new mapping
      filtered.push({
        userAddress,
        registryId,
        createdAt: Date.now(),
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error storing user registry:', error);
    }
  }

  /**
   * Get all registry mappings
   */
  private getAllMappings(): UserRegistryMapping[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading registry mappings:', error);
      return [];
    }
  }

  /**
   * Clear user's registry mapping
   */
  clearUserRegistry(userAddress: string): void {
    try {
      const mappings = this.getAllMappings();
      const filtered = mappings.filter(m => m.userAddress !== userAddress);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error clearing user registry:', error);
    }
  }

  /**
   * Clear all mappings (for logout)
   */
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing all mappings:', error);
    }
  }
}

// Export singleton instance
export const userRegistryManager = UserRegistryManager.getInstance();
