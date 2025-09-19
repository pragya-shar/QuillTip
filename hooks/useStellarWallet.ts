'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  isConnected,
  setAllowed,
  getAddress,
  signTransaction,
  getNetwork,
  getNetworkDetails,
  WatchWalletChanges
} from '@stellar/freighter-api';

export interface StellarWalletState {
  isInstalled: boolean;
  isConnected: boolean;
  isLoading: boolean;
  publicKey: string | null;
  readerWalletAddress: string | null;  // Separate reader wallet address
  network: string | null;
  networkPassphrase: string | null;
  error: string | null;
}

export interface StellarWalletActions {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
  refreshConnection: () => Promise<void>;
  setReaderWalletAddress: (address: string | null) => void;  // Method to update reader wallet
}

export function useStellarWallet(): StellarWalletState & StellarWalletActions {
  const [state, setState] = useState<StellarWalletState>({
    isInstalled: false,
    isConnected: false,
    isLoading: true,
    publicKey: null,
    readerWalletAddress: null,
    network: null,
    networkPassphrase: null,
    error: null,
  });

  // Check if wallet is installed and connected
  const checkWalletStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check if Freighter is installed
      const connectionCheck = await isConnected();
      const walletInstalled = !connectionCheck.error;
      const walletConnected = connectionCheck.isConnected;

      if (walletInstalled && walletConnected) {
        // Get public key and network details
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
          isInstalled: true,
          isConnected: true,
          isLoading: false,
          publicKey: publicKeyResult.address,
          network: networkResult.network,
          networkPassphrase: networkResult.networkPassphrase,
          error: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isInstalled: walletInstalled,
          isConnected: false,
          isLoading: false,
          publicKey: null,
          network: null,
          networkPassphrase: null,
          error: walletInstalled ? null : 'Freighter wallet not installed',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown wallet error'
      }));
    }
  }, []);

  // Connect to wallet
  const connect = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check if wallet is installed first
      const connectionCheck = await isConnected();
      if (connectionCheck.error) {
        throw new Error('Freighter wallet not installed');
      }

      // Request access
      const allowResult = await setAllowed();
      if (allowResult.error) {
        throw new Error(allowResult.error);
      }

      if (allowResult.isAllowed) {
        // Refresh wallet status after successful connection
        await checkWalletStatus();
        return true;
      } else {
        throw new Error('Wallet connection denied');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
      return false;
    }
  }, [checkWalletStatus]);

  // Disconnect wallet (clear local state)
  const disconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      isInstalled: true,
      isConnected: false,
      isLoading: false,
      publicKey: null,
      network: null,
      networkPassphrase: null,
      error: null,
    }));
  }, []);

  // Sign transaction
  const signTransactionXDR = useCallback(async (xdr: string): Promise<string> => {
    if (!state.isConnected || !state.networkPassphrase) {
      throw new Error('Wallet not connected');
    }

    const result = await signTransaction(xdr, {
      networkPassphrase: state.networkPassphrase,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result.signedTxXdr;
  }, [state.isConnected, state.networkPassphrase]);

  // Set reader wallet address
  const setReaderWalletAddress = useCallback((address: string | null) => {
    setState(prev => ({ ...prev, readerWalletAddress: address }));
    // Persist to localStorage
    if (address) {
      localStorage.setItem('readerWalletAddress', address);
    } else {
      localStorage.removeItem('readerWalletAddress');
    }
  }, []);

  // Refresh connection status
  const refreshConnection = useCallback(async () => {
    await checkWalletStatus();
  }, [checkWalletStatus]);

  // Initialize wallet check on mount and load reader wallet
  useEffect(() => {
    checkWalletStatus();
    // Load reader wallet address from localStorage
    const savedReaderWallet = localStorage.getItem('readerWalletAddress');
    if (savedReaderWallet) {
      setState(prev => ({ ...prev, readerWalletAddress: savedReaderWallet }));
    }
  }, [checkWalletStatus]);

  // Watch for wallet changes
  useEffect(() => {
    if (!state.isInstalled || !state.isConnected) return;

    const watcher = new WatchWalletChanges();

    watcher.watch((walletState) => {
      setState(prev => ({
        ...prev,
        publicKey: walletState.address,
        network: walletState.network,
        networkPassphrase: walletState.networkPassphrase,
      }));
    });

    return () => {
      watcher.stop();
    };
  }, [state.isInstalled, state.isConnected]);

  return {
    ...state,
    connect,
    disconnect,
    signTransaction: signTransactionXDR,
    refreshConnection,
    setReaderWalletAddress,
  };
}