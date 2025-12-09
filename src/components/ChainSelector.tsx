import React from 'react';
import { useStore, type Chain } from '../store/useStore';
import { useWallet } from '../hooks/useWallet';
import { Globe, ArrowRightLeft } from 'lucide-react';
import clsx from 'clsx';

const CHAINS: { id: Chain; name: string; chainId: number; rpcUrl: string }[] = [
    { id: 'ethereum', name: 'Ethereum', chainId: 1, rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo' },
    { id: 'polygon', name: 'Polygon', chainId: 137, rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/demo' },
    { id: 'arbitrum', name: 'Arbitrum', chainId: 42161, rpcUrl: 'https://arb-mainnet.g.alchemy.com/v2/demo' },
];

export const ChainSelector: React.FC = () => {
    const { selectedChain, setSelectedChain, chainId: walletChainId } = useStore();
    const { isConnected } = useWallet();

    const handleChainChange = (chain: Chain) => {
        setSelectedChain(chain);
    };

    const switchNetwork = async (targetChainId: number) => {
        if (!window.ethereum) return;
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${targetChainId.toString(16)}` }],
            });
        } catch (error: any) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (error.code === 4902) {
                // We could add logic to add the chain here, but for now just alert
                alert("Please add this network to your wallet manually.");
            } else {
                console.error(error);
            }
        }
    };

    const currentChain = CHAINS.find(c => c.id === selectedChain);
    const isWalletOnWrongChain = isConnected && walletChainId && currentChain && BigInt(walletChainId).toString() !== currentChain.chainId.toString();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Select Network</h2>
            </div>

            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
                {CHAINS.map((chain) => (
                    <button
                        key={chain.id}
                        onClick={() => handleChainChange(chain.id)}
                        className={clsx(
                            "px-4 py-2 rounded-md text-sm font-medium transition-all",
                            selectedChain === chain.id
                                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        )}
                    >
                        {chain.name}
                    </button>
                ))}
            </div>

            {isWalletOnWrongChain && (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Your wallet is on a different network.</span>
                    <button
                        onClick={() => currentChain && switchNetwork(currentChain.chainId)}
                        className="font-semibold underline hover:text-yellow-900"
                    >
                        Switch to {currentChain?.name}
                    </button>
                </div>
            )}
        </div>
    );
};
