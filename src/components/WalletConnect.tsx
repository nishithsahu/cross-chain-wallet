import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { Wallet, LogOut, Loader2 } from 'lucide-react';

export const WalletConnect: React.FC = () => {
    const { connectWallet, disconnectWallet, isConnecting, address, isConnected, error } = useWallet();

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Wallet className="w-4 h-4 text-gray-500" />
                    <span className="font-mono text-sm font-medium">{formatAddress(address)}</span>
                </div>
                <button
                    onClick={disconnectWallet}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    title="Disconnect"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-end gap-2">
            <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isConnecting ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Connecting...
                    </>
                ) : (
                    <>
                        <Wallet className="w-4 h-4" />
                        Connect Wallet
                    </>
                )}
            </button>
            {error && (
                <span className="text-xs text-red-500">{error}</span>
            )}
        </div>
    );
};
