'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useStellarWallet, StellarWalletState, StellarWalletActions } from '@/hooks/useStellarWallet';

type WalletContextType = StellarWalletState & StellarWalletActions;

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const wallet = useStellarWallet();

  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}