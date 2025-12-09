import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { fetchTransactionHistory } from '../services/alchemyService';
import { ArrowUpRight, ArrowDownLeft, Loader2, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';

export const TransactionHistory: React.FC = () => {
    const {
        address,
        selectedChain,
        transactions,
        setTransactions,
        isLoadingHistory,
        setLoadingHistory,
        historyError,
        setHistoryError,
        tokenPrices
    } = useStore();

    useEffect(() => {
        if (!address) {
            setTransactions([]);
            return;
        }

        const loadHistory = async () => {
            setLoadingHistory(true);
            setHistoryError(null);
            try {
                const rawTxs = await fetchTransactionHistory(address, selectedChain);

                // Fetch timestamps for blocks
                const provider = new ethers.BrowserProvider(window.ethereum || (window as any).mockProvider || { request: () => { } });

                const txsWithDetails = await Promise.all(rawTxs.map(async (tx: any) => {
                    let timestamp = Date.now();
                    try {
                        // Only try to fetch block if we have a real provider and it's not mock data
                        if (window.ethereum && tx.blockNum && !tx.blockNum.startsWith('0x1000')) {
                            const block = await provider.getBlock(tx.blockNum);
                            if (block) timestamp = block.timestamp * 1000;
                        }
                    } catch (e) {
                        // Ignore block fetch errors
                    }

                    const amount = parseFloat(tx.value?.toString() || '0');
                    const price = tokenPrices['ETH'] || 0; // Simplified: assuming ETH/Native token for now
                    const usdValue = (amount * price).toFixed(2);

                    return {
                        hash: tx.hash,
                        timestamp,
                        type: tx.type,
                        amount: amount.toString(),
                        currency: tx.asset || 'ETH',
                        usdValue,
                        otherParty: tx.type === 'sent' ? tx.to : tx.from,
                        status: 'confirmed' as const,
                        chain: selectedChain,
                        blockNum: parseInt(tx.blockNum, 16)
                    };
                }));

                setTransactions(txsWithDetails);
            } catch (err: any) {
                setHistoryError("Failed to load transactions. Please check your API key or network connection.");
            } finally {
                setLoadingHistory(false);
            }
        };

        loadHistory();
    }, [address, selectedChain, setTransactions, setLoadingHistory, setHistoryError, tokenPrices]);

    if (!address) {
        return (
            <div className="text-center py-10 text-gray-500">
                Please connect your wallet to view activity.
            </div>
        );
    }

    if (isLoadingHistory) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (historyError) {
        return (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                {historyError}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                No recent transactions found on {selectedChain}.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Activity</h3>
            <div className="space-y-3">
                {transactions.map((tx) => (
                    <div key={tx.hash} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${tx.type === 'sent' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                {tx.type === 'sent' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {tx.type === 'sent' ? 'Sent' : 'Received'} {tx.currency}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {tx.type === 'sent' ? 'To: ' : 'From: '}
                                    {tx.otherParty ? `${tx.otherParty.slice(0, 6)}...${tx.otherParty.slice(-4)}` : 'Unknown'}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-gray-900 dark:text-gray-100">
                                {tx.type === 'sent' ? '-' : '+'}{parseFloat(tx.amount).toFixed(4)} {tx.currency}
                            </div>
                            <div className="text-xs text-gray-500">
                                {tx.usdValue && `$${tx.usdValue}`} • {new Date(tx.timestamp).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
