import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useStore } from '../store/useStore';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export const useWallet = () => {
    const {
        setAddress,
        setConnected,
        setChainId,
        address,
        isConnected
    } = useStore();

    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connectWallet = useCallback(async () => {
        setIsConnecting(true);
        setError(null);

        if (!window.ethereum) {
            // Mock mode for development/demo
            console.warn("MetaMask not detected. Using mock wallet.");
            // Simulate delay
            setTimeout(() => {
                setAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
                setConnected(true);
                setChainId("1"); // Ethereum
                setIsConnecting(false);
            }, 1000);
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);

            if (accounts.length > 0) {
                setAddress(accounts[0]);
                setConnected(true);

                const network = await provider.getNetwork();
                setChainId(network.chainId.toString());
            }
        } catch (err: any) {
            console.error("Failed to connect wallet:", err);
            setError(err.message || "Failed to connect wallet");
        } finally {
            setIsConnecting(false);
        }
    }, [setAddress, setConnected, setChainId]);

    const disconnectWallet = useCallback(() => {
        setAddress(null);
        setConnected(false);
        setChainId(null);
    }, [setAddress, setConnected, setChainId]);

    useEffect(() => {
        if (window.ethereum) {
            // Check if already connected
            window.ethereum.request({ method: 'eth_accounts' })
                .then((accounts: string[]) => {
                    if (accounts.length > 0) {
                        setAddress(accounts[0]);
                        setConnected(true);

                        const provider = new ethers.BrowserProvider(window.ethereum);
                        provider.getNetwork().then(network => {
                            setChainId(network.chainId.toString());
                        });
                    }
                })
                .catch(console.error);

            // Listen for account changes
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length > 0) {
                    setAddress(accounts[0]);
                    setConnected(true);
                } else {
                    disconnectWallet();
                }
            };

            // Listen for chain changes
            const handleChainChanged = (chainId: string) => {
                // chainId is hex string
                setChainId(BigInt(chainId).toString());
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, [setAddress, setConnected, setChainId, disconnectWallet]);

    return {
        connectWallet,
        disconnectWallet,
        isConnecting,
        error,
        address,
        isConnected
    };
};
