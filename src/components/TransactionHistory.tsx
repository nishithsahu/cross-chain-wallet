import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { fetchTransactionHistory } from '../services/alchemyService';
import { ArrowUpRight, ArrowDownLeft, Loader2, AlertCircle } from 'lucide-react';

export const TransactionHistory: React.FC = () => {
    const {
        address,
        selectedChain,
        transactions,
        setTransactions,
        isLoadingHistory,
        setLoadingHistory,
        historyError,
        setHistoryError
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

                const formattedTxs = rawTxs.map((tx: any) => ({
                    hash: tx.hash,
                    timestamp: Date.now(), // Alchemy transfer API doesn't return timestamp directly without getBlock. We'll use a placeholder or fetch block.
                    // For minimal dashboard, we might skip exact timestamp or fetch it separately. 
                    // Let's just use blockNum for display if timestamp is missing.
                    type: tx.type,
                    amount: tx.value?.toString() || '0',
                    currency: tx.asset || 'ETH',
                    otherParty: tx.type === 'sent' ? tx.to : tx.from,
                    status: 'confirmed' as const, // Alchemy transfers are usually confirmed
                    chain: selectedChain,
                    blockNum: parseInt(tx.blockNum, 16)
                }));

                setTransactions(formattedTxs);
            } catch (err: any) {
                setHistoryError("Failed to load transactions. Please check your API key or network connection.");
            } finally {
                setLoadingHistory(false);
            }
        };

        loadHistory();
    }, [address, selectedChain, setTransactions, setLoadingHistory, setHistoryError]);

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
                                Block: {tx.blockNum}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
