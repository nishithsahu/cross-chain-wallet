import type { Chain } from '../store/useStore';

// In a real app, these should be in .env
// Using demo keys or placeholders. User should replace these.
const ALCHEMY_KEYS: Record<Chain, string> = {
    ethereum: 'demo', // Replace with real key
    polygon: 'demo',
    arbitrum: 'demo',
};

const ALCHEMY_URLS: Record<Chain, string> = {
    ethereum: 'https://eth-mainnet.g.alchemy.com/v2/',
    polygon: 'https://polygon-mainnet.g.alchemy.com/v2/',
    arbitrum: 'https://arb-mainnet.g.alchemy.com/v2/',
};

export interface TransactionData {
    hash: string;
    blockNum: string;
    uniqueId: string;
    from: string;
    to: string;
    value: number;
    erc721TokenId: string | null;
    erc1155Metadata: string | null;
    tokenId: string | null;
    asset: string;
    category: string;
    rawContract: {
        value: string;
        address: string | null;
        decimal: string;
    };
}

export const fetchTransactionHistory = async (address: string, chain: Chain) => {
    const apiKey = ALCHEMY_KEYS[chain];
    const baseUrl = ALCHEMY_URLS[chain];

    // Mock data generator
    const getMockData = () => [
        {
            hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            blockNum: "0x1000",
            uniqueId: "1",
            from: address,
            to: "0xRecipientAddressExample",
            value: 0.5,
            erc721TokenId: null,
            erc1155Metadata: null,
            tokenId: null,
            asset: "ETH",
            category: "external",
            rawContract: { value: "0x...", address: null, decimal: "18" },
            type: "sent"
        },
        {
            hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            blockNum: "0x0FFF",
            uniqueId: "2",
            from: "0xSenderAddressExample",
            to: address,
            value: 100,
            erc721TokenId: null,
            erc1155Metadata: null,
            tokenId: null,
            asset: "USDC",
            category: "erc20",
            rawContract: { value: "0x...", address: "0x...", decimal: "6" },
            type: "received"
        }
    ];

    if (!apiKey || apiKey === 'demo') {
        // If using demo key, we might want to just return mock data if the fetch fails
        // But let's try to fetch first
    }

    const url = `${baseUrl}${apiKey}`;

    const payload = {
        id: 1,
        jsonrpc: "2.0",
        method: "alchemy_getAssetTransfers",
        params: [
            {
                fromBlock: "0x0",
                toBlock: "latest",
                fromAddress: address,
                category: ["external", "erc20", "erc721", "erc1155"],
                withMetadata: true,
                excludeZeroValue: true,
                maxCount: "0xa", // Hex for 10
                order: "desc"
            }
        ]
    };

    // Also fetch 'toAddress' to get received transactions
    const payloadReceived = {
        ...payload,
        params: [{
            ...payload.params[0],
            fromAddress: undefined,
            toAddress: address
        }]
    };

    try {
        const [sentRes, receivedRes] = await Promise.all([
            fetch(url, { method: 'POST', body: JSON.stringify(payload) }).then(r => r.json()),
            fetch(url, { method: 'POST', body: JSON.stringify(payloadReceived) }).then(r => r.json())
        ]);

        // Check for Alchemy error response
        if (sentRes.error || receivedRes.error) {
            throw new Error(sentRes.error?.message || receivedRes.error?.message || "Alchemy API Error");
        }

        const sent = sentRes.result?.transfers || [];
        const received = receivedRes.result?.transfers || [];

        // Combine and sort by block number (descending)
        const all = [...sent.map((t: any) => ({ ...t, type: 'sent' })), ...received.map((t: any) => ({ ...t, type: 'received' }))]
            .sort((a, b) => parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16))
            .slice(0, 10);

        return all;
    } catch (error) {
        console.warn("Error fetching transactions, falling back to mock data:", error);
        return getMockData();
    }
};
