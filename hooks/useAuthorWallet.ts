'use client';

import { useState, useCallback } from 'react';
import {
  isConnected,
  setAllowed,
  getAddress,
  getNetworkDetails,
} from '@stellar/freighter-api';

export interface AuthorWalletState {
  isInstalled: boolean;
  isConnecting: boolean;
  publicKey: string | null;
  network: string | null;
  error: string | null;
}

export interface AuthorWalletActions {
  connectForAuthor: () => Promise<{ success: boolean; address?: string }>;
  resetConnection: () => void;
}

export function useAuthorWallet(): AuthorWalletState & AuthorWalletActions {
  const [state, setState] = useState<AuthorWalletState>({
    isInstalled: false,
    isConnecting: false,
    publicKey: null,
    network: null,
    error: null,
  });

  // Connect to wallet specifically for author use (independent of reader wallet)
  const connectForAuthor = useCallback(async (): Promise<{ success: boolean; address?: string }> => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      // Check if wallet is installed first
      const connectionCheck = await isConnected();
      if (connectionCheck.error) {
        throw new Error('Freighter wallet not installed');
      }

      setState(prev => ({ ...prev, isInstalled: true }));

      // Request access - this will open Freighter and allow user to select account
      const allowResult = await setAllowed();
      if (allowResult.error) {
        throw new Error(allowResult.error);
      }

      if (allowResult.isAllowed) {
        // Get the selected address and network details
        const [publicKeyResult, networkResult] = await Promise.all([
          getAddress(),
          getNetworkDetails()
        ]);

        if (publicKeyResult.error) {
          throw new Error(publicKeyResult.error);
        }

        if (networkResult.error) {
          throw new Error(networkResult.error);
        }

        setState(prev => ({
          ...prev,
          isConnecting: false,
          publicKey: publicKeyResult.address,
          network: networkResult.network,
          error: null,
        }));

        return { success: true, address: publicKeyResult.address };
      } else {
        throw new Error('Wallet connection denied');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
      return { success: false };
    }
  }, []);

  // Reset connection state
  const resetConnection = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnecting: false,
      publicKey: null,
      network: null,
      error: null,
    }));
  }, []);

  return {
    ...state,
    connectForAuthor,
    resetConnection,
  };
}