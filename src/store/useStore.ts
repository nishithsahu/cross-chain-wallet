import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Chain = 'ethereum' | 'polygon' | 'arbitrum';

interface Transaction {
    hash: string;
    timestamp: number;
    type: 'sent' | 'received';
    amount: string;
    currency: string;
    usdValue?: string;
    otherParty: string; // sender or recipient
    status: 'pending' | 'confirmed' | 'failed';
    chain: Chain;
    blockNum?: number;
}

interface AppState {
    // Wallet
    address: string | null;
    isConnected: boolean;
    chainId: string | null;
    setAddress: (address: string | null) => void;
    setConnected: (isConnected: boolean) => void;
    setChainId: (chainId: string | null) => void;

    // Chain Selection
    selectedChain: Chain;
    setSelectedChain: (chain: Chain) => void;

    // Transactions
    transactions: Transaction[];
    isLoadingHistory: boolean;
    historyError: string | null;
    setTransactions: (transactions: Transaction[]) => void;
    setLoadingHistory: (loading: boolean) => void;
    setHistoryError: (error: string | null) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            // Wallet
            address: null,
            isConnected: false,
            chainId: null,
            setAddress: (address) => set({ address }),
            setConnected: (isConnected) => set({ isConnected }),
            setChainId: (chainId) => set({ chainId }),

            // Chain Selection
            selectedChain: 'ethereum',
            setSelectedChain: (selectedChain) => set({ selectedChain }),

            // Transactions
            transactions: [],
            isLoadingHistory: false,
            historyError: null,
            setTransactions: (transactions) => set({ transactions }),
            setLoadingHistory: (isLoadingHistory) => set({ isLoadingHistory }),
            setHistoryError: (historyError) => set({ historyError }),
        }),
        {
            name: 'cross-chain-wallet-storage',
            partialize: (state) => ({ selectedChain: state.selectedChain }), // Only persist selectedChain
        }
    )
);
